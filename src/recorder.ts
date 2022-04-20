import Easing, { PingPong } from "./easing";
import Video from "./video";

class Recorder {
    record(mandala, stage, config) {
        this.mandala = mandala;
        this.stage = stage;
        this.video = new Video({ frameRate: config.fps });

        this.easing = Easing[config.easing];
        if (config.pingPong) {
            this.easing = PingPong(this.easing);
        }
        this.from = config.startFrame;
        this.to = config.endFrame;

        this.currentFrame = 0;
        this.totalFrames = config.totalFrames;
        return new Promise(resolve => {
            this.resolve = resolve;
            this.render();
        });
    }
    interpolate(from, to, t) {
        const k = this.easing(t);
        return {
            angle: (to.angle - from.angle) * k + from.angle,
            offset: {
                s: (to.offset.s - from.offset.s) * k + from.offset.s,
                v: (to.offset.v - from.offset.v) * k + from.offset.v
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
            let t = this.currentFrame / this.totalFrames;
            this.currentFrame++;
            const params = this.interpolate(this.from, this.to, t);
            this.stage.clear();
            this.mandala.setScale(params.patternScale);
            this.mandala.setRotation(params.patternAngle);
            this.mandala.render(this.stage.ctx, params);
            this.video.addFrame(this.stage.ctx.canvas);
            if (t < 1) {
                this.render();
            } else {
                this.video.save();
                this.resolve();
            }
        }, 1);
    }
}

export default Recorder;
