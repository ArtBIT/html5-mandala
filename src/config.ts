const randomizeValue = (value, min, max, strength) => {
    const newValue = Math.random() * (max - min) + min;
    return Math.min(max, Math.max(min, value + (newValue - value) * strength));
};

class Config {
    constructor(params) {
        this.import(params);
    }
    toKeyframe() {
        return {
            angle: this.angle,
            offset: {
                x: this.offset.x,
                y: this.offset.y
            },
            patternScale: this.patternScale,
            patternAngle: this.patternAngle,
            symmetries: this.symmetries,
            easing: this.easing,
            duration: this.duration
        };
    }
    fromKeyframe(keyframeIndex) {
        if (this.keyframes.length < 1) {
            return;
        }
        keyframeIndex =
            keyframeIndex === undefined ? this.currentKeyframe : keyframeIndex;
        const keyframe = this.keyframes[keyframeIndex];
        this.angle = keyframe.angle;
        this.offset = {
            x: keyframe.offset.x,
            y: keyframe.offset.y
        };
        this.patternScale = keyframe.patternScale;
        this.patternAngle = keyframe.patternAngle;
        this.symmetries = keyframe.symmetries;
        this.easing = keyframe.easing;
        this.duration = keyframe.duration;
    }
    updateKeyframe(newKeyframeParams) {
        this.keyframes[this.currentKeyframe] =
            newKeyframeParams || this.toKeyframe();
    }
    addKeyframe() {
        this.keyframes[this.currentKeyframe] = this.toKeyframe();
        this.keyframes.splice(this.currentKeyframe, 0, this.toKeyframe());
        this.currentKeyframe++;
        this.totalKeyframes = this.keyframes.length;
    }
    nextKeyframe() {
        this.updateKeyframe();
        if (this.currentKeyframe < this.totalKeyframes - 1) {
            this.currentKeyframe++;
            this.fromKeyframe();
        }
    }
    prevKeyframe() {
        this.updateKeyframe();
        if (this.currentKeyframe > 0) {
            this.currentKeyframe--;
            this.fromKeyframe();
        }
    }
    copyKeyframe() {
        this.keyframeClipboard = this.toKeyframe();
    }
    pasteKeyframe() {
        this.updateKeyframe(this.keyframeClipboard);
        this.fromKeyframe();
    }
    deleteKeyframe() {
        if (this.totalKeyframes > 0) {
            this.keyframes.splice(this.currentKeyframe, 1);
            Math.max(0, this.currentKeyframe--);
            this.totalKeyframes = this.keyframes.length;
            this.fromKeyframe();
        }
    }
    resetKeyframes() {
        this.keyframes = [this.keyframes[0]];
        this.totalKeyframes = this.keyframes.length;
        this.currentKeyframe = 0;
    }
    randomize() {
        this.angle = randomizeValue(
            this.angle,
            -180,
            180,
            this.randomizeStrength
        );
        this.offset.x = randomizeValue(
            this.offset.x,
            -1,
            1,
            this.randomizeStrength
        );
        this.offset.y = randomizeValue(
            this.offset.y,
            -1,
            1,
            this.randomizeStrength
        );
        this.patternScale = randomizeValue(
            this.patternScale,
            0.1,
            4,
            this.randomizeStrength
        );
        this.patternAngle = randomizeValue(
            this.patternAngle,
            -180,
            180,
            this.randomizeStrength
        );
        this.symmetries = Math.floor(
            randomizeValue(this.symmetries, 4, 16, this.randomizeStrength)
        );
    }
    export() {
        return {
            width: this.width,
            height: this.height,
            scale: this.scale,
            angle: this.angle,
            backgroundColor: this.backgroundColor,
            randomizeStrength: this.randomizeStrength,
            loop: this.loop,
            firstFrameAsLastFrame: this.firstFrameAsLastFrame,
            keyframes: [...this.keyframes],
            fps: this.fps
        };
    }
    import(params) {
        params = params || {};
        this.width = params.width || 2048;
        this.height = params.height || 2048;
        this.scale = params.scale || 4;
        this.angle = params.angle || 0;
        this.offset = params.offset || { x: 0, y: 0 };
        this.patternScale = params.patternScale || 1;
        this.patternAngle = params.patternAngle || 0;
        this.symmetries = params.symmetries || 7;
        this.backgroundColor = "#000";

        this.randomizeStrength = 1;
        this.file = undefined;

        // animation
        this.isPlayingAnimation = false;
        this.isRecordingAnimation = false;
        this.isBusy = false;
        this.loop = false;
        this.firstFrameAsLastFrame = false;

        this.keyframes = params.keyframes || [];
        this.keyframeClipboard = undefined;
        this.fps = params.fps || 30;
        this.editAllKeyframes = false;
        this.duration = this.fps;
        this.totalKeyframes = 0;
        this.currentKeyframe = 0;
        this.easing = "linear";

        this.fromKeyframe();
    }
}

export default Config;
