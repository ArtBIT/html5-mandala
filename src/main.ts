import Mandala from "./mandala";
import Stage from "./stage";
import Gui from "./gui";
import Config from "./config";

class MandalaApp {
    constructor(node) {
        const canvas = document.querySelector(node);
        this.config = new Config();
        this.gui = new Gui(this.config);
        this.mandala = new Mandala();

        this.stage = new Stage(canvas);
        this.stage.clear("white");
        this.stage.setScale(this.gui.getValue("scale"));
        this.stage.drawText("DROP IMAGE HERE");
        this.bindEvents();
    }
    bindEvents() {
        let isDragging = false;
        this.stage.canvas.addEventListener("mousedown", e => {
            if (e.button === 0) {
                isDragging = true;
            }
        });
        document.addEventListener("mouseup", e => {
            isDragging = false;
        });
        document.addEventListener("mousemove", e => {
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
                    s: offset.s - e.movementY / this.stage.height,
                    v: offset.v - e.movementX / this.stage.width
                });
            }
        });
        this.stage.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            this.gui.increaseValue("patternScale", e.deltaY * -0.001);
        });
        window.ondragover = e => e.preventDefault();
        window.addEventListener("drop", e => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.addEventListener("load", () => {
                this.mandala.setPattern(
                    this.stage.ctx.createPattern(img, "repeat")
                );
                this.render();
            });
        });
        this.gui.addEventListener("change", ({ name, value }) => {
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
    }
    render() {
        clearTimeout(this.renderTimeout);
        this.renderTimeout = setTimeout(() => {
            this.mandala.render(this.stage.ctx, this.config);
        }, 1);
    }
}

window.MandalaApp = MandalaApp;
