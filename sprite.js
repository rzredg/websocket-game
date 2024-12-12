import { Vector2 } from "./vector2.js";
export class Sprite {
    constructor({
        resource, // image we want ot draw
        frameSize, // size of the crop of the image
        hFrames,  // how the sprite arranged horizontally
        vFrames,  // how the sprite arranged vertically
        frame,    // which frame we want to show
        scale,    
        position,
    }) {
        this.resource = resource;
        this.frameSize = frameSize ?? new Vector2(16, 16);
        this.hFrames = hFrames ?? 1;
        this.vFrames = vFrames ?? 1;
        this.frame = frame ?? 0;
        this.frameMap = new Map();
        this.scale = scale ?? 1;
        this.position = position ?? new Vector2(0, 0);
        this.buildFrameMap();
    }

    buildFrameMap() {
        let frameCount = 0;
        for (let v = 0; v < this.vFrames; v++) {
            for (let h = 0; h < this.hFrames; h++) {
                this.frameMap.set(
                    frameCount,
                    new Vector2(this.frameSize.x * h, this.frameSize.y * v)
                )
                frameCount++;
            }
        }
    }

    drawImage(ctx, x, y) {
        if (!this.resource.isLoaded) {
            return;
        }

        let frameCoordX = 0;
        let frameCoordY = 0;
        const frame = this.frameMap.get(this.frame);
        if (frame) {
            frameCoordX = frame.x;
            frameCoordY = frame.y;
        }

        const frameSizeX = this.frameSize.x;
        const frameSizeY = this.frameSize.y;

        ctx.drawImage(
            this.resource.image, 
            frameCoordX,
            frameCoordY, // Top Y corner of frame
            frameSizeX,  // How much to crop from the sprite sheet (X)
            frameSizeY,  // How much to crop from the sprite sheet (Y)
            x, // Where to place this on canvas tag X (0)
            y, // Where to place this on canvas tag Y (0)
            frameSizeX * this.scale, // How large to scale it (X)
            frameSizeY * this.scale, // How large to scale it (Y)
        );
    }

    drawPlayer(ctx, x, y, animation, color) {
        if (!this.resource.isLoaded) {
            return;
        }

        let frameCoordX = 0;
        let frameCoordY = 0;
        const frame = this.frameMap.get(this.frame);
        if (frame) {
            if (animation == "up" || animation == "down" || 
                animation == "standup" || animation == "standdown") {
                if (color == "green") frameCoordY = frame.y + 8;
                else frameCoordY = frame.y + 6;
                frameCoordX = frame.x + 8;
            }
            else if (animation == "left" || animation == "right" || 
                     animation == "standleft" || animation == "standright") {
                if (color == "green") frameCoordY = frame.y + 8;
                else frameCoordY = frame.y + 10;
                frameCoordX = frame.x + 8;
            }
        }

        const frameSizeX = this.frameSize.x;
        const frameSizeY = this.frameSize.y;

        ctx.drawImage(
            this.resource.image, 
            frameCoordX,
            frameCoordY, // Top Y corner of frame
            frameSizeX,  // How much to crop from the sprite sheet (X)
            frameSizeY,  // How much to crop from the sprite sheet (Y)
            x, // Where to place this on canvas tag X (0)
            y, // Where to place this on canvas tag Y (0)
            frameSizeX * this.scale, // How large to scale it (X)
            frameSizeY * this.scale, // How large to scale it (Y)
        );
    }
}
