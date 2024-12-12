import { resources } from "./Resource.js";
import { Vector2 } from "./vector2.js";
import { Sprite } from "./sprite.js";

class Arena {
    constructor(canvasID) {
        this.canvas = document.querySelector(canvasID);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.ground = new Sprite({
            resource: resources.images.ground,
            frameSize: new Vector2(16, 16),
            scale: 5
        });

        this.wall = new Sprite({
            resource: resources.images.walls,
            frameSize: new Vector2(16, 16),
            hFrames: 16,
            vFrames: 16,
            scale: 3,
            frame: 0
        });

        this.player1 = new Sprite({
            resource: resources.images.player1,
            frameSize: new Vector2(48, 48),
            hFrames: 4,
            vFrames: 4,
            frame: 0,
        });

        this.player2 = new Sprite({
            resource: resources.images.player2,
            frameSize: new Vector2(48, 48),
            hFrames: 4,
            vFrames: 4,
            frame: 0,
        });

        this.player3 = new Sprite({
            resource: resources.images.player3,
            frameSize: new Vector2(48, 48),
            hFrames: 4,
            vFrames: 4,
            frame: 5,
        });

        this.player4 = new Sprite({
            resource: resources.images.player4,
            frameSize: new Vector2(48, 48),
            hFrames: 4,
            vFrames: 4,
            frame: 13,
        });

        this.wallSize = 16 * this.wall.scale;

        // top walls
        this.wall1 = new Vector2(472, 100);
        this.wall2 = new Vector2(520, 100);
        this.wall3 = new Vector2(568, 100);
        this.wall4 = new Vector2(616, 100);
        this.wall5 = new Vector2(664, 100);

        // bottom walls
        this.wall6 = new Vector2(472, 656);
        this.wall7 = new Vector2(520, 656);
        this.wall8 = new Vector2(568, 656);
        this.wall9 = new Vector2(616, 656);
        this.wall10 = new Vector2(664, 656);

        // left walls
        this.wall11 = new Vector2(100, 276);
        this.wall12 = new Vector2(100, 324);
        this.wall13 = new Vector2(100, 372);
        this.wall14 = new Vector2(100, 420);
        this.wall15 = new Vector2(100, 468);

        // right walls
        this.wall16 = new Vector2(1052, 276);
        this.wall17 = new Vector2(1052, 324);
        this.wall18 = new Vector2(1052, 372);
        this.wall19 = new Vector2(1052, 420);
        this.wall20 = new Vector2(1052, 468);

        // middle walls
        this.wall21 = new Vector2(552, 352);
        this.wall22 = new Vector2(600, 352);
        this.wall23 = new Vector2(552, 400);
        this.wall24 = new Vector2(600, 400);

        // top left of middle
        this.wall25 = new Vector2(504, 256);
        this.wall26 = new Vector2(456, 256);
        this.wall27 = new Vector2(456, 304);

        // top right of middle
        this.wall28 = new Vector2(648, 256);
        this.wall29 = new Vector2(696, 256);
        this.wall30 = new Vector2(696, 304);

        // bottom left of middle
        this.wall31 = new Vector2(456, 448);
        this.wall32 = new Vector2(456, 496);
        this.wall33 = new Vector2(504, 496);

        // bottom right of middle
        this.wall34 = new Vector2(696, 448);
        this.wall35 = new Vector2(696, 496);
        this.wall36 = new Vector2(648, 496);



        this.walls = new Set([this.wall1, this.wall2, this.wall3, this.wall4,
                              this.wall5, this.wall6, this.wall7, this.wall8,
                              this.wall9, this.wall10, this.wall11, this.wall12,
                              this.wall13, this.wall14, this.wall15, this.wall16,
                              this.wall17, this.wall18, this.wall19, this.wall20,
                              this.wall21, this.wall22, this.wall23, this.wall24,
                              this.wall25, this.wall26, this.wall27, this.wall28,
                              this.wall29, this.wall30, this.wall31, this.wall32,
                              this.wall33, this.wall34, this.wall35, this.wall36]);
        
        this.greyHeart = new Sprite({
            resource: resources.images.fullGreyHeart,
            frameSize: new Vector2(16, 16),
            scale: 3
        })
    
        this.yellowHeart = new Sprite({
            resource: resources.images.fullYellowHeart,
            frameSize: new Vector2(16, 16),
            scale: 3
        })
    
        this.darkRedHeart = new Sprite({
            resource: resources.images.fullDarkRedHeart,
            frameSize: new Vector2(16, 16),
            scale: 3
        })
    
        this.greenHeart = new Sprite({
            resource: resources.images.fullGreenHeart,
            frameSize: new Vector2(16, 16),
            scale: 3
        })

        this.greyHeartOne = new Vector2(20, 20);
        this.greyHeartTwo = new Vector2(70, 20);
        this.greyHeartThree = new Vector2(120, 20);

        this.yellowHeartOne = new Vector2(1032, 20);
        this.yellowHeartTwo = new Vector2(1082, 20);
        this.yellowHeartThree = new Vector2(1132, 20);

        this.darkRedHeartOne = new Vector2(1032, 732);
        this.darkRedHeartTwo = new Vector2(1082, 732);
        this.darkRedHeartThree = new Vector2(1132, 732);

        this.greenHeartOne = new Vector2(20, 732);
        this.greenHeartTwo = new Vector2(70, 732);
        this.greenHeartThree = new Vector2(120, 732);

        this.greyHearts = new Set([this.greyHeartOne, this.greyHeartTwo, this.greyHeartThree]);
        this.yellowHearts = new Set([this.yellowHeartOne, this.yellowHeartTwo, this.yellowHeartThree]);
        this.darkRedHearts = new Set([this.darkRedHeartOne, this.darkRedHeartTwo, this.darkRedHeartThree]);
        this.greenHearts = new Set([this.greenHeartOne, this.greenHeartTwo, this.greenHeartThree]);
    }

    draw = (player) => {
        let frame = player.frame;

        if (player.color == "gray") {
            this.player1.frame = frame;
            this.player1.drawPlayer(this.ctx, player.x, player.y, player.animation, player.color);
        }
        if (player.color == "yellow") {
            this.player2.frame = frame;
            this.player2.drawPlayer(this.ctx, player.x, player.y, player.animation, player.color);
        }
        if (player.color == "darkred") {
            this.player3.frame = frame;
            this.player3.drawPlayer(this.ctx, player.x, player.y, player.animation, player.color);
        }
        if (player.color == "green") {
            this.player4.frame = frame;
            this.player4.drawPlayer(this.ctx, player.x, player.y, player.animation, player.color);
        }

        this.walls.forEach((coordinate) => {
            this.wall.drawImage(this.ctx, coordinate.x, coordinate.y);
        });
    }

    drawGreyHearts = (player) => {
        this.greyHearts.forEach((coordinate) => {
            if ((player.lives <= 2 && coordinate == this.greyHeartThree) ||
                 player.lives <= 1 && coordinate == this.greyHeartTwo ||
                 player.lives == 0 && coordinate == this.greyHeartOne) {
                this.greyHeart.resource = resources.images.emptyGreyHeart;
            } else {
                this.greyHeart.resource = resources.images.fullGreyHeart;
            }
            this.greyHeart.drawImage(this.ctx, coordinate.x, coordinate.y);
        });
    }

    drawYellowHearts = (player) => {
        this.yellowHearts.forEach((coordinate) => {
            if ((player.lives <= 2 && coordinate == this.yellowHeartThree) ||
                 player.lives <= 1 && coordinate == this.yellowHeartTwo ||
                 player.lives == 0 && coordinate == this.yellowHeartOne) {
                this.yellowHeart.resource = resources.images.emptyYellowHeart;
            } else {
                this.yellowHeart.resource = resources.images.fullYellowHeart;
            }
            this.yellowHeart.drawImage(this.ctx, coordinate.x, coordinate.y);
        });
    }

    drawDarkRedHearts = (player) => {
        this.darkRedHearts.forEach((coordinate) => {
            if ((player.lives <= 2 && coordinate == this.darkRedHeartThree) ||
                 player.lives <= 1 && coordinate == this.darkRedHeartTwo ||
                 player.lives == 0 && coordinate == this.darkRedHeartOne) {
                this.darkRedHeart.resource = resources.images.emptyDarkRedHeart;
            } else {
                this.darkRedHeart.resource = resources.images.fullDarkRedHeart;
            }
            this.darkRedHeart.drawImage(this.ctx, coordinate.x, coordinate.y);
        });
    }

    drawGreenHearts = (player) => {
        this.greenHearts.forEach((coordinate) => {
            if ((player.lives <= 2 && coordinate == this.greenHeartThree) ||
                 player.lives <= 1 && coordinate == this.greenHeartTwo ||
                 player.lives == 0 && coordinate == this.greenHeartOne) {
                this.greenHeart.resource = resources.images.emptyGreenHeart;
            } else {
                this.greenHeart.resource = resources.images.fullGreenHeart;
            }
            this.greenHeart.drawImage(this.ctx, coordinate.x, coordinate.y);
        });
    }

    drawGround = () => {
        let groundX = 0;
        let groundY = 0;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 15; j++) {
                this.ground.drawImage(this.ctx, groundX, groundY);
                groundX += 80;
            }
            groundY += 80;
            groundX = 0;
        }
    }

    willCollide = (nextX, nextY, width, height) => {
        let collision = false;
        this.walls.forEach((coordinate) => {
            let x = coordinate.x;
            let y = coordinate.y;
            let size = this.wallSize;

            if (nextX + width >= x && nextX <= x + size &&
                nextY + height >= y && nextY <= y + size) {
                    collision = true;
                }
        })
        return collision;
    }
}
export default Arena;
