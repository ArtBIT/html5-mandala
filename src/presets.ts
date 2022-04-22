const PRESETS_STORAGE_KEY = "html5-mandala-presets";

class Presets {
    constructor() {
        this.presets = {};
        this.reset();
        this.deserialize(localStorage.getItem(PRESETS_STORAGE_KEY));
    }

    reset() {
        // clear the presets do not destroy so that we do not destroy the object reference
        for (let key in this.presets) delete this.presets[key];
    }

    add(name, preset) {
        this.presets[name] = preset;
        localStorage.setItem(PRESETS_STORAGE_KEY, this.serialize());
    }

    remove(name) {
        delete this.presets[name];
        localStorage.setItem(PRESETS_STORAGE_KEY, this.serialize());
    }

    get(name) {
        if (name) {
            return this.presets[name];
        }
        return this.presets;
    }

    serialize() {
        return JSON.stringify(this.presets);
    }

    deserialize(data) {
        if (data) {
            try {
                var storedPresets = JSON.parse(data);
                Object.keys(storedPresets).map(
                    name => (this.presets[name] = storedPresets[name])
                );
            } catch (e) {
                console.error(e);
            }
        }
    }
}

export default Presets;
