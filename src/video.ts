import WebMWriter from "webm-writer";

class Video {
    constructor(params = {}) {
        this.config = {
            quality: params.quality || 0.95, // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported
            frameRate: params.frameRate || 30, // Number of frames per second
            transparent: false, // True if an alpha channel should be included in the video
            alphaQuality: undefined // Allows you to set the quality level of the alpha channel separately.
        };
        this.reset();
    }
    reset() {
        this.video = new WebMWriter(this.config);
    }
    save(filename = "mandala.webm") {
        this.video.complete().then(blob => {
            const anchor = document.createElement("a");
            anchor.href = (window.webkitURL || window.URL).createObjectURL(
                blob
            );
            anchor.download = filename;
            anchor.click();
        });
    }
    addFrame(canvas) {
        this.video.addFrame(canvas);
    }
}

export default Video;
