export default function Config(params) {
    params = params || {};
    this.width = params.width || 2048;
    this.height = params.height || 2048;
    this.scale = params.scale || 4;
    this.angle = params.angle || 0;
    this.offset = params.offset || { x: 0, y: 0 };
    this.patternScale = params.patternScale || 1;
    this.patternAngle = params.patternAngle || 0;
    this.symmetries = params.symmetries || 7;

    this.isPlayingAnimation = false;
    this.isRecordingAnimation = false;
    this.isBusy = false;
    this.loop = false;
    this.firstFrameAsLastFrame = false;

    this.randomize = () => {
        this.angle = Math.floor(Math.random() * 360);
        this.offset.x = Math.random();
        this.offset.y = Math.random();
        this.patternScale = Math.random() * 4;
        this.patternAngle = Math.floor(Math.random() * 360);
        this.symmetries = Math.floor(Math.random() * 16) + 4;
    };
    this.file = undefined;
    // animation
    this.keyframes = [];
    this.keyframeClipboard = undefined;
    this.fps = params.fps || 30;
    this.duration = this.fps;
    this.totalKeyframes = 0;
    this.currentKeyframe = 0;
    this.toKeyframe = () => ({
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
    });
    this.fromKeyframe = () => {
        const keyframe = this.keyframes[this.currentKeyframe];
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
    };
    this.updateKeyframe = newKeyframeParams => {
        this.keyframes[this.currentKeyframe] =
            newKeyframeParams || this.toKeyframe();
    };
    this.addKeyframe = () => {
        this.keyframes[this.currentKeyframe] = this.toKeyframe();
        this.keyframes.splice(this.currentKeyframe, 0, this.toKeyframe());
        this.currentKeyframe++;
        this.totalKeyframes = this.keyframes.length;
    };
    this.nextKeyframe = () => {
        this.updateKeyframe();
        if (this.currentKeyframe < this.totalKeyframes - 1) {
            this.currentKeyframe++;
            this.fromKeyframe();
        }
    };
    this.prevKeyframe = () => {
        this.updateKeyframe();
        if (this.currentKeyframe > 0) {
            this.currentKeyframe--;
            this.fromKeyframe();
        }
    };
    this.copyKeyframe = () => (this.keyframeClipboard = this.toKeyframe());
    this.pasteKeyframe = () => {
        this.updateKeyframe(this.keyframeClipboard);
        this.fromKeyframe();
    };
    this.deleteKeyframe = () => {
        if (this.totalKeyframes > 0) {
            this.keyframes.splice(this.currentKeyframe, 1);
            Math.max(0, this.currentKeyframe--);
            this.totalKeyframes = this.keyframes.length;
        }
    };
    this.resetKeyframes = () => {
        this.keyframes = [this.keyframes[0]];
        this.totalKeyframes = this.keyframes.length;
        this.currentKeyframe = 0;
    };
    this.record = () => {};
    this.pingPong = false;
    this.easing = "linear";
}
