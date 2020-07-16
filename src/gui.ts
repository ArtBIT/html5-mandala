import gui from "dat.gui";

class Gui {
    constructor(params) {
        this.listeners = {};
        this.config = params;
        this.gui = new gui.GUI({ load: JSON });

        const handle = name => value => {
            this.triggerChange(name, value);
        };

        const guiCanvas = this.gui.addFolder("Canvas");
        guiCanvas
            .add(params, "width")
            .min(10)
            .max(4096)
            .step(1)
            .onChange(handle("width"));
        guiCanvas
            .add(params, "height")
            .min(10)
            .max(4096)
            .step(1)
            .onChange(handle("height"));
        guiCanvas
            .add(params, "scale")
            .min(1)
            .max(4)
            .step(1)
            .onChange(handle("scale"));
        guiCanvas
            .add(params, "angle")
            .min(0)
            .max(360)
            .onChange(handle("angle"));
        guiCanvas.open();

        const guiPattern = this.gui.addFolder("Pattern");
        guiPattern
            .add(params, "symmetries")
            .min(4)
            .max(32)
            .step(1)
            .onChange(handle("symmetries"));
        guiPattern
            .add(params, "patternScale")
            .name("scale")
            .min(0.05)
            .max(4)
            .step(0.05)
            .onChange(handle("patternScale"));
        guiPattern
            .add(params, "patternAngle")
            .name("angle")
            .min(0)
            .max(360)
            .onChange(handle("patternAngle"));
        guiPattern.addColor(params, "offset").onChange(handle("offset"));
        guiPattern.add(params, "file").name("Load pattern...");
        guiPattern.add(params, "save").name("Save image...");
        guiPattern
            .add(params, "randomize")
            .name("Randomize")
            .onChange(() => {
                this.updateDisplay(this.gui);
                this.triggerChange("randomize");
            });

        guiPattern.open();

        this.gui.remember(this.config);
    }
    updateDisplay(gui) {
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
        for (var f in gui.__folders) {
            this.updateDisplay(gui.__folders[f]);
        }
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
    triggerChange(name, value) {
        const type = "change";
        this.listeners[type] &&
            this.listeners[type].forEach(callback =>
                callback({ type, name, value })
            );
    }
    getValue(name) {
        return this.config[name];
    }
    setValue(name, value) {
        const controller = this._findControllerFor(name);
        if (controller) {
            controller.setValue(value);
        }
    }
    increaseValue(name, value) {
        this.setValue(name, this.getValue(name) + value);
    }
    _findControllerFor(name) {
        let controller = this.gui.__controllers.find(function(elem) {
            return elem.property === name;
        });
        if (!controller) {
            controller = Object.keys(this.gui.__folders).reduce(
                (result, folderName) => {
                    if (!result) {
                        result = this.gui.__folders[
                            folderName
                        ].__controllers.find(elem => elem.property === name);
                    }
                    return result;
                },
                undefined
            );
        }
        return controller;
    }
}

export default Gui;
