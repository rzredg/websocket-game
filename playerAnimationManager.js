import {WALK_DOWN, WALK_UP, WALK_LEFT, WALK_RIGHT, 
        STAND_DOWN, STAND_UP, STAND_LEFT , STAND_RIGHT} from "./playerAnimations.js";
import Animation from "./Animation.js";
class PlayerAnimationManager {
    constructor() {
        this.animations = {
            down: new Animation(WALK_DOWN.frames),
            up: new Animation(WALK_UP.frames),
            left: new Animation(WALK_LEFT.frames),
            right: new Animation(WALK_RIGHT.frames),
            standdown: new Animation(STAND_DOWN.frames),
            standup: new Animation(STAND_UP.frames),
            standleft: new Animation(STAND_LEFT.frames),
            standright: new Animation(STAND_RIGHT.frames),
        };

        this.currentAnimation = null; // No movement initially
    }

    setAnimation(animation) {
        this.currentAnimation = animation ? this.animations[animation] : null;
    }

    getCurrentFrame(delta) {
        if (!this.currentAnimation) return null; // No animation if not moving
        return this.currentAnimation.getCurrentFrame(delta);
    }
}

export default PlayerAnimationManager;