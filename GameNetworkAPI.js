class GameNetworkAPI {
    constructor() {
        this.socket = null; // Stores the WebSocket connection object

        // Stores the current game state information
        this.gameState = {
            players: {},
            localPlayerId: null,
        };

        // Stores event listeners for various game events
        this.eventListeners = {
            playerJoined: [],
            playerMoved: [],
            playerShot: [],
            playerHit: [],
            playerRemoved: [],
            gameStateUpdated: []
        };

        // Add new game management state
        this.gameState.availableGames = [];
        this.gameState.currentGameId = null;

        // Add new event listeners for game management
        this.eventListeners.gamesListed = [];
        this.eventListeners.gameCreated = [];
        this.eventListeners.gameJoined = [];
        this.eventListeners.gameExited = [];
        this.eventListeners.gameChat = [];
    }

     // Connects to the game server using a WebSocket
    connect(serverUrl = `ws://${window.location.hostname}:8765`) {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(serverUrl);

                this.socket.onopen = () => {
                    console.log('Connected to the game server');
                    resolve(this);
                };

                this.socket.onmessage = this._handleServerMessage.bind(this);

                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Method to send a chat message
    sendChatMessage(text, username) {
        console.log('Attempting to send chat message:', text, username);
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this._sendMessage({
                type: 'send_chat',
                text: text,
                username: username,
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('WebSocket is not open');
        }
    }

    listGames() {
        this._sendMessage({
            type: 'list_games'
        });
    }

    createGame(gameName = 'New Game', settings = {}) {
        this._sendMessage({
            type: 'create_game',
            game_name: gameName,
            settings: settings
        });
    }

    joinGame(gameId) {
        this._sendMessage({
            type: 'join_game',
            game_id: gameId
        });
    }

    exitGame() {
        if (!this.gameState.currentGameId) {
            console.warn('Not currently in a game');
            return;
        }

        this._sendMessage({
            type: 'exit_game'
        });
    }

    // Internal method to handle incoming server messages
    _handleServerMessage(event) {
        const message = JSON.parse(event.data);

        switch (message.type) {
            case 'player_joined':
                // Update player information and set local player ID if needed
                this.gameState.players[message.player_id] = message.player;
                if (this.gameState.localPlayerId === null) {
                    this.gameState.localPlayerId = message.player_id;
                }
                this._triggerEvent('playerJoined', message);
                break;

            case 'update_players':
                // Update all player information in the game state
                Object.assign(this.gameState.players, message.players);
                this._triggerEvent('gameStateUpdated', this.gameState);
                break;

            case 'player_shot':
                // Trigger a player shot event with player information and direction
                this._triggerEvent('playerShot', {
                    player: this.gameState.players[message.player],
                    playerID: message.player,
                    direction: message.direction
                });
                break;

            case 'player_hit':
                this._triggerEvent('playerHit', message.player);
                break;

            case 'player_left':
            case 'player_eliminated':
                // Remove player information from the game state and update
                delete this.gameState.players[message.player];
                this._triggerEvent('playerRemoved', message.player);
                break;
            
            case 'games_list':
                this.gameState.availableGames = message.games;
                this._triggerEvent('gamesListed', message.games);
                break;
    
            case 'game_created':
                this.gameState.currentGameId = message.game_id;
                this._triggerEvent('gameCreated', message.game || {}); // Default to empty object
                break;
    
            case 'game_join_result':
                if (message.success) {
                    this.gameState.currentGameId = message.game_id;
                    this._triggerEvent('gameJoined', message.game_id);
                } else {
                    console.warn('Failed to join game');
                }
                break;
            
            case 'game_exit_confirmed':
                // Reset game state
                this.gameState.currentGameId = null;
                delete this.gameState.players[message.player_id];
                 
                // Trigger game exit event
                this._triggerEvent('gameExited', message.player_id);
                break;

            case 'game_chat':
                this._triggerEvent('gameChat', message.message);
                break;
        }
    }

    // Specific listener for player chat
    addChatListener(callback) {
        this.addEventListener('gameChat', callback);
    }

    // Sends a move command to the server with delta x and y values
    sendMove(dx, dy, animation, frame) {
        this._sendMessage({
            type: 'move',
            dx: dx,
            dy: dy,
            animation: animation,
            frame: frame
        });
    }

    // Sends a shot command to the server with the direction
    sendShot(direction, shotsTaken) {
        this._sendMessage({
            type: 'shot',
            shotsTaken: shotsTaken,
            direction: direction
        });
    }
    
    sendHit(hitPlayer) {
        this._sendMessage({
            type: 'hit',
            player: hitPlayer
        })
    }

    // Internal method to send messages to the game server
    _sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open');
        }
    }

    // Adds a listener for a specific game event
    addEventListener(eventName, callback) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].push(callback);
        } else {
            console.warn(`Unknown event: ${eventName}`);
        }
    }

    // Specific Listener for exiting a game
    addExitGameListener(callback) {
        this.addEventListener('gameExited', callback);
    }

    // Triggers an event with data for any registered listeners
    _triggerEvent(eventName, data) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                callback(data);
            });
        }
    }

    // Gets a copy of the current game state
    getGameState() {
        return { ...this.gameState };
    }

    // Get the local player's information
    getLocalPlayer() {
        return this.gameState.players[this.gameState.localPlayerId] || null;
    }
}

// Export as a module
export default GameNetworkAPI;