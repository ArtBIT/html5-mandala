import Easing from "./easing";
import Events from "./events";

class Player extends Events {
    play(mandala, stage, config) {
        this.mandala = mandala;
        if (config.isRecordingAnimation && window.OffscreenCanvas) {
            this.ctx = new OffscreenCanvas(
                stage.width,
                stage.height
            ).getContext("2d");
        } else {
            this.ctx = stage.ctx;
        }
        this.keyframes = [...config.keyframes];
        if (config.firstFrameAsLastFrame) {
            this.keyframes.push(this.keyframes[0]);
        }
        this.currentFrame = 0;
        this.currentKeyframe = -1;
        this.nextKeyframe();
        this.trigger("started", this);
        this.delay = config.isRecordingAnimation ? 1 : 1000 / config.fps;
        this.loop = !config.isRecordingAnimation && config.loop;
        this.isPlaying = true;
        this.render();
    }
    stop() {
        this.isPlaying = false;
    }
    nextKeyframe() {
        this.currentKeyframe++;
        this.currentFrame = 0;
        if (this.currentKeyframe >= this.keyframes.length - 1) {
            if (!this.loop) {
                return;
            }
            this.currentFrame = 0;
            this.currentKeyframe = -1;
            return this.nextKeyframe();
        }
        const frame = this.keyframes[this.currentKeyframe];
        this.easing = Easing[frame.easing];
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
        if (!this.isPlaying) {
            return;
        }
        this.renderTimeout = setTimeout(() => {
            if (this.currentKeyframe >= this.keyframes.length - 1) {
                this.trigger("ended", this);
                return;
            }
            const from = this.keyframes[this.currentKeyframe];
            const to = this.keyframes[this.currentKeyframe + 1];
            let t = this.currentFrame / from.duration;
            const params = this.interpolate(from, to, t);
            this.mandala.setScale(params.patternScale);
            this.mandala.setRotation(params.patternAngle);
            this.mandala.render(this.ctx, params);
            this.trigger("change", this);
            this.currentFrame++;
            if (this.currentFrame > from.duration) {
                this.nextKeyframe();
            }
            this.render();
        }, this.delay);
    }
}

export default Player;
