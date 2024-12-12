class Projectile{
    constructor(playerID, x, y, radius, color, velX, velY, ctx) {
        this.playerID = playerID;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color; 
        this.velocityX = velX;
        this.velocityY = velY;
        this.ctx = ctx;
        this.frame = 0;
        this.projectileImgs = [];
        this.addProjectileImages();
    }

    addProjectileImages() {
        let folderPath;
        // set folder path to folder containing grey projectiles
        if (this.color == 'gray') {
            if (this.velocityX > 0) folderPath = '/greyProjectiles/right';
            else if (this.velocityX < 0) folderPath = '/greyProjectiles/left';
            else if (this.velocityY > 0) folderPath = '/greyProjectiles/down';
            else if (this.velocityY < 0) folderPath = '/greyProjectiles/up';
        }
        // set folder path to folder containing yellow projectiles
        else if (this.color == 'yellow'){
            if (this.velocityX > 0) folderPath = '/yellowProjectiles/right';
            else if (this.velocityX < 0) folderPath = '/yellowProjectiles/left';
            else if (this.velocityY > 0) folderPath = '/yellowProjectiles/down';
            else if (this.velocityY < 0) folderPath = '/yellowProjectiles/up';
        }
        // set folder path to folder containing dark red projectiles
        else if (this.color == 'darkred') {
            if (this.velocityX > 0) folderPath = '/darkRedProjectiles/right';
            else if (this.velocityX < 0) folderPath = '/darkRedProjectiles/left';
            else if (this.velocityY > 0) folderPath = '/darkRedProjectiles/down';
            else if (this.velocityY < 0) folderPath = '/darkRedProjectiles/up';
        }
        // set folder path to folder containing green projectiles
        else if (this.color == 'green') {
            if (this.velocityX > 0) folderPath = '/greenProjectiles/right';
            else if (this.velocityX < 0) folderPath = '/greenProjectiles/left';
            else if (this.velocityY > 0) folderPath = '/greenProjectiles/down';
            else if (this.velocityY < 0) folderPath = '/greenProjectiles/up';
        }
        else return;

        // load all images and add to projectile array
        for (let i = 0; i < 15; i++) {
            const img = new Image();
            img.src = `${folderPath}${i}.png`;
            img.onload = () => {
                this.projectileImgs.push(img);
            }
            img.onerror = (err) => {
                console.error('Failed to load image:', img.src, err);
            };
        }
    }

    draw() {
        // draw current projectile frame to create animation
        if (this.frame == 15) this.frame = 0;
        const img = this.projectileImgs[this.frame];
        if (!img) return; // Ensure image exists before drawing
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.projectileImgs[this.frame], this.x, this.y, 48, 48);
        this.frame++;
    }

    move() {
        // update projectile location and redraw 
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.draw();
    }

    willCollideWithPlayer(players) {
        let hitPlayer = null;
        for (const id in players) {
            // make sure player is not the one shooting
            if (id != this.playerID) { 
                const currentPlayer = players[id];
                const halfWidth = 14;
                const halfHeight = 19;
                const playerX = currentPlayer.x + halfWidth;
                const playerY = currentPlayer.y + halfHeight;

                if (this.x >= (playerX - 35) && this.x <= playerX - 5) {
                    if ((this.velocityX < 0 || this.velocityX > 0) && 
                        (this.y >= (playerY - 37) && this.y <= (playerY - 3))) {
                        hitPlayer = id;
                    } else if (this.velocityY < 0 && (this.y >= (playerY - 15) 
                                                   && this.y <= (playerY - 8))){
                        hitPlayer = id;
                    } else if (this.velocityY > 0 && (this.y >= (playerY - 30) 
                                                  && this.y <= (playerY - 10))){
                        hitPlayer = id;
                    }
                }
            }
        }

        return hitPlayer;
    }
}
