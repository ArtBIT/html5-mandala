import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import Easing from "./easing";

class Gui {
    constructor(params) {
        this.listeners = {};
        this.config = params;
        this.gui = new Pane({ load: JSON });
        this.gui.registerPlugin(EssentialsPlugin);

        const handle = name => value => {
            this.triggerChange(name, value);
        };

        const guiCanvas = this.gui.addFolder({
            title: "Canvas",
            expanded: true
        });
        guiCanvas
            .addInput(params, "width", {
                min: 10,
                max: 4096,
                step: 1
            })
            .on("change", handle("width"));
        guiCanvas
            .addInput(params, "height", {
                min: 10,
                max: 4096,
                step: 1
            })
            .on("change", handle("height"));
        guiCanvas
            .addInput(params, "scale", {
                min: 1,
                max: 4,
                step: 1
            })
            .on("change", handle("scale"));
        guiCanvas
            .addInput(params, "angle", {
                min: -360,
                max: 360
            })
            .on("change", handle("angle"));

        const guiPattern = this.gui.addFolder({
            title: "Pattern",
            expanded: true
        });
        guiPattern
            .addInput(params, "symmetries", {
                min: 4,
                max: 32,
                step: 1
            })
            .on("change", handle("symmetries"));
        guiPattern
            .addInput(params, "patternScale", {
                label: "scale",
                min: 0.05,
                max: 4,
                step: 0.05
            })
            .on("change", handle("patternScale"));
        guiPattern
            .addInput(params, "patternAngle", {
                label: "angle",
                min: -360,
                max: 360,
                step: 1
            })
            .on("change", handle("patternAngle"));
        guiPattern
            .addInput(params, "offset", {
                x: {
                    min: -1,
                    max: +1,
                    step: 0.01
                },
                y: {
                    min: -1,
                    max: +1,
                    step: 0.01
                }
            })
            .on("change", handle("offset"));
        guiPattern.addButton({ title: "Load pattern..." }).on("click", () => {
            document.getElementById("patternFile").click();
        });
        guiPattern
            .addButton({ title: "Save Image..." })
            .on("click", () => this.trigger("click", "saveImage"));

        const guiAnimation = this.gui.addFolder({
            title: "Animation",
            expanded: true
        });
        guiAnimation
            .addInput(params, "duration", {
                label: "Duration",
                min: 1,
                max: 600,
                step: 1
            })
            .on("change", handle("totalFrames"));
        guiAnimation.addInput(params, "pingPong", { label: "Ping pong" });
        guiAnimation
            .addInput(params, "easing", {
                label: "Easing",
                options: Object.keys(Easing).reduce((result, current) => {
                    result[current] = current;
                    return result;
                }, {})
            })
            .on("change", handle("easing"));
        guiAnimation.addInput(params, "currentKeyframe", {
            label: "Current Keyframe",
            disabled: true,
            step: 1
        });
        let newButton,
            renderButton,
            nextButton,
            prevButton,
            deleteButton,
            resetButton,
            copyButton,
            pasteButton,
            randomizeButton;
        this.updateAnimationGui = () => {
            renderButton.disabled = this.config.keyframes.length < 2;
            prevButton.disabled = this.config.currentKeyframe <= 0;
            nextButton.disabled =
                this.config.currentKeyframe < 0 ||
                this.config.currentKeyframe >= this.config.totalKeyframes - 1;
            deleteButton.disabled = this.config.totalKeyframes <= 1;
            resetButton.disabled = this.config.totalKeyframes <= 1;
            pasteButton.disabled = !this.config.keyframeClipboard;
            randomizeButton.disabled = newButton.disabled = copyButton.disabled = !this
                .config.file;
        };
        prevButton = guiAnimation
            .addButton({ title: "Previous keyframe", disabled: true })
            .on("click", () => {
                this.trigger("click", "prevKeyframe");
                this.updateAnimationGui();
            });
        nextButton = guiAnimation
            .addButton({ title: "Next keyframe", disabled: true })
            .on("click", () => {
                this.trigger("click", "nextKeyframe");
                this.updateAnimationGui();
            });
        guiAnimation.addSeparator();
        newButton = guiAnimation
            .addButton({ title: "New keyframe", disabled: true })
            .on("click", () => {
                this.trigger("click", "newKeyframe");
                this.updateAnimationGui();
            });
        deleteButton = guiAnimation
            .addButton({ title: "Delete keyframe", disabled: true })
            .on("click", () => {
                this.trigger("click", "deleteKeyframe");
                this.updateAnimationGui();
            });
        resetButton = guiAnimation
            .addButton({ title: "Clear keyframes", disabled: true })
            .on("click", () => {
                this.trigger("click", "resetKeyframes");
                this.updateAnimationGui();
            });
        guiAnimation.addSeparator();
        copyButton = guiAnimation
            .addButton({ title: "Copy keyframe", disabled: true })
            .on("click", () => {
                this.trigger("click", "copyKeyframe");
                this.updateAnimationGui();
            });
        pasteButton = guiAnimation
            .addButton({ title: "Paste keyframe", disabled: true })
            .on("click", () => {
                this.trigger("click", "pasteKeyframe");
                this.updateAnimationGui();
            });
        randomizeButton = guiAnimation
            .addButton({ title: "Randomize", disabled: true })
            .on("click", () => this.trigger("click", "randomize"));
        guiAnimation.addSeparator();
        guiAnimation
            .addInput(params, "fps", {
                label: "FPS",
                min: 1,
                max: 60,
                step: 1
            })
            .on("change", handle("fps"));
        renderButton = guiAnimation
            .addButton({ title: "Render animation...", disabled: true })
            .on("click", () => {
                this.trigger("click", "renderAnimation");
                this.updateAnimationGui();
            });
    }
    addEventListener(eventName, eventCallback) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(eventCallback);
    }
    removeEventListener(eventName, eventCallback) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName] = this.listeners[eventName].filter(
            callback => callback !== eventCallback
        );
    }
    trigger(type, name, value) {
        this.listeners[type] &&
            this.listeners[type].forEach(callback =>
                callback({ type, name, value })
            );
    }
    triggerChange(name, value) {
        this.trigger("change", name, value);
    }
    getValue(name) {
        return this.config[name];
    }
    setValue(name, value) {
        this.config[name] = value;
        this.update();
    }
    update() {
        this.gui.refresh();
        if (this.updateAnimationGui) {
            this.updateAnimationGui();
        }
    }
    increaseValue(name, value) {
        this.setValue(name, this.getValue(name) + value);
    }
}

export default Gui;
