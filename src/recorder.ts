import Easing, { PingPong } from "./easing";
import Video from "./video";

class Recorder {
    record(mandala, stage, config) {
        this.mandala = mandala;
        if (window.OffscreenCanvas) {
            this.ctx = new OffscreenCanvas(
                stage.width,
                stage.height
            ).getContext("2d");
        } else {
            this.ctx = stage.ctx;
        }
        this.video = new Video({ frameRate: config.fps });
        this.pingPong = config.pingPong;
        this.currentFrame = 0;
        this.keyframes = config.keyframes;
        this.currentKeyframe = -1;
        this.nextKeyframe();
        return new Promise(resolve => {
            this.resolve = resolve;
            this.render();
        });
    }
    nextKeyframe() {
        this.currentKeyframe++;
        this.currentFrame = 0;
        if (this.currentKeyframe >= this.keyframes.length - 1) {
            return;
        }
        const frame = this.keyframes[this.currentKeyframe];
        this.easing = Easing[frame.easing];
        if (this.pingPong) {
            this.easing = PingPong(this.easing);
        }
    }
    interpolate(from, to, t) {
        const k = this.easing(t);
        return {
            angle: (to.angle - from.angle) * k + from.angle,
            offset: {
                x: (to.offset.x - from.offset.x) * k + from.offset.x,
                y: (to.offset.y - from.offset.y) * k + from.offset.y
            },
            patternScale:
                (to.patternScale - from.patternScale) * k + from.patternScale,
            patternAngle:
                (to.patternAngle - from.patternAngle) * k + from.patternAngle,
            symmetries: (to.symmetries - from.symmetries) * k + from.symmetries
        };
    }
    render() {
        clearTimeout(this.renderTimeout);
        this.renderTimeout = setTimeout(() => {
            if (this.currentKeyframe >= this.keyframes.length - 1) {
                this.video.save();
                this.resolve();
                return;
            }
            const from = this.keyframes[this.currentKeyframe];
            const to = this.keyframes[this.currentKeyframe + 1];
            let t = this.currentFrame / from.duration;
            const params = this.interpolate(from, to, t);
            this.ctx.clearRect(
                0,
                0,
                this.ctx.canvas.width,
                this.ctx.canvas.height
            );
            this.mandala.setScale(params.patternScale);
            this.mandala.setRotation(params.patternAngle);
            this.mandala.render(this.ctx, params);
            this.video.addFrame(this.ctx.canvas);
            this.currentFrame++;
            if (this.currentFrame > from.duration) {
                this.nextKeyframe();
            }
            this.render();
        }, 1);
    }
}

export default Recorder;
