import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import Easing from "./easing";
import Events from "./events";
import Presets from "./presets";

class Gui extends Events {
  constructor(params) {
    super();
    this.listeners = {};
    this.config = params;
    this.presets = new Presets();
    this.gui = new Pane({ load: JSON });
    this.gui.registerPlugin(EssentialsPlugin);
    this.init(params);
  }

  init(params) {
    this.initPresets(params);
    this.initCanvas(params);
    this.initPattern(params);
    this.initAnimation(params);
  }
  initPresets(params) {
    const folder = this.gui.addFolder({
      title: "Presets",
      expanded: true,
    });
    let presetsList;

    const initPrestList = () => {
      const options = [
        { text: "", value: "" },
        ...Object.keys(this.presets.get() || {}).map((key) => ({
          text: key,
          value: key,
        })),
      ];
      return folder
        .addInput(params, "currentPreset", {
          index: 0,
          label: "Current",
          options,
        })
        .on("change", ({ name, value: { value } }) => {
          this.config.import(this.presets.get(this.config.currentPreset));
          this.update();
          this.handle("currentPreset");
        });
    };
    const updatePresetsList = () => {
      presetsList.dispose();
      presetsList = initPrestList();
      this.update();
    };
    presetsList = initPrestList();
    folder.addButton({ title: "Save" }).on("click", () => {
      const presetName = prompt(
        "Please enter the name for the current preset",
        this.config.currentPreset
      );
      if (!presetName) {
        return;
      }
      if (Object.keys(this.presets.get()).includes(presetName)) {
        if (
          !window.confirm(
            "The preset with the same name already exists. Are you sure you want to overwrite it?"
          )
        ) {
          return;
        }
      }

      this.presets.add(presetName, this.config.export());
      this.config.currentPreset = presetName;
      updatePresetsList();
    });
    folder.addButton({ title: "Delete" }).on("click", () => {
      if (
        window.confirm("Are you sure you want to delete the current preset?")
      ) {
        this.presets.remove(this.config.currentPreset);
        this.config.currentPreset = Object.keys(this.presets.get()).pop();
        updatePresetsList();
      }
    });
  }
  initCanvas(params) {
    const folder = this.gui.addFolder({
      title: "Canvas",
      expanded: true,
    });
    folder
      .addInput(params, "backgroundColor", {
        label: "Background color",
      })
      .on("change", this.handle("backgroundColor"));
    folder
      .addInput(params, "width", {
        min: 10,
        max: 4096,
        step: 1,
      })
      .on("change", this.handle("width"));
    folder
      .addInput(params, "height", {
        min: 10,
        max: 4096,
        step: 1,
      })
      .on("change", this.handle("height"));
    folder
      .addInput(params, "scale", {
        min: 1,
        max: 4,
        step: 1,
      })
      .on("change", this.handle("scale"));
    folder
      .addInput(params, "angle", {
        min: -360,
        max: 360,
      })
      .on("change", this.handle("angle"));
  }

  handle(name) {
    return (value) => {
      this.triggerChange(name, value);
    };
  }

  initPattern(params) {
    const folder = this.gui.addFolder({
      title: "Pattern",
      expanded: true,
    });
    folder
      .addInput(params, "symmetries", {
        min: 0,
        max: 32,
        step: 1,
      })
      .on("change", this.handle("symmetries"));
    folder
      .addInput(params, "patternScale", {
        label: "scale",
        min: 0.05,
        max: 4,
        step: 0.05,
      })
      .on("change", this.handle("patternScale"));
    folder
      .addInput(params, "patternAngle", {
        label: "angle",
        min: -360,
        max: 360,
        step: 1,
      })
      .on("change", this.handle("patternAngle"));
    folder
      .addInput(params, "offset", {
        x: {
          min: -1,
          max: +1,
          step: 0.01,
        },
        y: {
          min: -1,
          max: +1,
          step: 0.01,
        },
      })
      .on("change", this.handle("offset"));
    folder
      .addInput(params, "makeTilable", { label: "Make Tilable" })
      .on("change", this.handle("makeTilable"));
    folder.addButton({ title: "Load pattern..." }).on("click", () => {
      document.getElementById("patternFile").click();
    });
    folder
      .addButton({ title: "Save Image..." })
      .on("click", () => this.trigger("click", "saveImage"));
  }
  initAnimation(params) {
    const folder = this.gui.addFolder({
      title: "Animation",
      expanded: true,
    });
    folder
      .addInput(params, "editAllKeyframes", {
        label: "Edit All Keyframes",
      })
      .on("change", this.handle("editAllKeyframes"));
    folder
      .addInput(params, "duration", {
        label: "Duration",
        min: 1,
        max: 600,
        step: 1,
      })
      .on("change", this.handle("duration"));
    folder
      .addInput(params, "easing", {
        label: "Easing",
        options: Object.keys(Easing).reduce((result, current) => {
          result[current] = current;
          return result;
        }, {}),
      })
      .on("change", this.handle("easing"));
    folder.addInput(params, "currentKeyframe", {
      label: "Current Keyframe",
      disabled: true,
      step: 1,
    });
    let newButton,
      playButton,
      stopButton,
      renderButton,
      nextButton,
      prevButton,
      deleteButton,
      resetButton,
      copyButton,
      pasteButton,
      randomizeButton;
    this.updateAnimationGui = () => {
      if (this.config.isPlayingAnimation) {
        playButton.hidden = true;
        stopButton.hidden = false;
      } else {
        playButton.hidden = false;
        stopButton.hidden = true;
      }
      const isBusy =
        this.config.isPlayingAnimation ||
        this.config.isRecordingAnimation ||
        this.config.isBusy;
      if (isBusy) {
        renderButton.disabled =
          prevButton.disabled =
          nextButton.disabled =
          deleteButton.disabled =
          resetButton.disabled =
          pasteButton.disabled =
          randomizeButton.disabled =
          newButton.disabled =
          copyButton.disabled =
            true;
        return;
      }
      playButton.disabled = renderButton.disabled =
        this.config.keyframes.length < 2;
      if (this.config.isPlayingAnimation) {
        playButton.disabled = false;
      }
      prevButton.disabled = this.config.currentKeyframe <= 0;
      nextButton.disabled =
        this.config.currentKeyframe < 0 ||
        this.config.currentKeyframe >= this.config.totalKeyframes - 1;
      deleteButton.disabled = this.config.totalKeyframes <= 1;
      resetButton.disabled = this.config.totalKeyframes <= 1;
      pasteButton.disabled = !this.config.keyframeClipboard;
      randomizeButton.disabled =
        newButton.disabled =
        copyButton.disabled =
          !this.config.file;
    };
    prevButton = folder
      .addButton({ title: "Previous keyframe", disabled: true })
      .on("click", () => {
        this.trigger("click", "prevKeyframe");
        this.updateAnimationGui();
      });
    nextButton = folder
      .addButton({ title: "Next keyframe", disabled: true })
      .on("click", () => {
        this.trigger("click", "nextKeyframe");
        this.updateAnimationGui();
      });
    folder.addSeparator();
    newButton = folder
      .addButton({ title: "New keyframe", disabled: true })
      .on("click", () => {
        this.trigger("click", "newKeyframe");
        this.updateAnimationGui();
      });
    deleteButton = folder
      .addButton({ title: "Delete keyframe", disabled: true })
      .on("click", () => {
        this.trigger("click", "deleteKeyframe");
        this.updateAnimationGui();
      });
    resetButton = folder
      .addButton({ title: "Clear keyframes", disabled: true })
      .on("click", () => {
        this.trigger("click", "resetKeyframes");
        this.updateAnimationGui();
      });
    folder.addSeparator();
    copyButton = folder
      .addButton({ title: "Copy keyframe", disabled: true })
      .on("click", () => {
        this.trigger("click", "copyKeyframe");
        this.updateAnimationGui();
      });
    pasteButton = folder
      .addButton({ title: "Paste keyframe", disabled: true })
      .on("click", () => {
        this.trigger("click", "pasteKeyframe");
        this.updateAnimationGui();
      });
    folder.addInput(params, "randomizeStrength", {
      label: "Randomization Strength",
      min: 0,
      max: 1,
      step: 0.01,
    });
    randomizeButton = folder
      .addButton({ title: "Randomize", disabled: true })
      .on("click", () => this.trigger("click", "randomize"));
    folder.addSeparator();
    folder
      .addInput(params, "fps", {
        label: "FPS",
        min: 1,
        max: 60,
        step: 1,
      })
      .on("change", this.handle("fps"));
    folder.addInput(params, "loop", { label: "Loop" });
    folder.addInput(params, "firstFrameAsLastFrame", {
      label: "First frame as last",
    });
    playButton = folder
      .addButton({ title: "Play animation", disabled: true })
      .on("click", () => {
        this.trigger("click", "playAnimation");
        this.updateAnimationGui();
      });
    stopButton = folder
      .addButton({ title: "Stop", hidden: true })
      .on("click", () => {
        this.trigger("click", "stopAnimation");
        this.updateAnimationGui();
      });
    renderButton = folder
      .addButton({ title: "Export animation...", disabled: true })
      .on("click", () => {
        this.trigger("click", "exportAnimation");
        this.updateAnimationGui();
      });
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
