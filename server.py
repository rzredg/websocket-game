import base64
import hashlib
import socket
import threading
import json
import random
import uuid

playerNum = 0

class WebSocketServer:
    def __init__(self, local_ip, port=8765):
        self.local_ip = local_ip
        self.port = port
        self.clients = []  # List of connected clients
        self.lock = threading.Lock()  # Ensures thread-safe operations
        self.players = {}  # Dictionary to hold player states
        self.playerShots = {} # number of shots player has taken
        self.games = {}  # Dictionary to track active games
        self.game_chats = {}  # Store chats for each game

        # Define canvas boundaries
        self.CANVAS_WIDTH = 1200
        self.CANVAS_HEIGHT = 800
        self.PLAYER_SIZE = 30  # Player rectangle size

    def handle_handshake(self, conn):
        request = conn.recv(1024).decode('utf-8')
        if "Upgrade: websocket" in request:
            key = None
            for line in request.split("\r\n"):
                if line.startswith("Sec-WebSocket-Key:"):
                    key = line.split(": ")[1].strip()
                    break
            if key:
                accept_key = base64.b64encode(
                    hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode('utf-8')).digest()
                ).decode('utf-8')
                response = (
                    "HTTP/1.1 101 Switching Protocols\r\n"
                    "Upgrade: websocket\r\n"
                    "Connection: Upgrade\r\n"
                    f"Sec-WebSocket-Accept: {accept_key}\r\n\r\n"
                )
                conn.sendall(response.encode('utf-8'))
                return True
        return False

    def decode_websocket_frame(self, data):
        """
        Decode WebSocket frame according to RFC 6455
        """
        # First byte: FIN bit and opcode
        first_byte = data[0]
        opcode = first_byte & 0x0F
        
        # If it's a close frame or non-text frame, return None
        if opcode != 0x1:  # 0x1 is text frame
            return None

        # Second byte: Mask bit and payload length
        second_byte = data[1]
        is_masked = second_byte & 0x80
        payload_length = second_byte & 0x7F

        # Calculate payload start and mask
        if payload_length == 126:
            payload_start = 4
            payload_length = int.from_bytes(data[2:4], 'big')
        elif payload_length == 127:
            payload_start = 10
            payload_length = int.from_bytes(data[2:10], 'big')
        else:
            payload_start = 2

        # Check if message is masked (client to server messages are masked)
        if is_masked:
            mask = data[payload_start:payload_start + 4]
            payload_start += 4
            
            # Unmask the payload
            payload = bytearray(data[payload_start:payload_start + payload_length])
            for i in range(len(payload)):
                payload[i] ^= mask[i % 4]
        else:
            payload = data[payload_start:payload_start + payload_length]

        return payload.decode('utf-8')

    def encode_websocket_frame(self, message):
        """
        Encode message into a WebSocket frame
        """
        message_bytes = message.encode('utf-8')
        frame = bytearray()
        
        # First byte: FIN bit set (0x80) and opcode for text frame (0x1)
        frame.append(0x81)
        
        # Payload length
        if len(message_bytes) <= 125:
            frame.append(len(message_bytes))
        elif len(message_bytes) <= 65535:
            frame.append(126)
            frame.extend(len(message_bytes).to_bytes(2, 'big'))
        else:
            frame.append(127)
            frame.extend(len(message_bytes).to_bytes(8, 'big'))
        
        # Add payload
        frame.extend(message_bytes)
        return frame

    def broadcast(self, message):
        """Send a message to all connected clients."""
        encoded_message = self.encode_websocket_frame(json.dumps(message))
        with self.lock:
            for client in self.clients:
                try:
                    client.sendall(encoded_message)
                except Exception as e:
                    print(f"Error sending to client: {e}")
                    self.clients.remove(client)

    def broadcast_chat(self, game_id, message):
        """
        Broadcast a chat message to all players in a specific game
        """
        chat_message = {
            'type': 'game_chat',
            'game_id': game_id,
            'message': message
        }
        # Only send to players in the same game
        with self.lock:
            for client in self.clients:
                try:
                    encoded_message = self.encode_websocket_frame(json.dumps(chat_message))
                    client.sendall(encoded_message)
                except Exception as e:
                    print(f"Error sending chat message: {e}")

    def create_game(self, creator_id, game_name, game_settings=None):
        """
        Create a new game and return its unique identifier
        """
        game_id = str(uuid.uuid4())
        default_settings = {
            'name': game_name,
            'max_players': 4,
            'creator': creator_id,
            'players': [creator_id],
            'status': 'waiting'
        }
        
        self.games[game_id] = default_settings
        
        # Broadcast game creation to all clients
        self.broadcast({
            'type': 'game_created',
            'game': default_settings,
            'game_id': game_id
        })
        
        return game_id

    def list_games(self):
        """
        Return a list of available games
        """
        return [
            {
                'id': game_id, 
                'name': game_info['name'], 
                'players_count': len(game_info['players']),
                'max_players': game_info['max_players'],
                'status': game_info['status']
            } 
            for game_id, game_info in self.games.items()
        ]

    def join_game(self, player_id, game_id):
        """
        Allow a player to join a specific game
        """
        if game_id not in self.games:
            return False

        game = self.games[game_id]
        
        if len(game['players']) >= game['max_players']:
            return False

        if player_id not in game['players']:
            game['players'].append(player_id)

        # Broadcast game update to all clients
        self.broadcast({
            'type': 'game_updated',
            'game_id': game_id,
            'game': game
        })

        return True
    
    # Method to handle player exit
    def exit_game(self, player_id):
        """
        Handle player exit from a game, removing them from game and players list
        """
        # Find the game the player is in
        game_to_remove = None
        for game_id, game_info in self.games.items():
            if player_id in game_info['players']:
                game_info['players'].remove(player_id)
                
                # If no players left in the game, remove the game
                if not game_info['players']:
                    game_to_remove = game_id
                
                # Broadcast player exit to remaining players
                self.broadcast({
                    'type': 'player_left',
                    'player': player_id,
                    'game_id': game_id
                })
                break
        
        # Remove the game if no players remain
        if game_to_remove:
            del self.games[game_to_remove]
        
        # Remove player from players and shots tracking
        if player_id in self.players:
            del self.players[player_id]
        
        if player_id in self.playerShots:
            del self.playerShots[player_id]

    def handle_client(self, conn, addr):
        """
        Handles messages coming in from the client, parses them in JSON format 
        """
        print(f"New connection from {addr}")
        if not self.handle_handshake(conn):
            conn.close()
            return

        with self.lock:
            self.clients.append(conn)

        # Use UUID for unique, consistent player identification
        player_id = str(uuid.uuid4())
        frame = 0
        color = ""
        global playerNum
        x = None
        y = None
        playerNum += 1
        animation = ""

        # Assigning player attributes
        if (playerNum == 1) : 
            frame = 9
            animation = "standright"
            color = "gray"
            x = 30
            y = 381
        elif (playerNum == 2) :
            animation = "standdown"
            frame = 1
            color = "yellow"
            x = 577
            y = 30
        elif (playerNum == 3) :
            animation = "standleft"
            frame = 5
            color = "darkred"
            x = 1140
            y = 381
        elif (playerNum == 4) :
            frame = 13
            animation = "standup"
            color = "green"
            playerNum -= 4
            x = 577
            y = 740
        
        self.players[player_id] = {
            'id': player_id,  # Explicit ID in player state
            'x': x,
            'y': y,
            'color': color,
            'lives': 3,
            'game_id': None,  # Add game ID tracking,
            'animation': animation,
            'frame': frame
        }

        # initialize shotsTaken for each player
        self.playerShots[player_id] = {
            'shotsTaken': 0
        }

        # Notify other players about the new player
        self.broadcast({
            'type': 'player_joined',
            'player_id': player_id,
            'player': self.players[player_id]
        })

        try:
            while True:
                frame = conn.recv(1024)
                if not frame:
                    break

                try:
                    decoded_message = self.decode_websocket_frame(frame)
                    if decoded_message is None:
                        continue

                    message = json.loads(decoded_message)
                    print(f"Received message: {message}")

                    if message['type'] == 'list_games':
                        available_games = self.list_games()
                        response = {
                            'type': 'games_list',
                            'games': available_games
                        }
                        encoded_response = self.encode_websocket_frame(json.dumps(response))
                        conn.sendall(encoded_response)

                    elif message['type'] == 'create_game':
                        game_id = self.create_game(
                            creator_id=player_id, 
                            game_name=message.get('game_name', 'New Game'),
                            game_settings=message.get('settings', {})
                        )
                        response = {
                            'type': 'game_created',
                            'game_id': game_id
                        }
                        encoded_response = self.encode_websocket_frame(json.dumps(response))
                        conn.sendall(encoded_response)

                    elif message['type'] == 'join_game':
                        success = self.join_game(
                            player_id=player_id, 
                            game_id=message['game_id']
                        )
                        if success:
                            self.players[player_id]['game_id'] = message['game_id']
                        
                        response = {
                            'type': 'game_join_result',
                            'success': success,
                            'game_id': message['game_id']
                        }
                        encoded_response = self.encode_websocket_frame(json.dumps(response))
                        conn.sendall(encoded_response)
                    
                    elif message['type'] == 'send_chat':
                        # Always allow chat, regardless of game status
                        chat_message = {
                            'player_id': player_id,
                            'username': message.get('username', 'Player'),
                            'text': message.get('text', ''),
                            'timestamp': message.get('timestamp')
                        }
                        
                        # Get current game ID if player is in a game
                        current_game_id = self.players.get(player_id, {}).get('game_id')
                        
                        # Broadcast chat - pass game_id if in a game, otherwise None for global chat
                        self.broadcast_chat(current_game_id, chat_message)

                    elif message['type'] == 'move':
                        # Verify the player is in a game
                        current_game_id = self.players.get(player_id, {}).get('game_id')
                        if current_game_id:
                            # Calculate new position
                            new_x = self.players[player_id]['x'] + message['dx']
                            new_y = self.players[player_id]['y'] + message['dy']

                            # Boundary checking
                            new_x = max(0, min(new_x, self.CANVAS_WIDTH - self.PLAYER_SIZE))
                            new_y = max(0, min(new_y, self.CANVAS_HEIGHT - self.PLAYER_SIZE))

                            # Update player position
                            self.players[player_id]['x'] = new_x
                            self.players[player_id]['y'] = new_y
                            self.players[player_id]['animation'] = message['animation']
                            self.players[player_id]['frame'] = message['frame']

                            # Broadcast only players in the same game
                            game_players = {
                                pid: player for pid, player in self.players.items() 
                                if player.get('game_id') == current_game_id
                            }

                            self.broadcast({
                                'type': 'update_players',
                                'players': game_players
                            })

                    elif message['type'] == 'shot':
                        self.playerShots[player_id] = message['shotsTaken']
                        if (self.playerShots[player_id] < 5):
                            # 5 projectiles per player on screen at once
                            self.broadcast({
                                'type': 'player_shot',
                                'direction': message['direction'],
                                'player': player_id 
                            })
                    
                    elif message['type'] == 'hit':
                        hitPlayer = message['player']
                        self.players[hitPlayer]['lives'] -= 1
                        print(self.players[hitPlayer]['lives'])
                        if (self.players[hitPlayer]['lives'] > 0):
                            # player was hit, update lives
                            self.broadcast({
                                'type': 'player_hit',
                                'player': hitPlayer 
                            })
                        else:
                            # player was hit and died, remove player
                            del self.players[hitPlayer]
                            self.broadcast({
                                'type': 'player_eliminated',
                                'player': hitPlayer 
                            })
                    elif message['type'] == 'exit_game':
                        self.exit_game(player_id)
                        
                        # Send confirmation of exit
                        response = {
                            'type': 'game_exit_confirmed',
                            'player_id': player_id
                        }
                        encoded_response = self.encode_websocket_frame(json.dumps(response))
                        conn.sendall(encoded_response)
                        break  # Close the connection

                except (json.JSONDecodeError, KeyError) as e:
                    print(f"Error parsing message: {e}")

        except Exception as e:
            print(f"Error with client {addr}: {e}")
        finally:
            with self.lock:
                if conn in self.clients:
                    self.clients.remove(conn)
            conn.close()

    def start_server(self):
        """
        Starts a WebSocket server using an underlying TCP connection
        """
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket: # Creates TCP socket
            server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1) # Allows socket reuse
            server_socket.bind((self.local_ip, self.port)) # Binds the socket to the port
            server_socket.listen(5) # Listens for incoming connections
            print(f"WebSocket server started on ws://{self.local_ip}:{self.port}")

            while True:
                conn, addr = server_socket.accept() # Accepts incoming clients
                # Multithreading enabled to have n > 1 clients running simultaneously
                threading.Thread(target=self.handle_client, args=(conn, addr), daemon=True).start()

if __name__ == "__main__":
    local_ip = socket.gethostbyname(socket.gethostname())
    server = WebSocketServer(local_ip)
    server.start_server()
