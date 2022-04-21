import Mandala from "./mandala";
import Stage from "./stage";
import Gui from "./gui";
import Config from "./config";
import Recorder from "./recorder";
import { on } from "./helpers";

class MandalaApp {
    constructor(node) {
        const canvas = document.querySelector(node);
        this.config = new Config();
        this.gui = new Gui(this.config);
        this.mandala = new Mandala();
        this.recorder = new Recorder();

        this.stage = new Stage(canvas);
        this.stage.clear("white");
        this.stage.setScale(this.gui.getValue("scale"));
        this.stage.drawText("DROP IMAGE HERE");
        this.bindEvents();
    }
    bindEvents() {
        let isDragging = false;
        on(document.getElementById("patternFile"), "change", e => {
            this.onFileChange(e.target.files[0]);
        });
        on(this.stage.canvas, "mousedown", e => {
            if (e.button === 0) {
                isDragging = true;
            }
        });
        on(document, "mouseup", e => {
            isDragging = false;
        });
        on(document, "mousemove", e => {
            if (!isDragging) {
                return;
            }
            if (e.shiftKey) {
                this.gui.increaseValue("angle", e.movementX / 10);
            } else if (e.altKey) {
                this.gui.increaseValue("patternAngle", e.movementX / 10);
            } else {
                const offset = this.gui.getValue("offset");
                this.gui.setValue("offset", {
                    y: offset.y - e.movementY / this.stage.height,
                    x: offset.x - e.movementX / this.stage.width
                });
            }
        });
        const lastPosition = { x: undefined, y: undefined };
        on(this.stage.canvas, "touchstart", e => {
            isDragging = true;
            const touch = event.changedTouches[0];
            lastPosition.x = touch.clientX;
            lastPosition.y = touch.clientY;
        });
        on(document, "touchend touchcancel", e => {
            isDragging = false;
        });
        on(document, "touchmove", e => {
            if (!isDragging) {
                return;
            }
            const touch = event.changedTouches[0];
            const movementX = touch.clientX - lastPosition.x;
            const movementY = touch.clientY - lastPosition.y;
            lastPosition.x = touch.clientX;
            lastPosition.y = touch.clientY;
            const offset = this.gui.getValue("offset");
            this.gui.setValue("offset", {
                y: offset.y - movementY / this.stage.height,
                x: offset.x - movementX / this.stage.width
            });
        });
        on(this.stage.canvas, "wheel", e => {
            e.preventDefault();
            this.gui.increaseValue("patternScale", e.deltaY * -0.001);
        });
        on(window, "dragover", e => e.preventDefault());
        on(window, "drop", e => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            this.onFileChange(file);
        });
        on(this.gui, "change", ({ name, value: { value } }) => {
            switch (name) {
                case "patternAngle":
                    this.mandala.setRotation(value);
                    break;
                case "patternScale":
                    this.mandala.setScale(value);
                    break;
                case "scale":
                    this.stage.setScale(value);
                    break;
                case "width":
                    this.stage.setWidth(value);
                    break;
                case "height":
                    this.stage.setHeight(value);
                    break;
            }
            this.render();
        });
        on(this.gui, "click", ({ name }) => {
            switch (name) {
                case "saveImage":
                    const a = document.createElement("a");
                    a.download = "mandala.png";
                    a.href = document
                        .getElementById("stage")
                        .toDataURL("image/png")
                        .replace(
                            /^data:image\/[^;]/,
                            "data:application/octet-stream"
                        );
                    a.click();
                    break;

                case "pasteKeyframe":
                    this.config.pasteKeyframe();
                    this.gui.update();
                    break;
                case "copyKeyframe":
                    this.config.copyKeyframe();
                    this.gui.update();
                    break;
                case "deleteKeyframe":
                    this.config.deleteKeyframe();
                    this.gui.update();
                    break;
                case "resetKeyframes":
                    this.config.resetKeyframes();
                    this.gui.update();
                    break;
                case "newKeyframe":
                    this.config.addKeyframe();
                    this.gui.update();
                    break;
                case "nextKeyframe":
                    this.config.nextKeyframe();
                    this.gui.update();
                    break;
                case "prevKeyframe":
                    this.config.prevKeyframe();
                    this.gui.update();
                    break;
                case "loadFile":
                    document.getElementById("filePattern").click();
                    break;

                case "renderAnimation":
                    this.config.updateKeyframe();
                    this.recorder
                        .record(this.mandala, this.stage, this.config)
                        .then(() => this.gui.update());
                    break;

                case "randomize":
                    this.config.randomize();
                    this.mandala.setScale(this.config.patternScale);
                    this.mandala.setRotation(this.config.patternRotation);
                    this.gui.update();
                    break;
            }
        });
    }
    onFileChange(file) {
        if (!file) {
            return;
        }
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.addEventListener("load", () => {
            this.mandala.setPattern(
                this.stage.ctx.createPattern(img, "repeat")
            );
            this.config.file = file;
            this.gui.update();
            this.render();
        });
    }
    render() {
        clearTimeout(this.renderTimeout);
        this.renderTimeout = setTimeout(() => {
            this.stage.clear();
            this.mandala.render(this.stage.ctx, this.config);
        }, 1);
    }
}

window.MandalaApp = MandalaApp;
