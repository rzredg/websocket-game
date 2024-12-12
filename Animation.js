class Animation {
    constructor(frames) {
        this.frames = frames; // Array of frames with time and frame number
    }

    getCurrentFrame(delta) {
        let currentFrame = 0;

        for (const frame of this.frames) {
            if (delta >= frame.time) currentFrame = frame;
            else break;
        }
        return currentFrame.frame;
    }
}

export default Animation;