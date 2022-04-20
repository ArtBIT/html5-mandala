export default function Config(params) {
    params = params || {};
    this.width = params.width || 2048;
    this.height = params.height || 2048;
    this.scale = params.scale || 4;
    this.angle = params.angle || 0;
    this.offset = params.offset || { h: 0, s: 0, v: 0 };
    this.patternScale = params.patternScale || 1;
    this.patternAngle = params.patternAngle || 0;
    this.symmetries = params.symmetries || 7;
    this.file = () => document.getElementById("patternFile").click();
    this.save = () => {
        const a = document.createElement("a");
        a.download = "mandala.png";
        a.href = document
            .getElementById("stage")
            .toDataURL("image/png")
            .replace(/^data:image\/[^;]/, "data:application/octet-stream");
        a.click();
    };
    this.randomize = () => {
        this.angle = Math.floor(Math.random() * 360);
        this.offset.s = Math.random();
        this.offset.v = Math.random();
        this.patternScale = Math.random() * 4;
        this.patternAngle = Math.floor(Math.random() * 360);
        this.symmetries = Math.floor(Math.random() * 16) + 4;
    };
    this.snapshot = () => ({
        angle: this.angle,
        offset: {
            h: this.offset.h,
            s: this.offset.s,
            v: this.offset.v
        },
        patternScale: this.patternScale,
        patternAngle: this.patternAngle,
        symmetries: this.symmetries
    });
    // animation
    this.totalFrames = params.totalFrames || 100;
    this.fps = params.fps || 30;
    this.record = () => {};
    this.startFrame = this.snapshot();
    this.setStartFrame = () => (this.startFrame = this.snapshot());
    this.endFrame = this.snapshot();
    this.pingPong = false;
    this.setEndFrame = () => (this.endFrame = this.snapshot());
    this.easing = "linear";
}
