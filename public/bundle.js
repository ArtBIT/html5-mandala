(() => {
  var __defineProperty = Object.defineProperty;
  var __hasOwnProperty = Object.prototype.hasOwnProperty;
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };
  var __markAsModule = (target) => {
    return __defineProperty(target, "__esModule", {value: true});
  };
  var __exportStar = (target, module) => {
    __markAsModule(target);
    if (typeof module === "object" || typeof module === "function") {
      for (let key in module)
        if (__hasOwnProperty.call(module, key) && !__hasOwnProperty.call(target, key) && key !== "default")
          __defineProperty(target, key, {get: () => module[key], enumerable: true});
    }
    return target;
  };
  var __toModule = (module) => {
    if (module && module.__esModule)
      return module;
    return __exportStar(__defineProperty({}, "default", {value: module, enumerable: true}), module);
  };

  // node_modules/tweakpane/dist/tweakpane.js
  var require_tweakpane = __commonJS((exports, module) => {
    /*! Tweakpane 3.0.8 (c) 2016 cocopon, licensed under the MIT license. */
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Tweakpane = {}));
    })(exports, function(exports2) {
      "use strict";
      class Semver {
        constructor(text) {
          const [core, prerelease] = text.split("-");
          const coreComps = core.split(".");
          this.major = parseInt(coreComps[0], 10);
          this.minor = parseInt(coreComps[1], 10);
          this.patch = parseInt(coreComps[2], 10);
          this.prerelease = prerelease !== null && prerelease !== void 0 ? prerelease : null;
        }
        toString() {
          const core = [this.major, this.minor, this.patch].join(".");
          return this.prerelease !== null ? [core, this.prerelease].join("-") : core;
        }
      }
      class BladeApi {
        constructor(controller) {
          this.controller_ = controller;
        }
        get disabled() {
          return this.controller_.viewProps.get("disabled");
        }
        set disabled(disabled) {
          this.controller_.viewProps.set("disabled", disabled);
        }
        get hidden() {
          return this.controller_.viewProps.get("hidden");
        }
        set hidden(hidden) {
          this.controller_.viewProps.set("hidden", hidden);
        }
        dispose() {
          this.controller_.viewProps.set("disposed", true);
        }
      }
      class TpEvent {
        constructor(target) {
          this.target = target;
        }
      }
      class TpChangeEvent extends TpEvent {
        constructor(target, value, presetKey, last) {
          super(target);
          this.value = value;
          this.presetKey = presetKey;
          this.last = last !== null && last !== void 0 ? last : true;
        }
      }
      class TpUpdateEvent extends TpEvent {
        constructor(target, value, presetKey) {
          super(target);
          this.value = value;
          this.presetKey = presetKey;
        }
      }
      class TpFoldEvent extends TpEvent {
        constructor(target, expanded) {
          super(target);
          this.expanded = expanded;
        }
      }
      function forceCast(v) {
        return v;
      }
      function isEmpty(value) {
        return value === null || value === void 0;
      }
      function deepEqualsArray(a1, a2) {
        if (a1.length !== a2.length) {
          return false;
        }
        for (let i = 0; i < a1.length; i++) {
          if (a1[i] !== a2[i]) {
            return false;
          }
        }
        return true;
      }
      const CREATE_MESSAGE_MAP = {
        alreadydisposed: () => "View has been already disposed",
        invalidparams: (context) => `Invalid parameters for '${context.name}'`,
        nomatchingcontroller: (context) => `No matching controller for '${context.key}'`,
        nomatchingview: (context) => `No matching view for '${JSON.stringify(context.params)}'`,
        notbindable: () => `Value is not bindable`,
        propertynotfound: (context) => `Property '${context.name}' not found`,
        shouldneverhappen: () => "This error should never happen"
      };
      class TpError {
        constructor(config2) {
          var _a;
          this.message = (_a = CREATE_MESSAGE_MAP[config2.type](forceCast(config2.context))) !== null && _a !== void 0 ? _a : "Unexpected error";
          this.name = this.constructor.name;
          this.stack = new Error(this.message).stack;
          this.type = config2.type;
        }
        static alreadyDisposed() {
          return new TpError({type: "alreadydisposed"});
        }
        static notBindable() {
          return new TpError({
            type: "notbindable"
          });
        }
        static propertyNotFound(name) {
          return new TpError({
            type: "propertynotfound",
            context: {
              name
            }
          });
        }
        static shouldNeverHappen() {
          return new TpError({type: "shouldneverhappen"});
        }
      }
      class BindingTarget {
        constructor(obj, key, opt_id) {
          this.obj_ = obj;
          this.key_ = key;
          this.presetKey_ = opt_id !== null && opt_id !== void 0 ? opt_id : key;
        }
        static isBindable(obj) {
          if (obj === null) {
            return false;
          }
          if (typeof obj !== "object") {
            return false;
          }
          return true;
        }
        get key() {
          return this.key_;
        }
        get presetKey() {
          return this.presetKey_;
        }
        read() {
          return this.obj_[this.key_];
        }
        write(value) {
          this.obj_[this.key_] = value;
        }
        writeProperty(name, value) {
          const valueObj = this.read();
          if (!BindingTarget.isBindable(valueObj)) {
            throw TpError.notBindable();
          }
          if (!(name in valueObj)) {
            throw TpError.propertyNotFound(name);
          }
          valueObj[name] = value;
        }
      }
      class ButtonApi extends BladeApi {
        get label() {
          return this.controller_.props.get("label");
        }
        set label(label) {
          this.controller_.props.set("label", label);
        }
        get title() {
          var _a;
          return (_a = this.controller_.valueController.props.get("title")) !== null && _a !== void 0 ? _a : "";
        }
        set title(title) {
          this.controller_.valueController.props.set("title", title);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          const emitter = this.controller_.valueController.emitter;
          emitter.on(eventName, () => {
            bh(new TpEvent(this));
          });
          return this;
        }
      }
      class Emitter {
        constructor() {
          this.observers_ = {};
        }
        on(eventName, handler) {
          let observers = this.observers_[eventName];
          if (!observers) {
            observers = this.observers_[eventName] = [];
          }
          observers.push({
            handler
          });
          return this;
        }
        off(eventName, handler) {
          const observers = this.observers_[eventName];
          if (observers) {
            this.observers_[eventName] = observers.filter((observer) => {
              return observer.handler !== handler;
            });
          }
          return this;
        }
        emit(eventName, event2) {
          const observers = this.observers_[eventName];
          if (!observers) {
            return;
          }
          observers.forEach((observer) => {
            observer.handler(event2);
          });
        }
      }
      const PREFIX = "tp";
      function ClassName(viewName) {
        const fn = (opt_elementName, opt_modifier) => {
          return [
            PREFIX,
            "-",
            viewName,
            "v",
            opt_elementName ? `_${opt_elementName}` : "",
            opt_modifier ? `-${opt_modifier}` : ""
          ].join("");
        };
        return fn;
      }
      function compose(h1, h2) {
        return (input) => h2(h1(input));
      }
      function extractValue(ev) {
        return ev.rawValue;
      }
      function bindValue(value, applyValue) {
        value.emitter.on("change", compose(extractValue, applyValue));
        applyValue(value.rawValue);
      }
      function bindValueMap(valueMap, key, applyValue) {
        bindValue(valueMap.value(key), applyValue);
      }
      function applyClass(elem, className2, active) {
        if (active) {
          elem.classList.add(className2);
        } else {
          elem.classList.remove(className2);
        }
      }
      function valueToClassName(elem, className2) {
        return (value) => {
          applyClass(elem, className2, value);
        };
      }
      function bindValueToTextContent(value, elem) {
        bindValue(value, (text) => {
          elem.textContent = text !== null && text !== void 0 ? text : "";
        });
      }
      const className$q = ClassName("btn");
      class ButtonView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$q());
          config2.viewProps.bindClassModifiers(this.element);
          const buttonElem = doc.createElement("button");
          buttonElem.classList.add(className$q("b"));
          config2.viewProps.bindDisabled(buttonElem);
          this.element.appendChild(buttonElem);
          this.buttonElement = buttonElem;
          const titleElem = doc.createElement("div");
          titleElem.classList.add(className$q("t"));
          bindValueToTextContent(config2.props.value("title"), titleElem);
          this.buttonElement.appendChild(titleElem);
        }
      }
      class ButtonController {
        constructor(doc, config2) {
          this.emitter = new Emitter();
          this.onClick_ = this.onClick_.bind(this);
          this.props = config2.props;
          this.viewProps = config2.viewProps;
          this.view = new ButtonView(doc, {
            props: this.props,
            viewProps: this.viewProps
          });
          this.view.buttonElement.addEventListener("click", this.onClick_);
        }
        onClick_() {
          this.emitter.emit("click", {
            sender: this
          });
        }
      }
      class BoundValue {
        constructor(initialValue, config2) {
          var _a;
          this.constraint_ = config2 === null || config2 === void 0 ? void 0 : config2.constraint;
          this.equals_ = (_a = config2 === null || config2 === void 0 ? void 0 : config2.equals) !== null && _a !== void 0 ? _a : (v1, v2) => v1 === v2;
          this.emitter = new Emitter();
          this.rawValue_ = initialValue;
        }
        get constraint() {
          return this.constraint_;
        }
        get rawValue() {
          return this.rawValue_;
        }
        set rawValue(rawValue) {
          this.setRawValue(rawValue, {
            forceEmit: false,
            last: true
          });
        }
        setRawValue(rawValue, options) {
          const opts = options !== null && options !== void 0 ? options : {
            forceEmit: false,
            last: true
          };
          const constrainedValue = this.constraint_ ? this.constraint_.constrain(rawValue) : rawValue;
          const changed = !this.equals_(this.rawValue_, constrainedValue);
          if (!changed && !opts.forceEmit) {
            return;
          }
          this.emitter.emit("beforechange", {
            sender: this
          });
          this.rawValue_ = constrainedValue;
          this.emitter.emit("change", {
            options: opts,
            rawValue: constrainedValue,
            sender: this
          });
        }
      }
      class PrimitiveValue {
        constructor(initialValue) {
          this.emitter = new Emitter();
          this.value_ = initialValue;
        }
        get rawValue() {
          return this.value_;
        }
        set rawValue(value) {
          this.setRawValue(value, {
            forceEmit: false,
            last: true
          });
        }
        setRawValue(value, options) {
          const opts = options !== null && options !== void 0 ? options : {
            forceEmit: false,
            last: true
          };
          if (this.value_ === value && !opts.forceEmit) {
            return;
          }
          this.emitter.emit("beforechange", {
            sender: this
          });
          this.value_ = value;
          this.emitter.emit("change", {
            options: opts,
            rawValue: this.value_,
            sender: this
          });
        }
      }
      function createValue(initialValue, config2) {
        const constraint = config2 === null || config2 === void 0 ? void 0 : config2.constraint;
        const equals = config2 === null || config2 === void 0 ? void 0 : config2.equals;
        if (!constraint && !equals) {
          return new PrimitiveValue(initialValue);
        }
        return new BoundValue(initialValue, config2);
      }
      class ValueMap {
        constructor(valueMap) {
          this.emitter = new Emitter();
          this.valMap_ = valueMap;
          for (const key in this.valMap_) {
            const v = this.valMap_[key];
            v.emitter.on("change", () => {
              this.emitter.emit("change", {
                key,
                sender: this
              });
            });
          }
        }
        static createCore(initialValue) {
          const keys = Object.keys(initialValue);
          return keys.reduce((o, key) => {
            return Object.assign(o, {
              [key]: createValue(initialValue[key])
            });
          }, {});
        }
        static fromObject(initialValue) {
          const core = this.createCore(initialValue);
          return new ValueMap(core);
        }
        get(key) {
          return this.valMap_[key].rawValue;
        }
        set(key, value) {
          this.valMap_[key].rawValue = value;
        }
        value(key) {
          return this.valMap_[key];
        }
      }
      function parseObject(value, keyToParserMap) {
        const keys = Object.keys(keyToParserMap);
        const result = keys.reduce((tmp, key) => {
          if (tmp === void 0) {
            return void 0;
          }
          const parser = keyToParserMap[key];
          const result2 = parser(value[key]);
          return result2.succeeded ? Object.assign(Object.assign({}, tmp), {[key]: result2.value}) : void 0;
        }, {});
        return forceCast(result);
      }
      function parseArray(value, parseItem) {
        return value.reduce((tmp, item) => {
          if (tmp === void 0) {
            return void 0;
          }
          const result = parseItem(item);
          if (!result.succeeded || result.value === void 0) {
            return void 0;
          }
          return [...tmp, result.value];
        }, []);
      }
      function isObject(value) {
        if (value === null) {
          return false;
        }
        return typeof value === "object";
      }
      function createParamsParserBuilder(parse) {
        return (optional) => (v) => {
          if (!optional && v === void 0) {
            return {
              succeeded: false,
              value: void 0
            };
          }
          if (optional && v === void 0) {
            return {
              succeeded: true,
              value: void 0
            };
          }
          const result = parse(v);
          return result !== void 0 ? {
            succeeded: true,
            value: result
          } : {
            succeeded: false,
            value: void 0
          };
        };
      }
      function createParamsParserBuilders(optional) {
        return {
          custom: (parse) => createParamsParserBuilder(parse)(optional),
          boolean: createParamsParserBuilder((v) => typeof v === "boolean" ? v : void 0)(optional),
          number: createParamsParserBuilder((v) => typeof v === "number" ? v : void 0)(optional),
          string: createParamsParserBuilder((v) => typeof v === "string" ? v : void 0)(optional),
          function: createParamsParserBuilder((v) => typeof v === "function" ? v : void 0)(optional),
          constant: (value) => createParamsParserBuilder((v) => v === value ? value : void 0)(optional),
          raw: createParamsParserBuilder((v) => v)(optional),
          object: (keyToParserMap) => createParamsParserBuilder((v) => {
            if (!isObject(v)) {
              return void 0;
            }
            return parseObject(v, keyToParserMap);
          })(optional),
          array: (itemParser) => createParamsParserBuilder((v) => {
            if (!Array.isArray(v)) {
              return void 0;
            }
            return parseArray(v, itemParser);
          })(optional)
        };
      }
      const ParamsParsers = {
        optional: createParamsParserBuilders(true),
        required: createParamsParserBuilders(false)
      };
      function parseParams(value, keyToParserMap) {
        const result = ParamsParsers.required.object(keyToParserMap)(value);
        return result.succeeded ? result.value : void 0;
      }
      function disposeElement(elem) {
        if (elem && elem.parentElement) {
          elem.parentElement.removeChild(elem);
        }
        return null;
      }
      function getAllBladePositions() {
        return ["veryfirst", "first", "last", "verylast"];
      }
      const className$p = ClassName("");
      const POS_TO_CLASS_NAME_MAP = {
        veryfirst: "vfst",
        first: "fst",
        last: "lst",
        verylast: "vlst"
      };
      class BladeController {
        constructor(config2) {
          this.parent_ = null;
          this.blade = config2.blade;
          this.view = config2.view;
          this.viewProps = config2.viewProps;
          const elem = this.view.element;
          this.blade.value("positions").emitter.on("change", () => {
            getAllBladePositions().forEach((pos) => {
              elem.classList.remove(className$p(void 0, POS_TO_CLASS_NAME_MAP[pos]));
            });
            this.blade.get("positions").forEach((pos) => {
              elem.classList.add(className$p(void 0, POS_TO_CLASS_NAME_MAP[pos]));
            });
          });
          this.viewProps.handleDispose(() => {
            disposeElement(elem);
          });
        }
        get parent() {
          return this.parent_;
        }
      }
      const SVG_NS = "http://www.w3.org/2000/svg";
      function forceReflow(element) {
        element.offsetHeight;
      }
      function disableTransitionTemporarily(element, callback) {
        const t = element.style.transition;
        element.style.transition = "none";
        callback();
        element.style.transition = t;
      }
      function supportsTouch(doc) {
        return doc.ontouchstart !== void 0;
      }
      function getGlobalObject() {
        return new Function("return this")();
      }
      function getWindowDocument() {
        const globalObj = forceCast(getGlobalObject());
        return globalObj.document;
      }
      function getCanvasContext(canvasElement) {
        const win = canvasElement.ownerDocument.defaultView;
        if (!win) {
          return null;
        }
        const isBrowser = "document" in win;
        return isBrowser ? canvasElement.getContext("2d") : null;
      }
      const ICON_ID_TO_INNER_HTML_MAP = {
        check: '<path d="M2 8l4 4l8 -8"/>',
        dropdown: '<path d="M5 7h6l-3 3 z"/>',
        p2dpad: '<path d="M8 4v8"/><path d="M4 8h8"/><circle cx="12" cy="12" r="1.2"/>'
      };
      function createSvgIconElement(document2, iconId) {
        const elem = document2.createElementNS(SVG_NS, "svg");
        elem.innerHTML = ICON_ID_TO_INNER_HTML_MAP[iconId];
        return elem;
      }
      function insertElementAt(parentElement, element, index) {
        parentElement.insertBefore(element, parentElement.children[index]);
      }
      function removeElement(element) {
        if (element.parentElement) {
          element.parentElement.removeChild(element);
        }
      }
      function removeChildElements(element) {
        while (element.children.length > 0) {
          element.removeChild(element.children[0]);
        }
      }
      function removeChildNodes(element) {
        while (element.childNodes.length > 0) {
          element.removeChild(element.childNodes[0]);
        }
      }
      function findNextTarget(ev) {
        if (ev.relatedTarget) {
          return forceCast(ev.relatedTarget);
        }
        if ("explicitOriginalTarget" in ev) {
          return ev.explicitOriginalTarget;
        }
        return null;
      }
      const className$o = ClassName("lbl");
      function createLabelNode(doc, label) {
        const frag = doc.createDocumentFragment();
        const lineNodes = label.split("\n").map((line) => {
          return doc.createTextNode(line);
        });
        lineNodes.forEach((lineNode, index) => {
          if (index > 0) {
            frag.appendChild(doc.createElement("br"));
          }
          frag.appendChild(lineNode);
        });
        return frag;
      }
      class LabelView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$o());
          config2.viewProps.bindClassModifiers(this.element);
          const labelElem = doc.createElement("div");
          labelElem.classList.add(className$o("l"));
          bindValueMap(config2.props, "label", (value) => {
            if (isEmpty(value)) {
              this.element.classList.add(className$o(void 0, "nol"));
            } else {
              this.element.classList.remove(className$o(void 0, "nol"));
              removeChildNodes(labelElem);
              labelElem.appendChild(createLabelNode(doc, value));
            }
          });
          this.element.appendChild(labelElem);
          this.labelElement = labelElem;
          const valueElem = doc.createElement("div");
          valueElem.classList.add(className$o("v"));
          this.element.appendChild(valueElem);
          this.valueElement = valueElem;
        }
      }
      class LabelController extends BladeController {
        constructor(doc, config2) {
          const viewProps = config2.valueController.viewProps;
          super(Object.assign(Object.assign({}, config2), {view: new LabelView(doc, {
            props: config2.props,
            viewProps
          }), viewProps}));
          this.props = config2.props;
          this.valueController = config2.valueController;
          this.view.valueElement.appendChild(this.valueController.view.element);
        }
      }
      const ButtonBladePlugin = {
        id: "button",
        type: "blade",
        accept(params) {
          const p = ParamsParsers;
          const result = parseParams(params, {
            title: p.required.string,
            view: p.required.constant("button"),
            label: p.optional.string
          });
          return result ? {params: result} : null;
        },
        controller(args) {
          return new LabelController(args.document, {
            blade: args.blade,
            props: ValueMap.fromObject({
              label: args.params.label
            }),
            valueController: new ButtonController(args.document, {
              props: ValueMap.fromObject({
                title: args.params.title
              }),
              viewProps: args.viewProps
            })
          });
        },
        api(args) {
          if (!(args.controller instanceof LabelController)) {
            return null;
          }
          if (!(args.controller.valueController instanceof ButtonController)) {
            return null;
          }
          return new ButtonApi(args.controller);
        }
      };
      class ValueBladeController extends BladeController {
        constructor(config2) {
          super(config2);
          this.value = config2.value;
        }
      }
      function createBlade() {
        return new ValueMap({
          positions: createValue([], {
            equals: deepEqualsArray
          })
        });
      }
      class Foldable extends ValueMap {
        constructor(valueMap) {
          super(valueMap);
        }
        static create(expanded) {
          const coreObj = {
            completed: true,
            expanded,
            expandedHeight: null,
            shouldFixHeight: false,
            temporaryExpanded: null
          };
          const core = ValueMap.createCore(coreObj);
          return new Foldable(core);
        }
        get styleExpanded() {
          var _a;
          return (_a = this.get("temporaryExpanded")) !== null && _a !== void 0 ? _a : this.get("expanded");
        }
        get styleHeight() {
          if (!this.styleExpanded) {
            return "0";
          }
          const exHeight = this.get("expandedHeight");
          if (this.get("shouldFixHeight") && !isEmpty(exHeight)) {
            return `${exHeight}px`;
          }
          return "auto";
        }
        bindExpandedClass(elem, expandedClassName) {
          const onExpand = () => {
            const expanded = this.styleExpanded;
            if (expanded) {
              elem.classList.add(expandedClassName);
            } else {
              elem.classList.remove(expandedClassName);
            }
          };
          bindValueMap(this, "expanded", onExpand);
          bindValueMap(this, "temporaryExpanded", onExpand);
        }
        cleanUpTransition() {
          this.set("shouldFixHeight", false);
          this.set("expandedHeight", null);
          this.set("completed", true);
        }
      }
      function computeExpandedFolderHeight(folder, containerElement) {
        let height = 0;
        disableTransitionTemporarily(containerElement, () => {
          folder.set("expandedHeight", null);
          folder.set("temporaryExpanded", true);
          forceReflow(containerElement);
          height = containerElement.clientHeight;
          folder.set("temporaryExpanded", null);
          forceReflow(containerElement);
        });
        return height;
      }
      function applyHeight(foldable, elem) {
        elem.style.height = foldable.styleHeight;
      }
      function bindFoldable(foldable, elem) {
        foldable.value("expanded").emitter.on("beforechange", () => {
          foldable.set("completed", false);
          if (isEmpty(foldable.get("expandedHeight"))) {
            foldable.set("expandedHeight", computeExpandedFolderHeight(foldable, elem));
          }
          foldable.set("shouldFixHeight", true);
          forceReflow(elem);
        });
        foldable.emitter.on("change", () => {
          applyHeight(foldable, elem);
        });
        applyHeight(foldable, elem);
        elem.addEventListener("transitionend", (ev) => {
          if (ev.propertyName !== "height") {
            return;
          }
          foldable.cleanUpTransition();
        });
      }
      class RackLikeApi extends BladeApi {
        constructor(controller, rackApi) {
          super(controller);
          this.rackApi_ = rackApi;
        }
      }
      function addButtonAsBlade(api, params) {
        return api.addBlade(Object.assign(Object.assign({}, params), {view: "button"}));
      }
      function addFolderAsBlade(api, params) {
        return api.addBlade(Object.assign(Object.assign({}, params), {view: "folder"}));
      }
      function addSeparatorAsBlade(api, opt_params) {
        const params = opt_params || {};
        return api.addBlade(Object.assign(Object.assign({}, params), {view: "separator"}));
      }
      function addTabAsBlade(api, params) {
        return api.addBlade(Object.assign(Object.assign({}, params), {view: "tab"}));
      }
      class NestedOrderedSet {
        constructor(extract) {
          this.emitter = new Emitter();
          this.items_ = [];
          this.cache_ = new Set();
          this.onSubListAdd_ = this.onSubListAdd_.bind(this);
          this.onSubListRemove_ = this.onSubListRemove_.bind(this);
          this.extract_ = extract;
        }
        get items() {
          return this.items_;
        }
        allItems() {
          return Array.from(this.cache_);
        }
        find(callback) {
          for (const item of this.allItems()) {
            if (callback(item)) {
              return item;
            }
          }
          return null;
        }
        includes(item) {
          return this.cache_.has(item);
        }
        add(item, opt_index) {
          if (this.includes(item)) {
            throw TpError.shouldNeverHappen();
          }
          const index = opt_index !== void 0 ? opt_index : this.items_.length;
          this.items_.splice(index, 0, item);
          this.cache_.add(item);
          const subList = this.extract_(item);
          if (subList) {
            subList.emitter.on("add", this.onSubListAdd_);
            subList.emitter.on("remove", this.onSubListRemove_);
            subList.allItems().forEach((item2) => {
              this.cache_.add(item2);
            });
          }
          this.emitter.emit("add", {
            index,
            item,
            root: this,
            target: this
          });
        }
        remove(item) {
          const index = this.items_.indexOf(item);
          if (index < 0) {
            return;
          }
          this.items_.splice(index, 1);
          this.cache_.delete(item);
          const subList = this.extract_(item);
          if (subList) {
            subList.emitter.off("add", this.onSubListAdd_);
            subList.emitter.off("remove", this.onSubListRemove_);
          }
          this.emitter.emit("remove", {
            index,
            item,
            root: this,
            target: this
          });
        }
        onSubListAdd_(ev) {
          this.cache_.add(ev.item);
          this.emitter.emit("add", {
            index: ev.index,
            item: ev.item,
            root: this,
            target: ev.target
          });
        }
        onSubListRemove_(ev) {
          this.cache_.delete(ev.item);
          this.emitter.emit("remove", {
            index: ev.index,
            item: ev.item,
            root: this,
            target: ev.target
          });
        }
      }
      class InputBindingApi extends BladeApi {
        constructor(controller) {
          super(controller);
          this.onBindingChange_ = this.onBindingChange_.bind(this);
          this.emitter_ = new Emitter();
          this.controller_.binding.emitter.on("change", this.onBindingChange_);
        }
        get label() {
          return this.controller_.props.get("label");
        }
        set label(label) {
          this.controller_.props.set("label", label);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
        refresh() {
          this.controller_.binding.read();
        }
        onBindingChange_(ev) {
          const value = ev.sender.target.read();
          this.emitter_.emit("change", {
            event: new TpChangeEvent(this, forceCast(value), this.controller_.binding.target.presetKey, ev.options.last)
          });
        }
      }
      class InputBindingController extends LabelController {
        constructor(doc, config2) {
          super(doc, config2);
          this.binding = config2.binding;
        }
      }
      class MonitorBindingApi extends BladeApi {
        constructor(controller) {
          super(controller);
          this.onBindingUpdate_ = this.onBindingUpdate_.bind(this);
          this.emitter_ = new Emitter();
          this.controller_.binding.emitter.on("update", this.onBindingUpdate_);
        }
        get label() {
          return this.controller_.props.get("label");
        }
        set label(label) {
          this.controller_.props.set("label", label);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
        refresh() {
          this.controller_.binding.read();
        }
        onBindingUpdate_(ev) {
          const value = ev.sender.target.read();
          this.emitter_.emit("update", {
            event: new TpUpdateEvent(this, forceCast(value), this.controller_.binding.target.presetKey)
          });
        }
      }
      class MonitorBindingController extends LabelController {
        constructor(doc, config2) {
          super(doc, config2);
          this.binding = config2.binding;
          this.viewProps.bindDisabled(this.binding.ticker);
          this.viewProps.handleDispose(() => {
            this.binding.dispose();
          });
        }
      }
      function findSubBladeApiSet(api) {
        if (api instanceof RackApi) {
          return api["apiSet_"];
        }
        if (api instanceof RackLikeApi) {
          return api["rackApi_"]["apiSet_"];
        }
        return null;
      }
      function getApiByController(apiSet, controller) {
        const api = apiSet.find((api2) => api2.controller_ === controller);
        if (!api) {
          throw TpError.shouldNeverHappen();
        }
        return api;
      }
      function createBindingTarget(obj, key, opt_id) {
        if (!BindingTarget.isBindable(obj)) {
          throw TpError.notBindable();
        }
        return new BindingTarget(obj, key, opt_id);
      }
      class RackApi extends BladeApi {
        constructor(controller, pool) {
          super(controller);
          this.onRackAdd_ = this.onRackAdd_.bind(this);
          this.onRackRemove_ = this.onRackRemove_.bind(this);
          this.onRackInputChange_ = this.onRackInputChange_.bind(this);
          this.onRackMonitorUpdate_ = this.onRackMonitorUpdate_.bind(this);
          this.emitter_ = new Emitter();
          this.apiSet_ = new NestedOrderedSet(findSubBladeApiSet);
          this.pool_ = pool;
          const rack = this.controller_.rack;
          rack.emitter.on("add", this.onRackAdd_);
          rack.emitter.on("remove", this.onRackRemove_);
          rack.emitter.on("inputchange", this.onRackInputChange_);
          rack.emitter.on("monitorupdate", this.onRackMonitorUpdate_);
          rack.children.forEach((bc) => {
            this.setUpApi_(bc);
          });
        }
        get children() {
          return this.controller_.rack.children.map((bc) => getApiByController(this.apiSet_, bc));
        }
        addInput(object, key, opt_params) {
          const params = opt_params || {};
          const doc = this.controller_.view.element.ownerDocument;
          const bc = this.pool_.createInput(doc, createBindingTarget(object, key, params.presetKey), params);
          const api = new InputBindingApi(bc);
          return this.add(api, params.index);
        }
        addMonitor(object, key, opt_params) {
          const params = opt_params || {};
          const doc = this.controller_.view.element.ownerDocument;
          const bc = this.pool_.createMonitor(doc, createBindingTarget(object, key), params);
          const api = new MonitorBindingApi(bc);
          return forceCast(this.add(api, params.index));
        }
        addFolder(params) {
          return addFolderAsBlade(this, params);
        }
        addButton(params) {
          return addButtonAsBlade(this, params);
        }
        addSeparator(opt_params) {
          return addSeparatorAsBlade(this, opt_params);
        }
        addTab(params) {
          return addTabAsBlade(this, params);
        }
        add(api, opt_index) {
          this.controller_.rack.add(api.controller_, opt_index);
          const gapi = this.apiSet_.find((a) => a.controller_ === api.controller_);
          if (gapi) {
            this.apiSet_.remove(gapi);
          }
          this.apiSet_.add(api);
          return api;
        }
        remove(api) {
          this.controller_.rack.remove(api.controller_);
        }
        addBlade(params) {
          const doc = this.controller_.view.element.ownerDocument;
          const bc = this.pool_.createBlade(doc, params);
          const api = this.pool_.createBladeApi(bc);
          return this.add(api, params.index);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
        setUpApi_(bc) {
          const api = this.apiSet_.find((api2) => api2.controller_ === bc);
          if (!api) {
            this.apiSet_.add(this.pool_.createBladeApi(bc));
          }
        }
        onRackAdd_(ev) {
          this.setUpApi_(ev.bladeController);
        }
        onRackRemove_(ev) {
          if (ev.isRoot) {
            const api = getApiByController(this.apiSet_, ev.bladeController);
            this.apiSet_.remove(api);
          }
        }
        onRackInputChange_(ev) {
          const bc = ev.bladeController;
          if (bc instanceof InputBindingController) {
            const api = getApiByController(this.apiSet_, bc);
            const binding = bc.binding;
            this.emitter_.emit("change", {
              event: new TpChangeEvent(api, forceCast(binding.target.read()), binding.target.presetKey, ev.options.last)
            });
          } else if (bc instanceof ValueBladeController) {
            const api = getApiByController(this.apiSet_, bc);
            this.emitter_.emit("change", {
              event: new TpChangeEvent(api, bc.value.rawValue, void 0, ev.options.last)
            });
          }
        }
        onRackMonitorUpdate_(ev) {
          if (!(ev.bladeController instanceof MonitorBindingController)) {
            throw TpError.shouldNeverHappen();
          }
          const api = getApiByController(this.apiSet_, ev.bladeController);
          const binding = ev.bladeController.binding;
          this.emitter_.emit("update", {
            event: new TpUpdateEvent(api, forceCast(binding.target.read()), binding.target.presetKey)
          });
        }
      }
      class FolderApi extends RackLikeApi {
        constructor(controller, pool) {
          super(controller, new RackApi(controller.rackController, pool));
          this.emitter_ = new Emitter();
          this.controller_.foldable.value("expanded").emitter.on("change", (ev) => {
            this.emitter_.emit("fold", {
              event: new TpFoldEvent(this, ev.sender.rawValue)
            });
          });
          this.rackApi_.on("change", (ev) => {
            this.emitter_.emit("change", {
              event: ev
            });
          });
          this.rackApi_.on("update", (ev) => {
            this.emitter_.emit("update", {
              event: ev
            });
          });
        }
        get expanded() {
          return this.controller_.foldable.get("expanded");
        }
        set expanded(expanded) {
          this.controller_.foldable.set("expanded", expanded);
        }
        get title() {
          return this.controller_.props.get("title");
        }
        set title(title) {
          this.controller_.props.set("title", title);
        }
        get children() {
          return this.rackApi_.children;
        }
        addInput(object, key, opt_params) {
          return this.rackApi_.addInput(object, key, opt_params);
        }
        addMonitor(object, key, opt_params) {
          return this.rackApi_.addMonitor(object, key, opt_params);
        }
        addFolder(params) {
          return this.rackApi_.addFolder(params);
        }
        addButton(params) {
          return this.rackApi_.addButton(params);
        }
        addSeparator(opt_params) {
          return this.rackApi_.addSeparator(opt_params);
        }
        addTab(params) {
          return this.rackApi_.addTab(params);
        }
        add(api, opt_index) {
          return this.rackApi_.add(api, opt_index);
        }
        remove(api) {
          this.rackApi_.remove(api);
        }
        addBlade(params) {
          return this.rackApi_.addBlade(params);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
      }
      class RackLikeController extends BladeController {
        constructor(config2) {
          super({
            blade: config2.blade,
            view: config2.view,
            viewProps: config2.rackController.viewProps
          });
          this.rackController = config2.rackController;
        }
      }
      class PlainView {
        constructor(doc, config2) {
          const className2 = ClassName(config2.viewName);
          this.element = doc.createElement("div");
          this.element.classList.add(className2());
          config2.viewProps.bindClassModifiers(this.element);
        }
      }
      function findInputBindingController(bcs, b) {
        for (let i = 0; i < bcs.length; i++) {
          const bc = bcs[i];
          if (bc instanceof InputBindingController && bc.binding === b) {
            return bc;
          }
        }
        return null;
      }
      function findMonitorBindingController(bcs, b) {
        for (let i = 0; i < bcs.length; i++) {
          const bc = bcs[i];
          if (bc instanceof MonitorBindingController && bc.binding === b) {
            return bc;
          }
        }
        return null;
      }
      function findValueBladeController(bcs, v) {
        for (let i = 0; i < bcs.length; i++) {
          const bc = bcs[i];
          if (bc instanceof ValueBladeController && bc.value === v) {
            return bc;
          }
        }
        return null;
      }
      function findSubRack(bc) {
        if (bc instanceof RackController) {
          return bc.rack;
        }
        if (bc instanceof RackLikeController) {
          return bc.rackController.rack;
        }
        return null;
      }
      function findSubBladeControllerSet(bc) {
        const rack = findSubRack(bc);
        return rack ? rack["bcSet_"] : null;
      }
      class BladeRack {
        constructor(blade) {
          var _a;
          this.onBladePositionsChange_ = this.onBladePositionsChange_.bind(this);
          this.onSetAdd_ = this.onSetAdd_.bind(this);
          this.onSetRemove_ = this.onSetRemove_.bind(this);
          this.onChildDispose_ = this.onChildDispose_.bind(this);
          this.onChildPositionsChange_ = this.onChildPositionsChange_.bind(this);
          this.onChildInputChange_ = this.onChildInputChange_.bind(this);
          this.onChildMonitorUpdate_ = this.onChildMonitorUpdate_.bind(this);
          this.onChildValueChange_ = this.onChildValueChange_.bind(this);
          this.onChildViewPropsChange_ = this.onChildViewPropsChange_.bind(this);
          this.onDescendantLayout_ = this.onDescendantLayout_.bind(this);
          this.onDescendantInputChange_ = this.onDescendantInputChange_.bind(this);
          this.onDescendantMonitorUpdate_ = this.onDescendantMonitorUpdate_.bind(this);
          this.emitter = new Emitter();
          this.blade_ = blade !== null && blade !== void 0 ? blade : null;
          (_a = this.blade_) === null || _a === void 0 ? void 0 : _a.value("positions").emitter.on("change", this.onBladePositionsChange_);
          this.bcSet_ = new NestedOrderedSet(findSubBladeControllerSet);
          this.bcSet_.emitter.on("add", this.onSetAdd_);
          this.bcSet_.emitter.on("remove", this.onSetRemove_);
        }
        get children() {
          return this.bcSet_.items;
        }
        add(bc, opt_index) {
          if (bc.parent) {
            bc.parent.remove(bc);
          }
          bc["parent_"] = this;
          this.bcSet_.add(bc, opt_index);
        }
        remove(bc) {
          bc["parent_"] = null;
          this.bcSet_.remove(bc);
        }
        find(controllerClass) {
          return forceCast(this.bcSet_.allItems().filter((bc) => {
            return bc instanceof controllerClass;
          }));
        }
        onSetAdd_(ev) {
          this.updatePositions_();
          const isRoot = ev.target === ev.root;
          this.emitter.emit("add", {
            bladeController: ev.item,
            index: ev.index,
            isRoot,
            sender: this
          });
          if (!isRoot) {
            return;
          }
          const bc = ev.item;
          bc.viewProps.emitter.on("change", this.onChildViewPropsChange_);
          bc.blade.value("positions").emitter.on("change", this.onChildPositionsChange_);
          bc.viewProps.handleDispose(this.onChildDispose_);
          if (bc instanceof InputBindingController) {
            bc.binding.emitter.on("change", this.onChildInputChange_);
          } else if (bc instanceof MonitorBindingController) {
            bc.binding.emitter.on("update", this.onChildMonitorUpdate_);
          } else if (bc instanceof ValueBladeController) {
            bc.value.emitter.on("change", this.onChildValueChange_);
          } else {
            const rack = findSubRack(bc);
            if (rack) {
              const emitter = rack.emitter;
              emitter.on("layout", this.onDescendantLayout_);
              emitter.on("inputchange", this.onDescendantInputChange_);
              emitter.on("monitorupdate", this.onDescendantMonitorUpdate_);
            }
          }
        }
        onSetRemove_(ev) {
          this.updatePositions_();
          const isRoot = ev.target === ev.root;
          this.emitter.emit("remove", {
            bladeController: ev.item,
            isRoot,
            sender: this
          });
          if (!isRoot) {
            return;
          }
          const bc = ev.item;
          if (bc instanceof InputBindingController) {
            bc.binding.emitter.off("change", this.onChildInputChange_);
          } else if (bc instanceof MonitorBindingController) {
            bc.binding.emitter.off("update", this.onChildMonitorUpdate_);
          } else if (bc instanceof ValueBladeController) {
            bc.value.emitter.off("change", this.onChildValueChange_);
          } else {
            const rack = findSubRack(bc);
            if (rack) {
              const emitter = rack.emitter;
              emitter.off("layout", this.onDescendantLayout_);
              emitter.off("inputchange", this.onDescendantInputChange_);
              emitter.off("monitorupdate", this.onDescendantMonitorUpdate_);
            }
          }
        }
        updatePositions_() {
          const visibleItems = this.bcSet_.items.filter((bc) => !bc.viewProps.get("hidden"));
          const firstVisibleItem = visibleItems[0];
          const lastVisibleItem = visibleItems[visibleItems.length - 1];
          this.bcSet_.items.forEach((bc) => {
            const ps = [];
            if (bc === firstVisibleItem) {
              ps.push("first");
              if (!this.blade_ || this.blade_.get("positions").includes("veryfirst")) {
                ps.push("veryfirst");
              }
            }
            if (bc === lastVisibleItem) {
              ps.push("last");
              if (!this.blade_ || this.blade_.get("positions").includes("verylast")) {
                ps.push("verylast");
              }
            }
            bc.blade.set("positions", ps);
          });
        }
        onChildPositionsChange_() {
          this.updatePositions_();
          this.emitter.emit("layout", {
            sender: this
          });
        }
        onChildViewPropsChange_(_ev) {
          this.updatePositions_();
          this.emitter.emit("layout", {
            sender: this
          });
        }
        onChildDispose_() {
          const disposedUcs = this.bcSet_.items.filter((bc) => {
            return bc.viewProps.get("disposed");
          });
          disposedUcs.forEach((bc) => {
            this.bcSet_.remove(bc);
          });
        }
        onChildInputChange_(ev) {
          const bc = findInputBindingController(this.find(InputBindingController), ev.sender);
          if (!bc) {
            throw TpError.shouldNeverHappen();
          }
          this.emitter.emit("inputchange", {
            bladeController: bc,
            options: ev.options,
            sender: this
          });
        }
        onChildMonitorUpdate_(ev) {
          const bc = findMonitorBindingController(this.find(MonitorBindingController), ev.sender);
          if (!bc) {
            throw TpError.shouldNeverHappen();
          }
          this.emitter.emit("monitorupdate", {
            bladeController: bc,
            sender: this
          });
        }
        onChildValueChange_(ev) {
          const bc = findValueBladeController(this.find(ValueBladeController), ev.sender);
          if (!bc) {
            throw TpError.shouldNeverHappen();
          }
          this.emitter.emit("inputchange", {
            bladeController: bc,
            options: ev.options,
            sender: this
          });
        }
        onDescendantLayout_(_) {
          this.updatePositions_();
          this.emitter.emit("layout", {
            sender: this
          });
        }
        onDescendantInputChange_(ev) {
          this.emitter.emit("inputchange", {
            bladeController: ev.bladeController,
            options: ev.options,
            sender: this
          });
        }
        onDescendantMonitorUpdate_(ev) {
          this.emitter.emit("monitorupdate", {
            bladeController: ev.bladeController,
            sender: this
          });
        }
        onBladePositionsChange_() {
          this.updatePositions_();
        }
      }
      class RackController extends BladeController {
        constructor(doc, config2) {
          super(Object.assign(Object.assign({}, config2), {view: new PlainView(doc, {
            viewName: "brk",
            viewProps: config2.viewProps
          })}));
          this.onRackAdd_ = this.onRackAdd_.bind(this);
          this.onRackRemove_ = this.onRackRemove_.bind(this);
          const rack = new BladeRack(config2.root ? void 0 : config2.blade);
          rack.emitter.on("add", this.onRackAdd_);
          rack.emitter.on("remove", this.onRackRemove_);
          this.rack = rack;
          this.viewProps.handleDispose(() => {
            for (let i = this.rack.children.length - 1; i >= 0; i--) {
              const bc = this.rack.children[i];
              bc.viewProps.set("disposed", true);
            }
          });
        }
        onRackAdd_(ev) {
          if (!ev.isRoot) {
            return;
          }
          insertElementAt(this.view.element, ev.bladeController.view.element, ev.index);
        }
        onRackRemove_(ev) {
          if (!ev.isRoot) {
            return;
          }
          removeElement(ev.bladeController.view.element);
        }
      }
      const bladeContainerClassName = ClassName("cnt");
      class FolderView {
        constructor(doc, config2) {
          this.className_ = ClassName(config2.viewName || "fld");
          this.element = doc.createElement("div");
          this.element.classList.add(this.className_(), bladeContainerClassName());
          config2.viewProps.bindClassModifiers(this.element);
          this.foldable_ = config2.foldable;
          this.foldable_.bindExpandedClass(this.element, this.className_(void 0, "expanded"));
          bindValueMap(this.foldable_, "completed", valueToClassName(this.element, this.className_(void 0, "cpl")));
          const buttonElem = doc.createElement("button");
          buttonElem.classList.add(this.className_("b"));
          bindValueMap(config2.props, "title", (title) => {
            if (isEmpty(title)) {
              this.element.classList.add(this.className_(void 0, "not"));
            } else {
              this.element.classList.remove(this.className_(void 0, "not"));
            }
          });
          config2.viewProps.bindDisabled(buttonElem);
          this.element.appendChild(buttonElem);
          this.buttonElement = buttonElem;
          const titleElem = doc.createElement("div");
          titleElem.classList.add(this.className_("t"));
          bindValueToTextContent(config2.props.value("title"), titleElem);
          this.buttonElement.appendChild(titleElem);
          this.titleElement = titleElem;
          const markElem = doc.createElement("div");
          markElem.classList.add(this.className_("m"));
          this.buttonElement.appendChild(markElem);
          const containerElem = config2.containerElement;
          containerElem.classList.add(this.className_("c"));
          this.element.appendChild(containerElem);
          this.containerElement = containerElem;
        }
      }
      class FolderController extends RackLikeController {
        constructor(doc, config2) {
          var _a;
          const foldable = Foldable.create((_a = config2.expanded) !== null && _a !== void 0 ? _a : true);
          const rc = new RackController(doc, {
            blade: config2.blade,
            root: config2.root,
            viewProps: config2.viewProps
          });
          super(Object.assign(Object.assign({}, config2), {rackController: rc, view: new FolderView(doc, {
            containerElement: rc.view.element,
            foldable,
            props: config2.props,
            viewName: config2.root ? "rot" : void 0,
            viewProps: config2.viewProps
          })}));
          this.onTitleClick_ = this.onTitleClick_.bind(this);
          this.props = config2.props;
          this.foldable = foldable;
          bindFoldable(this.foldable, this.view.containerElement);
          this.rackController.rack.emitter.on("add", () => {
            this.foldable.cleanUpTransition();
          });
          this.rackController.rack.emitter.on("remove", () => {
            this.foldable.cleanUpTransition();
          });
          this.view.buttonElement.addEventListener("click", this.onTitleClick_);
        }
        get document() {
          return this.view.element.ownerDocument;
        }
        onTitleClick_() {
          this.foldable.set("expanded", !this.foldable.get("expanded"));
        }
      }
      const FolderBladePlugin = {
        id: "folder",
        type: "blade",
        accept(params) {
          const p = ParamsParsers;
          const result = parseParams(params, {
            title: p.required.string,
            view: p.required.constant("folder"),
            expanded: p.optional.boolean
          });
          return result ? {params: result} : null;
        },
        controller(args) {
          return new FolderController(args.document, {
            blade: args.blade,
            expanded: args.params.expanded,
            props: ValueMap.fromObject({
              title: args.params.title
            }),
            viewProps: args.viewProps
          });
        },
        api(args) {
          if (!(args.controller instanceof FolderController)) {
            return null;
          }
          return new FolderApi(args.controller, args.pool);
        }
      };
      class LabeledValueController extends ValueBladeController {
        constructor(doc, config2) {
          const viewProps = config2.valueController.viewProps;
          super(Object.assign(Object.assign({}, config2), {value: config2.valueController.value, view: new LabelView(doc, {
            props: config2.props,
            viewProps
          }), viewProps}));
          this.props = config2.props;
          this.valueController = config2.valueController;
          this.view.valueElement.appendChild(this.valueController.view.element);
        }
      }
      class SeparatorApi extends BladeApi {
      }
      const className$n = ClassName("spr");
      class SeparatorView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$n());
          config2.viewProps.bindClassModifiers(this.element);
          const hrElem = doc.createElement("hr");
          hrElem.classList.add(className$n("r"));
          this.element.appendChild(hrElem);
        }
      }
      class SeparatorController extends BladeController {
        constructor(doc, config2) {
          super(Object.assign(Object.assign({}, config2), {view: new SeparatorView(doc, {
            viewProps: config2.viewProps
          })}));
        }
      }
      const SeparatorBladePlugin = {
        id: "separator",
        type: "blade",
        accept(params) {
          const p = ParamsParsers;
          const result = parseParams(params, {
            view: p.required.constant("separator")
          });
          return result ? {params: result} : null;
        },
        controller(args) {
          return new SeparatorController(args.document, {
            blade: args.blade,
            viewProps: args.viewProps
          });
        },
        api(args) {
          if (!(args.controller instanceof SeparatorController)) {
            return null;
          }
          return new SeparatorApi(args.controller);
        }
      };
      const className$m = ClassName("");
      function valueToModifier(elem, modifier) {
        return valueToClassName(elem, className$m(void 0, modifier));
      }
      class ViewProps extends ValueMap {
        constructor(valueMap) {
          super(valueMap);
        }
        static create(opt_initialValue) {
          var _a, _b;
          const initialValue = opt_initialValue !== null && opt_initialValue !== void 0 ? opt_initialValue : {};
          const coreObj = {
            disabled: (_a = initialValue.disabled) !== null && _a !== void 0 ? _a : false,
            disposed: false,
            hidden: (_b = initialValue.hidden) !== null && _b !== void 0 ? _b : false
          };
          const core = ValueMap.createCore(coreObj);
          return new ViewProps(core);
        }
        bindClassModifiers(elem) {
          bindValueMap(this, "disabled", valueToModifier(elem, "disabled"));
          bindValueMap(this, "hidden", valueToModifier(elem, "hidden"));
        }
        bindDisabled(target) {
          bindValueMap(this, "disabled", (disabled) => {
            target.disabled = disabled;
          });
        }
        bindTabIndex(elem) {
          bindValueMap(this, "disabled", (disabled) => {
            elem.tabIndex = disabled ? -1 : 0;
          });
        }
        handleDispose(callback) {
          this.value("disposed").emitter.on("change", (disposed) => {
            if (disposed) {
              callback();
            }
          });
        }
      }
      const className$l = ClassName("tbi");
      class TabItemView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$l());
          config2.viewProps.bindClassModifiers(this.element);
          bindValueMap(config2.props, "selected", (selected) => {
            if (selected) {
              this.element.classList.add(className$l(void 0, "sel"));
            } else {
              this.element.classList.remove(className$l(void 0, "sel"));
            }
          });
          const buttonElem = doc.createElement("button");
          buttonElem.classList.add(className$l("b"));
          config2.viewProps.bindDisabled(buttonElem);
          this.element.appendChild(buttonElem);
          this.buttonElement = buttonElem;
          const titleElem = doc.createElement("div");
          titleElem.classList.add(className$l("t"));
          bindValueToTextContent(config2.props.value("title"), titleElem);
          this.buttonElement.appendChild(titleElem);
          this.titleElement = titleElem;
        }
      }
      class TabItemController {
        constructor(doc, config2) {
          this.emitter = new Emitter();
          this.onClick_ = this.onClick_.bind(this);
          this.props = config2.props;
          this.viewProps = config2.viewProps;
          this.view = new TabItemView(doc, {
            props: config2.props,
            viewProps: config2.viewProps
          });
          this.view.buttonElement.addEventListener("click", this.onClick_);
        }
        onClick_() {
          this.emitter.emit("click", {
            sender: this
          });
        }
      }
      class TabPageController {
        constructor(doc, config2) {
          this.onItemClick_ = this.onItemClick_.bind(this);
          this.ic_ = new TabItemController(doc, {
            props: config2.itemProps,
            viewProps: ViewProps.create()
          });
          this.ic_.emitter.on("click", this.onItemClick_);
          this.cc_ = new RackController(doc, {
            blade: createBlade(),
            viewProps: ViewProps.create()
          });
          this.props = config2.props;
          bindValueMap(this.props, "selected", (selected) => {
            this.itemController.props.set("selected", selected);
            this.contentController.viewProps.set("hidden", !selected);
          });
        }
        get itemController() {
          return this.ic_;
        }
        get contentController() {
          return this.cc_;
        }
        onItemClick_() {
          this.props.set("selected", true);
        }
      }
      class TabPageApi {
        constructor(controller, contentRackApi) {
          this.controller_ = controller;
          this.rackApi_ = contentRackApi;
        }
        get title() {
          var _a;
          return (_a = this.controller_.itemController.props.get("title")) !== null && _a !== void 0 ? _a : "";
        }
        set title(title) {
          this.controller_.itemController.props.set("title", title);
        }
        get selected() {
          return this.controller_.props.get("selected");
        }
        set selected(selected) {
          this.controller_.props.set("selected", selected);
        }
        get children() {
          return this.rackApi_.children;
        }
        addButton(params) {
          return this.rackApi_.addButton(params);
        }
        addFolder(params) {
          return this.rackApi_.addFolder(params);
        }
        addSeparator(opt_params) {
          return this.rackApi_.addSeparator(opt_params);
        }
        addTab(params) {
          return this.rackApi_.addTab(params);
        }
        add(api, opt_index) {
          this.rackApi_.add(api, opt_index);
        }
        remove(api) {
          this.rackApi_.remove(api);
        }
        addInput(object, key, opt_params) {
          return this.rackApi_.addInput(object, key, opt_params);
        }
        addMonitor(object, key, opt_params) {
          return this.rackApi_.addMonitor(object, key, opt_params);
        }
        addBlade(params) {
          return this.rackApi_.addBlade(params);
        }
      }
      class TabApi extends RackLikeApi {
        constructor(controller, pool) {
          super(controller, new RackApi(controller.rackController, pool));
          this.onPageAdd_ = this.onPageAdd_.bind(this);
          this.onPageRemove_ = this.onPageRemove_.bind(this);
          this.emitter_ = new Emitter();
          this.pageApiMap_ = new Map();
          this.rackApi_.on("change", (ev) => {
            this.emitter_.emit("change", {
              event: ev
            });
          });
          this.rackApi_.on("update", (ev) => {
            this.emitter_.emit("update", {
              event: ev
            });
          });
          this.controller_.pageSet.emitter.on("add", this.onPageAdd_);
          this.controller_.pageSet.emitter.on("remove", this.onPageRemove_);
          this.controller_.pageSet.items.forEach((pc) => {
            this.setUpPageApi_(pc);
          });
        }
        get pages() {
          return this.controller_.pageSet.items.map((pc) => {
            const api = this.pageApiMap_.get(pc);
            if (!api) {
              throw TpError.shouldNeverHappen();
            }
            return api;
          });
        }
        addPage(params) {
          const doc = this.controller_.view.element.ownerDocument;
          const pc = new TabPageController(doc, {
            itemProps: ValueMap.fromObject({
              selected: false,
              title: params.title
            }),
            props: ValueMap.fromObject({
              selected: false
            })
          });
          this.controller_.add(pc, params.index);
          const api = this.pageApiMap_.get(pc);
          if (!api) {
            throw TpError.shouldNeverHappen();
          }
          return api;
        }
        removePage(index) {
          this.controller_.remove(index);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
        setUpPageApi_(pc) {
          const rackApi = this.rackApi_["apiSet_"].find((api2) => api2.controller_ === pc.contentController);
          if (!rackApi) {
            throw TpError.shouldNeverHappen();
          }
          const api = new TabPageApi(pc, rackApi);
          this.pageApiMap_.set(pc, api);
        }
        onPageAdd_(ev) {
          this.setUpPageApi_(ev.item);
        }
        onPageRemove_(ev) {
          const api = this.pageApiMap_.get(ev.item);
          if (!api) {
            throw TpError.shouldNeverHappen();
          }
          this.pageApiMap_.delete(ev.item);
        }
      }
      const className$k = ClassName("tab");
      class TabView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$k(), bladeContainerClassName());
          config2.viewProps.bindClassModifiers(this.element);
          bindValue(config2.empty, valueToClassName(this.element, className$k(void 0, "nop")));
          const itemsElem = doc.createElement("div");
          itemsElem.classList.add(className$k("i"));
          this.element.appendChild(itemsElem);
          this.itemsElement = itemsElem;
          const contentsElem = config2.contentsElement;
          contentsElem.classList.add(className$k("c"));
          this.element.appendChild(contentsElem);
          this.contentsElement = contentsElem;
        }
      }
      class TabController extends RackLikeController {
        constructor(doc, config2) {
          const cr = new RackController(doc, {
            blade: config2.blade,
            viewProps: config2.viewProps
          });
          const empty = createValue(true);
          super({
            blade: config2.blade,
            rackController: cr,
            view: new TabView(doc, {
              contentsElement: cr.view.element,
              empty,
              viewProps: config2.viewProps
            })
          });
          this.onPageAdd_ = this.onPageAdd_.bind(this);
          this.onPageRemove_ = this.onPageRemove_.bind(this);
          this.onPageSelectedChange_ = this.onPageSelectedChange_.bind(this);
          this.pageSet_ = new NestedOrderedSet(() => null);
          this.pageSet_.emitter.on("add", this.onPageAdd_);
          this.pageSet_.emitter.on("remove", this.onPageRemove_);
          this.empty_ = empty;
          this.applyPages_();
        }
        get pageSet() {
          return this.pageSet_;
        }
        add(pc, opt_index) {
          this.pageSet_.add(pc, opt_index !== null && opt_index !== void 0 ? opt_index : this.pageSet_.items.length);
        }
        remove(index) {
          this.pageSet_.remove(this.pageSet_.items[index]);
        }
        applyPages_() {
          this.keepSelection_();
          this.empty_.rawValue = this.pageSet_.items.length === 0;
        }
        onPageAdd_(ev) {
          const pc = ev.item;
          insertElementAt(this.view.itemsElement, pc.itemController.view.element, ev.index);
          this.rackController.rack.add(pc.contentController, ev.index);
          pc.props.value("selected").emitter.on("change", this.onPageSelectedChange_);
          this.applyPages_();
        }
        onPageRemove_(ev) {
          const pc = ev.item;
          removeElement(pc.itemController.view.element);
          this.rackController.rack.remove(pc.contentController);
          pc.props.value("selected").emitter.off("change", this.onPageSelectedChange_);
          this.applyPages_();
        }
        keepSelection_() {
          if (this.pageSet_.items.length === 0) {
            return;
          }
          const firstSelIndex = this.pageSet_.items.findIndex((pc) => pc.props.get("selected"));
          if (firstSelIndex < 0) {
            this.pageSet_.items.forEach((pc, i) => {
              pc.props.set("selected", i === 0);
            });
          } else {
            this.pageSet_.items.forEach((pc, i) => {
              pc.props.set("selected", i === firstSelIndex);
            });
          }
        }
        onPageSelectedChange_(ev) {
          if (ev.rawValue) {
            const index = this.pageSet_.items.findIndex((pc) => pc.props.value("selected") === ev.sender);
            this.pageSet_.items.forEach((pc, i) => {
              pc.props.set("selected", i === index);
            });
          } else {
            this.keepSelection_();
          }
        }
      }
      const TabBladePlugin = {
        id: "tab",
        type: "blade",
        accept(params) {
          const p = ParamsParsers;
          const result = parseParams(params, {
            pages: p.required.array(p.required.object({title: p.required.string})),
            view: p.required.constant("tab")
          });
          if (!result || result.pages.length === 0) {
            return null;
          }
          return {params: result};
        },
        controller(args) {
          const c = new TabController(args.document, {
            blade: args.blade,
            viewProps: args.viewProps
          });
          args.params.pages.forEach((p) => {
            const pc = new TabPageController(args.document, {
              itemProps: ValueMap.fromObject({
                selected: false,
                title: p.title
              }),
              props: ValueMap.fromObject({
                selected: false
              })
            });
            c.add(pc);
          });
          return c;
        },
        api(args) {
          if (!(args.controller instanceof TabController)) {
            return null;
          }
          return new TabApi(args.controller, args.pool);
        }
      };
      function createBladeController(plugin, args) {
        const ac = plugin.accept(args.params);
        if (!ac) {
          return null;
        }
        const disabled = ParamsParsers.optional.boolean(args.params["disabled"]).value;
        const hidden = ParamsParsers.optional.boolean(args.params["hidden"]).value;
        return plugin.controller({
          blade: createBlade(),
          document: args.document,
          params: forceCast(Object.assign(Object.assign({}, ac.params), {disabled, hidden})),
          viewProps: ViewProps.create({
            disabled,
            hidden
          })
        });
      }
      class ManualTicker {
        constructor() {
          this.disabled = false;
          this.emitter = new Emitter();
        }
        dispose() {
        }
        tick() {
          if (this.disabled) {
            return;
          }
          this.emitter.emit("tick", {
            sender: this
          });
        }
      }
      class IntervalTicker {
        constructor(doc, interval) {
          this.disabled_ = false;
          this.timerId_ = null;
          this.onTick_ = this.onTick_.bind(this);
          this.doc_ = doc;
          this.emitter = new Emitter();
          this.interval_ = interval;
          this.setTimer_();
        }
        get disabled() {
          return this.disabled_;
        }
        set disabled(inactive) {
          this.disabled_ = inactive;
          if (this.disabled_) {
            this.clearTimer_();
          } else {
            this.setTimer_();
          }
        }
        dispose() {
          this.clearTimer_();
        }
        clearTimer_() {
          if (this.timerId_ === null) {
            return;
          }
          const win = this.doc_.defaultView;
          if (win) {
            win.clearInterval(this.timerId_);
          }
          this.timerId_ = null;
        }
        setTimer_() {
          this.clearTimer_();
          if (this.interval_ <= 0) {
            return;
          }
          const win = this.doc_.defaultView;
          if (win) {
            this.timerId_ = win.setInterval(this.onTick_, this.interval_);
          }
        }
        onTick_() {
          if (this.disabled_) {
            return;
          }
          this.emitter.emit("tick", {
            sender: this
          });
        }
      }
      class CompositeConstraint {
        constructor(constraints) {
          this.constraints = constraints;
        }
        constrain(value) {
          return this.constraints.reduce((result, c) => {
            return c.constrain(result);
          }, value);
        }
      }
      function findConstraint(c, constraintClass) {
        if (c instanceof constraintClass) {
          return c;
        }
        if (c instanceof CompositeConstraint) {
          const result = c.constraints.reduce((tmpResult, sc) => {
            if (tmpResult) {
              return tmpResult;
            }
            return sc instanceof constraintClass ? sc : null;
          }, null);
          if (result) {
            return result;
          }
        }
        return null;
      }
      class ListConstraint {
        constructor(options) {
          this.options = options;
        }
        constrain(value) {
          const opts = this.options;
          if (opts.length === 0) {
            return value;
          }
          const matched = opts.filter((item) => {
            return item.value === value;
          }).length > 0;
          return matched ? value : opts[0].value;
        }
      }
      class RangeConstraint {
        constructor(config2) {
          this.maxValue = config2.max;
          this.minValue = config2.min;
        }
        constrain(value) {
          let result = value;
          if (!isEmpty(this.minValue)) {
            result = Math.max(result, this.minValue);
          }
          if (!isEmpty(this.maxValue)) {
            result = Math.min(result, this.maxValue);
          }
          return result;
        }
      }
      class StepConstraint {
        constructor(step) {
          this.step = step;
        }
        constrain(value) {
          const r = value < 0 ? -Math.round(-value / this.step) : Math.round(value / this.step);
          return r * this.step;
        }
      }
      const className$j = ClassName("lst");
      class ListView {
        constructor(doc, config2) {
          this.onValueChange_ = this.onValueChange_.bind(this);
          this.props_ = config2.props;
          this.element = doc.createElement("div");
          this.element.classList.add(className$j());
          config2.viewProps.bindClassModifiers(this.element);
          const selectElem = doc.createElement("select");
          selectElem.classList.add(className$j("s"));
          bindValueMap(this.props_, "options", (opts) => {
            removeChildElements(selectElem);
            opts.forEach((item, index) => {
              const optionElem = doc.createElement("option");
              optionElem.dataset.index = String(index);
              optionElem.textContent = item.text;
              optionElem.value = String(item.value);
              selectElem.appendChild(optionElem);
            });
          });
          config2.viewProps.bindDisabled(selectElem);
          this.element.appendChild(selectElem);
          this.selectElement = selectElem;
          const markElem = doc.createElement("div");
          markElem.classList.add(className$j("m"));
          markElem.appendChild(createSvgIconElement(doc, "dropdown"));
          this.element.appendChild(markElem);
          config2.value.emitter.on("change", this.onValueChange_);
          this.value_ = config2.value;
          this.update_();
        }
        update_() {
          this.selectElement.value = String(this.value_.rawValue);
        }
        onValueChange_() {
          this.update_();
        }
      }
      class ListController {
        constructor(doc, config2) {
          this.onSelectChange_ = this.onSelectChange_.bind(this);
          this.props = config2.props;
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new ListView(doc, {
            props: this.props,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.selectElement.addEventListener("change", this.onSelectChange_);
        }
        onSelectChange_(e) {
          const selectElem = forceCast(e.currentTarget);
          const optElem = selectElem.selectedOptions.item(0);
          if (!optElem) {
            return;
          }
          const itemIndex = Number(optElem.dataset.index);
          this.value.rawValue = this.props.get("options")[itemIndex].value;
        }
      }
      const className$i = ClassName("pop");
      class PopupView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$i());
          config2.viewProps.bindClassModifiers(this.element);
          bindValue(config2.shows, valueToClassName(this.element, className$i(void 0, "v")));
        }
      }
      class PopupController {
        constructor(doc, config2) {
          this.shows = createValue(false);
          this.viewProps = config2.viewProps;
          this.view = new PopupView(doc, {
            shows: this.shows,
            viewProps: this.viewProps
          });
        }
      }
      const className$h = ClassName("txt");
      class TextView {
        constructor(doc, config2) {
          this.onChange_ = this.onChange_.bind(this);
          this.element = doc.createElement("div");
          this.element.classList.add(className$h());
          config2.viewProps.bindClassModifiers(this.element);
          this.props_ = config2.props;
          this.props_.emitter.on("change", this.onChange_);
          const inputElem = doc.createElement("input");
          inputElem.classList.add(className$h("i"));
          inputElem.type = "text";
          config2.viewProps.bindDisabled(inputElem);
          this.element.appendChild(inputElem);
          this.inputElement = inputElem;
          config2.value.emitter.on("change", this.onChange_);
          this.value_ = config2.value;
          this.refresh();
        }
        refresh() {
          const formatter = this.props_.get("formatter");
          this.inputElement.value = formatter(this.value_.rawValue);
        }
        onChange_() {
          this.refresh();
        }
      }
      class TextController {
        constructor(doc, config2) {
          this.onInputChange_ = this.onInputChange_.bind(this);
          this.parser_ = config2.parser;
          this.props = config2.props;
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new TextView(doc, {
            props: config2.props,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.inputElement.addEventListener("change", this.onInputChange_);
        }
        onInputChange_(e) {
          const inputElem = forceCast(e.currentTarget);
          const value = inputElem.value;
          const parsedValue = this.parser_(value);
          if (!isEmpty(parsedValue)) {
            this.value.rawValue = parsedValue;
          }
          this.view.refresh();
        }
      }
      function boolToString(value) {
        return String(value);
      }
      function boolFromUnknown(value) {
        if (value === "false") {
          return false;
        }
        return !!value;
      }
      function BooleanFormatter(value) {
        return boolToString(value);
      }
      class NumberLiteralNode {
        constructor(text) {
          this.text = text;
        }
        evaluate() {
          return Number(this.text);
        }
        toString() {
          return this.text;
        }
      }
      const BINARY_OPERATION_MAP = {
        "**": (v1, v2) => Math.pow(v1, v2),
        "*": (v1, v2) => v1 * v2,
        "/": (v1, v2) => v1 / v2,
        "%": (v1, v2) => v1 % v2,
        "+": (v1, v2) => v1 + v2,
        "-": (v1, v2) => v1 - v2,
        "<<": (v1, v2) => v1 << v2,
        ">>": (v1, v2) => v1 >> v2,
        ">>>": (v1, v2) => v1 >>> v2,
        "&": (v1, v2) => v1 & v2,
        "^": (v1, v2) => v1 ^ v2,
        "|": (v1, v2) => v1 | v2
      };
      class BinaryOperationNode {
        constructor(operator, left, right) {
          this.left = left;
          this.operator = operator;
          this.right = right;
        }
        evaluate() {
          const op = BINARY_OPERATION_MAP[this.operator];
          if (!op) {
            throw new Error(`unexpected binary operator: '${this.operator}`);
          }
          return op(this.left.evaluate(), this.right.evaluate());
        }
        toString() {
          return [
            "b(",
            this.left.toString(),
            this.operator,
            this.right.toString(),
            ")"
          ].join(" ");
        }
      }
      const UNARY_OPERATION_MAP = {
        "+": (v) => v,
        "-": (v) => -v,
        "~": (v) => ~v
      };
      class UnaryOperationNode {
        constructor(operator, expr) {
          this.operator = operator;
          this.expression = expr;
        }
        evaluate() {
          const op = UNARY_OPERATION_MAP[this.operator];
          if (!op) {
            throw new Error(`unexpected unary operator: '${this.operator}`);
          }
          return op(this.expression.evaluate());
        }
        toString() {
          return ["u(", this.operator, this.expression.toString(), ")"].join(" ");
        }
      }
      function combineReader(parsers) {
        return (text, cursor) => {
          for (let i = 0; i < parsers.length; i++) {
            const result = parsers[i](text, cursor);
            if (result !== "") {
              return result;
            }
          }
          return "";
        };
      }
      function readWhitespace(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^\s+/);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readNonZeroDigit(text, cursor) {
        const ch = text.substr(cursor, 1);
        return ch.match(/^[1-9]$/) ? ch : "";
      }
      function readDecimalDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-9]+/);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readSignedInteger(text, cursor) {
        const ds = readDecimalDigits(text, cursor);
        if (ds !== "") {
          return ds;
        }
        const sign = text.substr(cursor, 1);
        cursor += 1;
        if (sign !== "-" && sign !== "+") {
          return "";
        }
        const sds = readDecimalDigits(text, cursor);
        if (sds === "") {
          return "";
        }
        return sign + sds;
      }
      function readExponentPart(text, cursor) {
        const e = text.substr(cursor, 1);
        cursor += 1;
        if (e.toLowerCase() !== "e") {
          return "";
        }
        const si = readSignedInteger(text, cursor);
        if (si === "") {
          return "";
        }
        return e + si;
      }
      function readDecimalIntegerLiteral(text, cursor) {
        const ch = text.substr(cursor, 1);
        if (ch === "0") {
          return ch;
        }
        const nzd = readNonZeroDigit(text, cursor);
        cursor += nzd.length;
        if (nzd === "") {
          return "";
        }
        return nzd + readDecimalDigits(text, cursor);
      }
      function readDecimalLiteral1(text, cursor) {
        const dil = readDecimalIntegerLiteral(text, cursor);
        cursor += dil.length;
        if (dil === "") {
          return "";
        }
        const dot = text.substr(cursor, 1);
        cursor += dot.length;
        if (dot !== ".") {
          return "";
        }
        const dds = readDecimalDigits(text, cursor);
        cursor += dds.length;
        return dil + dot + dds + readExponentPart(text, cursor);
      }
      function readDecimalLiteral2(text, cursor) {
        const dot = text.substr(cursor, 1);
        cursor += dot.length;
        if (dot !== ".") {
          return "";
        }
        const dds = readDecimalDigits(text, cursor);
        cursor += dds.length;
        if (dds === "") {
          return "";
        }
        return dot + dds + readExponentPart(text, cursor);
      }
      function readDecimalLiteral3(text, cursor) {
        const dil = readDecimalIntegerLiteral(text, cursor);
        cursor += dil.length;
        if (dil === "") {
          return "";
        }
        return dil + readExponentPart(text, cursor);
      }
      const readDecimalLiteral = combineReader([
        readDecimalLiteral1,
        readDecimalLiteral2,
        readDecimalLiteral3
      ]);
      function parseBinaryDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[01]+/);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readBinaryIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== "0b") {
          return "";
        }
        const bds = parseBinaryDigits(text, cursor);
        if (bds === "") {
          return "";
        }
        return prefix + bds;
      }
      function readOctalDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-7]+/);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readOctalIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== "0o") {
          return "";
        }
        const ods = readOctalDigits(text, cursor);
        if (ods === "") {
          return "";
        }
        return prefix + ods;
      }
      function readHexDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-9a-f]+/i);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readHexIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== "0x") {
          return "";
        }
        const hds = readHexDigits(text, cursor);
        if (hds === "") {
          return "";
        }
        return prefix + hds;
      }
      const readNonDecimalIntegerLiteral = combineReader([
        readBinaryIntegerLiteral,
        readOctalIntegerLiteral,
        readHexIntegerLiteral
      ]);
      const readNumericLiteral = combineReader([
        readNonDecimalIntegerLiteral,
        readDecimalLiteral
      ]);
      function parseLiteral(text, cursor) {
        const num = readNumericLiteral(text, cursor);
        cursor += num.length;
        if (num === "") {
          return null;
        }
        return {
          evaluable: new NumberLiteralNode(num),
          cursor
        };
      }
      function parseParenthesizedExpression(text, cursor) {
        const op = text.substr(cursor, 1);
        cursor += op.length;
        if (op !== "(") {
          return null;
        }
        const expr = parseExpression(text, cursor);
        if (!expr) {
          return null;
        }
        cursor = expr.cursor;
        cursor += readWhitespace(text, cursor).length;
        const cl = text.substr(cursor, 1);
        cursor += cl.length;
        if (cl !== ")") {
          return null;
        }
        return {
          evaluable: expr.evaluable,
          cursor
        };
      }
      function parsePrimaryExpression(text, cursor) {
        return parseLiteral(text, cursor) || parseParenthesizedExpression(text, cursor);
      }
      function parseUnaryExpression(text, cursor) {
        const expr = parsePrimaryExpression(text, cursor);
        if (expr) {
          return expr;
        }
        const op = text.substr(cursor, 1);
        cursor += op.length;
        if (op !== "+" && op !== "-" && op !== "~") {
          return null;
        }
        const num = parseUnaryExpression(text, cursor);
        if (!num) {
          return null;
        }
        cursor = num.cursor;
        return {
          cursor,
          evaluable: new UnaryOperationNode(op, num.evaluable)
        };
      }
      function readBinaryOperator(ops, text, cursor) {
        cursor += readWhitespace(text, cursor).length;
        const op = ops.filter((op2) => text.startsWith(op2, cursor))[0];
        if (!op) {
          return null;
        }
        cursor += op.length;
        cursor += readWhitespace(text, cursor).length;
        return {
          cursor,
          operator: op
        };
      }
      function createBinaryOperationExpressionParser(exprParser, ops) {
        return (text, cursor) => {
          const firstExpr = exprParser(text, cursor);
          if (!firstExpr) {
            return null;
          }
          cursor = firstExpr.cursor;
          let expr = firstExpr.evaluable;
          for (; ; ) {
            const op = readBinaryOperator(ops, text, cursor);
            if (!op) {
              break;
            }
            cursor = op.cursor;
            const nextExpr = exprParser(text, cursor);
            if (!nextExpr) {
              return null;
            }
            cursor = nextExpr.cursor;
            expr = new BinaryOperationNode(op.operator, expr, nextExpr.evaluable);
          }
          return expr ? {
            cursor,
            evaluable: expr
          } : null;
        };
      }
      const parseBinaryOperationExpression = [
        ["**"],
        ["*", "/", "%"],
        ["+", "-"],
        ["<<", ">>>", ">>"],
        ["&"],
        ["^"],
        ["|"]
      ].reduce((parser, ops) => {
        return createBinaryOperationExpressionParser(parser, ops);
      }, parseUnaryExpression);
      function parseExpression(text, cursor) {
        cursor += readWhitespace(text, cursor).length;
        return parseBinaryOperationExpression(text, cursor);
      }
      function parseEcmaNumberExpression(text) {
        const expr = parseExpression(text, 0);
        if (!expr) {
          return null;
        }
        const cursor = expr.cursor + readWhitespace(text, expr.cursor).length;
        if (cursor !== text.length) {
          return null;
        }
        return expr.evaluable;
      }
      function parseNumber(text) {
        var _a;
        const r = parseEcmaNumberExpression(text);
        return (_a = r === null || r === void 0 ? void 0 : r.evaluate()) !== null && _a !== void 0 ? _a : null;
      }
      function numberFromUnknown(value) {
        if (typeof value === "number") {
          return value;
        }
        if (typeof value === "string") {
          const pv = parseNumber(value);
          if (!isEmpty(pv)) {
            return pv;
          }
        }
        return 0;
      }
      function numberToString(value) {
        return String(value);
      }
      function createNumberFormatter(digits) {
        return (value) => {
          return value.toFixed(Math.max(Math.min(digits, 20), 0));
        };
      }
      const innerFormatter = createNumberFormatter(0);
      function formatPercentage(value) {
        return innerFormatter(value) + "%";
      }
      function stringFromUnknown(value) {
        return String(value);
      }
      function formatString(value) {
        return value;
      }
      function fillBuffer(buffer, bufferSize) {
        while (buffer.length < bufferSize) {
          buffer.push(void 0);
        }
      }
      function initializeBuffer(bufferSize) {
        const buffer = [];
        fillBuffer(buffer, bufferSize);
        return createValue(buffer);
      }
      function createTrimmedBuffer(buffer) {
        const index = buffer.indexOf(void 0);
        return forceCast(index < 0 ? buffer : buffer.slice(0, index));
      }
      function createPushedBuffer(buffer, newValue) {
        const newBuffer = [...createTrimmedBuffer(buffer), newValue];
        if (newBuffer.length > buffer.length) {
          newBuffer.splice(0, newBuffer.length - buffer.length);
        } else {
          fillBuffer(newBuffer, buffer.length);
        }
        return newBuffer;
      }
      function connectValues({primary, secondary, forward, backward}) {
        let changing = false;
        function preventFeedback(callback) {
          if (changing) {
            return;
          }
          changing = true;
          callback();
          changing = false;
        }
        primary.emitter.on("change", (ev) => {
          preventFeedback(() => {
            secondary.setRawValue(forward(primary, secondary), ev.options);
          });
        });
        secondary.emitter.on("change", (ev) => {
          preventFeedback(() => {
            primary.setRawValue(backward(primary, secondary), ev.options);
          });
          preventFeedback(() => {
            secondary.setRawValue(forward(primary, secondary), ev.options);
          });
        });
        preventFeedback(() => {
          secondary.setRawValue(forward(primary, secondary), {
            forceEmit: false,
            last: true
          });
        });
      }
      function getStepForKey(baseStep, keys) {
        const step = baseStep * (keys.altKey ? 0.1 : 1) * (keys.shiftKey ? 10 : 1);
        if (keys.upKey) {
          return +step;
        } else if (keys.downKey) {
          return -step;
        }
        return 0;
      }
      function getVerticalStepKeys(ev) {
        return {
          altKey: ev.altKey,
          downKey: ev.key === "ArrowDown",
          shiftKey: ev.shiftKey,
          upKey: ev.key === "ArrowUp"
        };
      }
      function getHorizontalStepKeys(ev) {
        return {
          altKey: ev.altKey,
          downKey: ev.key === "ArrowLeft",
          shiftKey: ev.shiftKey,
          upKey: ev.key === "ArrowRight"
        };
      }
      function isVerticalArrowKey(key) {
        return key === "ArrowUp" || key === "ArrowDown";
      }
      function isArrowKey(key) {
        return isVerticalArrowKey(key) || key === "ArrowLeft" || key === "ArrowRight";
      }
      function computeOffset$1(ev, elem) {
        const win = elem.ownerDocument.defaultView;
        const rect = elem.getBoundingClientRect();
        return {
          x: ev.pageX - ((win && win.scrollX || 0) + rect.left),
          y: ev.pageY - ((win && win.scrollY || 0) + rect.top)
        };
      }
      class PointerHandler {
        constructor(element) {
          this.lastTouch_ = null;
          this.onDocumentMouseMove_ = this.onDocumentMouseMove_.bind(this);
          this.onDocumentMouseUp_ = this.onDocumentMouseUp_.bind(this);
          this.onMouseDown_ = this.onMouseDown_.bind(this);
          this.onTouchEnd_ = this.onTouchEnd_.bind(this);
          this.onTouchMove_ = this.onTouchMove_.bind(this);
          this.onTouchStart_ = this.onTouchStart_.bind(this);
          this.elem_ = element;
          this.emitter = new Emitter();
          element.addEventListener("touchstart", this.onTouchStart_, {
            passive: false
          });
          element.addEventListener("touchmove", this.onTouchMove_, {
            passive: true
          });
          element.addEventListener("touchend", this.onTouchEnd_);
          element.addEventListener("mousedown", this.onMouseDown_);
        }
        computePosition_(offset) {
          const rect = this.elem_.getBoundingClientRect();
          return {
            bounds: {
              width: rect.width,
              height: rect.height
            },
            point: offset ? {
              x: offset.x,
              y: offset.y
            } : null
          };
        }
        onMouseDown_(ev) {
          var _a;
          ev.preventDefault();
          (_a = ev.currentTarget) === null || _a === void 0 ? void 0 : _a.focus();
          const doc = this.elem_.ownerDocument;
          doc.addEventListener("mousemove", this.onDocumentMouseMove_);
          doc.addEventListener("mouseup", this.onDocumentMouseUp_);
          this.emitter.emit("down", {
            altKey: ev.altKey,
            data: this.computePosition_(computeOffset$1(ev, this.elem_)),
            sender: this,
            shiftKey: ev.shiftKey
          });
        }
        onDocumentMouseMove_(ev) {
          this.emitter.emit("move", {
            altKey: ev.altKey,
            data: this.computePosition_(computeOffset$1(ev, this.elem_)),
            sender: this,
            shiftKey: ev.shiftKey
          });
        }
        onDocumentMouseUp_(ev) {
          const doc = this.elem_.ownerDocument;
          doc.removeEventListener("mousemove", this.onDocumentMouseMove_);
          doc.removeEventListener("mouseup", this.onDocumentMouseUp_);
          this.emitter.emit("up", {
            altKey: ev.altKey,
            data: this.computePosition_(computeOffset$1(ev, this.elem_)),
            sender: this,
            shiftKey: ev.shiftKey
          });
        }
        onTouchStart_(ev) {
          ev.preventDefault();
          const touch = ev.targetTouches.item(0);
          const rect = this.elem_.getBoundingClientRect();
          this.emitter.emit("down", {
            altKey: ev.altKey,
            data: this.computePosition_(touch ? {
              x: touch.clientX - rect.left,
              y: touch.clientY - rect.top
            } : void 0),
            sender: this,
            shiftKey: ev.shiftKey
          });
          this.lastTouch_ = touch;
        }
        onTouchMove_(ev) {
          const touch = ev.targetTouches.item(0);
          const rect = this.elem_.getBoundingClientRect();
          this.emitter.emit("move", {
            altKey: ev.altKey,
            data: this.computePosition_(touch ? {
              x: touch.clientX - rect.left,
              y: touch.clientY - rect.top
            } : void 0),
            sender: this,
            shiftKey: ev.shiftKey
          });
          this.lastTouch_ = touch;
        }
        onTouchEnd_(ev) {
          var _a;
          const touch = (_a = ev.targetTouches.item(0)) !== null && _a !== void 0 ? _a : this.lastTouch_;
          const rect = this.elem_.getBoundingClientRect();
          this.emitter.emit("up", {
            altKey: ev.altKey,
            data: this.computePosition_(touch ? {
              x: touch.clientX - rect.left,
              y: touch.clientY - rect.top
            } : void 0),
            sender: this,
            shiftKey: ev.shiftKey
          });
        }
      }
      function mapRange(value, start1, end1, start2, end2) {
        const p = (value - start1) / (end1 - start1);
        return start2 + p * (end2 - start2);
      }
      function getDecimalDigits(value) {
        const text = String(value.toFixed(10));
        const frac = text.split(".")[1];
        return frac.replace(/0+$/, "").length;
      }
      function constrainRange(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }
      function loopRange(value, max) {
        return (value % max + max) % max;
      }
      const className$g = ClassName("txt");
      class NumberTextView {
        constructor(doc, config2) {
          this.onChange_ = this.onChange_.bind(this);
          this.props_ = config2.props;
          this.props_.emitter.on("change", this.onChange_);
          this.element = doc.createElement("div");
          this.element.classList.add(className$g(), className$g(void 0, "num"));
          if (config2.arrayPosition) {
            this.element.classList.add(className$g(void 0, config2.arrayPosition));
          }
          config2.viewProps.bindClassModifiers(this.element);
          const inputElem = doc.createElement("input");
          inputElem.classList.add(className$g("i"));
          inputElem.type = "text";
          config2.viewProps.bindDisabled(inputElem);
          this.element.appendChild(inputElem);
          this.inputElement = inputElem;
          this.onDraggingChange_ = this.onDraggingChange_.bind(this);
          this.dragging_ = config2.dragging;
          this.dragging_.emitter.on("change", this.onDraggingChange_);
          this.element.classList.add(className$g());
          this.inputElement.classList.add(className$g("i"));
          const knobElem = doc.createElement("div");
          knobElem.classList.add(className$g("k"));
          this.element.appendChild(knobElem);
          this.knobElement = knobElem;
          const guideElem = doc.createElementNS(SVG_NS, "svg");
          guideElem.classList.add(className$g("g"));
          this.knobElement.appendChild(guideElem);
          const bodyElem = doc.createElementNS(SVG_NS, "path");
          bodyElem.classList.add(className$g("gb"));
          guideElem.appendChild(bodyElem);
          this.guideBodyElem_ = bodyElem;
          const headElem = doc.createElementNS(SVG_NS, "path");
          headElem.classList.add(className$g("gh"));
          guideElem.appendChild(headElem);
          this.guideHeadElem_ = headElem;
          const tooltipElem = doc.createElement("div");
          tooltipElem.classList.add(ClassName("tt")());
          this.knobElement.appendChild(tooltipElem);
          this.tooltipElem_ = tooltipElem;
          config2.value.emitter.on("change", this.onChange_);
          this.value = config2.value;
          this.refresh();
        }
        onDraggingChange_(ev) {
          if (ev.rawValue === null) {
            this.element.classList.remove(className$g(void 0, "drg"));
            return;
          }
          this.element.classList.add(className$g(void 0, "drg"));
          const x = ev.rawValue / this.props_.get("draggingScale");
          const aox = x + (x > 0 ? -1 : x < 0 ? 1 : 0);
          const adx = constrainRange(-aox, -4, 4);
          this.guideHeadElem_.setAttributeNS(null, "d", [`M ${aox + adx},0 L${aox},4 L${aox + adx},8`, `M ${x},-1 L${x},9`].join(" "));
          this.guideBodyElem_.setAttributeNS(null, "d", `M 0,4 L${x},4`);
          const formatter = this.props_.get("formatter");
          this.tooltipElem_.textContent = formatter(this.value.rawValue);
          this.tooltipElem_.style.left = `${x}px`;
        }
        refresh() {
          const formatter = this.props_.get("formatter");
          this.inputElement.value = formatter(this.value.rawValue);
        }
        onChange_() {
          this.refresh();
        }
      }
      class NumberTextController {
        constructor(doc, config2) {
          this.originRawValue_ = 0;
          this.onInputChange_ = this.onInputChange_.bind(this);
          this.onInputKeyDown_ = this.onInputKeyDown_.bind(this);
          this.onInputKeyUp_ = this.onInputKeyUp_.bind(this);
          this.onPointerDown_ = this.onPointerDown_.bind(this);
          this.onPointerMove_ = this.onPointerMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.baseStep_ = config2.baseStep;
          this.parser_ = config2.parser;
          this.props = config2.props;
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.dragging_ = createValue(null);
          this.view = new NumberTextView(doc, {
            arrayPosition: config2.arrayPosition,
            dragging: this.dragging_,
            props: this.props,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.inputElement.addEventListener("change", this.onInputChange_);
          this.view.inputElement.addEventListener("keydown", this.onInputKeyDown_);
          this.view.inputElement.addEventListener("keyup", this.onInputKeyUp_);
          const ph = new PointerHandler(this.view.knobElement);
          ph.emitter.on("down", this.onPointerDown_);
          ph.emitter.on("move", this.onPointerMove_);
          ph.emitter.on("up", this.onPointerUp_);
        }
        onInputChange_(e) {
          const inputElem = forceCast(e.currentTarget);
          const value = inputElem.value;
          const parsedValue = this.parser_(value);
          if (!isEmpty(parsedValue)) {
            this.value.rawValue = parsedValue;
          }
          this.view.refresh();
        }
        onInputKeyDown_(ev) {
          const step = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
          if (step === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue + step, {
            forceEmit: false,
            last: false
          });
        }
        onInputKeyUp_(ev) {
          const step = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
          if (step === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue, {
            forceEmit: true,
            last: true
          });
        }
        onPointerDown_() {
          this.originRawValue_ = this.value.rawValue;
          this.dragging_.rawValue = 0;
        }
        computeDraggingValue_(data) {
          if (!data.point) {
            return null;
          }
          const dx = data.point.x - data.bounds.width / 2;
          return this.originRawValue_ + dx * this.props.get("draggingScale");
        }
        onPointerMove_(ev) {
          const v = this.computeDraggingValue_(ev.data);
          if (v === null) {
            return;
          }
          this.value.setRawValue(v, {
            forceEmit: false,
            last: false
          });
          this.dragging_.rawValue = this.value.rawValue - this.originRawValue_;
        }
        onPointerUp_(ev) {
          const v = this.computeDraggingValue_(ev.data);
          if (v === null) {
            return;
          }
          this.value.setRawValue(v, {
            forceEmit: true,
            last: true
          });
          this.dragging_.rawValue = null;
        }
      }
      const className$f = ClassName("sld");
      class SliderView {
        constructor(doc, config2) {
          this.onChange_ = this.onChange_.bind(this);
          this.props_ = config2.props;
          this.props_.emitter.on("change", this.onChange_);
          this.element = doc.createElement("div");
          this.element.classList.add(className$f());
          config2.viewProps.bindClassModifiers(this.element);
          const trackElem = doc.createElement("div");
          trackElem.classList.add(className$f("t"));
          config2.viewProps.bindTabIndex(trackElem);
          this.element.appendChild(trackElem);
          this.trackElement = trackElem;
          const knobElem = doc.createElement("div");
          knobElem.classList.add(className$f("k"));
          this.trackElement.appendChild(knobElem);
          this.knobElement = knobElem;
          config2.value.emitter.on("change", this.onChange_);
          this.value = config2.value;
          this.update_();
        }
        update_() {
          const p = constrainRange(mapRange(this.value.rawValue, this.props_.get("minValue"), this.props_.get("maxValue"), 0, 100), 0, 100);
          this.knobElement.style.width = `${p}%`;
        }
        onChange_() {
          this.update_();
        }
      }
      class SliderController {
        constructor(doc, config2) {
          this.onKeyDown_ = this.onKeyDown_.bind(this);
          this.onKeyUp_ = this.onKeyUp_.bind(this);
          this.onPointerDownOrMove_ = this.onPointerDownOrMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.baseStep_ = config2.baseStep;
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.props = config2.props;
          this.view = new SliderView(doc, {
            props: this.props,
            value: this.value,
            viewProps: this.viewProps
          });
          this.ptHandler_ = new PointerHandler(this.view.trackElement);
          this.ptHandler_.emitter.on("down", this.onPointerDownOrMove_);
          this.ptHandler_.emitter.on("move", this.onPointerDownOrMove_);
          this.ptHandler_.emitter.on("up", this.onPointerUp_);
          this.view.trackElement.addEventListener("keydown", this.onKeyDown_);
          this.view.trackElement.addEventListener("keyup", this.onKeyUp_);
        }
        handlePointerEvent_(d, opts) {
          if (!d.point) {
            return;
          }
          this.value.setRawValue(mapRange(constrainRange(d.point.x, 0, d.bounds.width), 0, d.bounds.width, this.props.get("minValue"), this.props.get("maxValue")), opts);
        }
        onPointerDownOrMove_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerUp_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: true,
            last: true
          });
        }
        onKeyDown_(ev) {
          const step = getStepForKey(this.baseStep_, getHorizontalStepKeys(ev));
          if (step === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue + step, {
            forceEmit: false,
            last: false
          });
        }
        onKeyUp_(ev) {
          const step = getStepForKey(this.baseStep_, getHorizontalStepKeys(ev));
          if (step === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue, {
            forceEmit: true,
            last: true
          });
        }
      }
      const className$e = ClassName("sldtxt");
      class SliderTextView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$e());
          const sliderElem = doc.createElement("div");
          sliderElem.classList.add(className$e("s"));
          this.sliderView_ = config2.sliderView;
          sliderElem.appendChild(this.sliderView_.element);
          this.element.appendChild(sliderElem);
          const textElem = doc.createElement("div");
          textElem.classList.add(className$e("t"));
          this.textView_ = config2.textView;
          textElem.appendChild(this.textView_.element);
          this.element.appendChild(textElem);
        }
      }
      class SliderTextController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.sliderC_ = new SliderController(doc, {
            baseStep: config2.baseStep,
            props: config2.sliderProps,
            value: config2.value,
            viewProps: this.viewProps
          });
          this.textC_ = new NumberTextController(doc, {
            baseStep: config2.baseStep,
            parser: config2.parser,
            props: config2.textProps,
            value: config2.value,
            viewProps: config2.viewProps
          });
          this.view = new SliderTextView(doc, {
            sliderView: this.sliderC_.view,
            textView: this.textC_.view
          });
        }
        get sliderController() {
          return this.sliderC_;
        }
        get textController() {
          return this.textC_;
        }
      }
      function writePrimitive(target, value) {
        target.write(value);
      }
      function parseListOptions(value) {
        const p = ParamsParsers;
        if (Array.isArray(value)) {
          return p.required.array(p.required.object({
            text: p.required.string,
            value: p.required.raw
          }))(value).value;
        }
        if (typeof value === "object") {
          return p.required.raw(value).value;
        }
        return void 0;
      }
      function parsePickerLayout(value) {
        if (value === "inline" || value === "popup") {
          return value;
        }
        return void 0;
      }
      function parsePointDimensionParams(value) {
        const p = ParamsParsers;
        return p.required.object({
          max: p.optional.number,
          min: p.optional.number,
          step: p.optional.number
        })(value).value;
      }
      function normalizeListOptions(options) {
        if (Array.isArray(options)) {
          return options;
        }
        const items = [];
        Object.keys(options).forEach((text) => {
          items.push({text, value: options[text]});
        });
        return items;
      }
      function createListConstraint(options) {
        return !isEmpty(options) ? new ListConstraint(normalizeListOptions(forceCast(options))) : null;
      }
      function findListItems(constraint) {
        const c = constraint ? findConstraint(constraint, ListConstraint) : null;
        if (!c) {
          return null;
        }
        return c.options;
      }
      function findStep(constraint) {
        const c = constraint ? findConstraint(constraint, StepConstraint) : null;
        if (!c) {
          return null;
        }
        return c.step;
      }
      function getSuitableDecimalDigits(constraint, rawValue) {
        const sc = constraint && findConstraint(constraint, StepConstraint);
        if (sc) {
          return getDecimalDigits(sc.step);
        }
        return Math.max(getDecimalDigits(rawValue), 2);
      }
      function getBaseStep(constraint) {
        const step = findStep(constraint);
        return step !== null && step !== void 0 ? step : 1;
      }
      function getSuitableDraggingScale(constraint, rawValue) {
        var _a;
        const sc = constraint && findConstraint(constraint, StepConstraint);
        const base = Math.abs((_a = sc === null || sc === void 0 ? void 0 : sc.step) !== null && _a !== void 0 ? _a : rawValue);
        return base === 0 ? 0.1 : Math.pow(10, Math.floor(Math.log10(base)) - 1);
      }
      const className$d = ClassName("ckb");
      class CheckboxView {
        constructor(doc, config2) {
          this.onValueChange_ = this.onValueChange_.bind(this);
          this.element = doc.createElement("div");
          this.element.classList.add(className$d());
          config2.viewProps.bindClassModifiers(this.element);
          const labelElem = doc.createElement("label");
          labelElem.classList.add(className$d("l"));
          this.element.appendChild(labelElem);
          const inputElem = doc.createElement("input");
          inputElem.classList.add(className$d("i"));
          inputElem.type = "checkbox";
          labelElem.appendChild(inputElem);
          this.inputElement = inputElem;
          config2.viewProps.bindDisabled(this.inputElement);
          const wrapperElem = doc.createElement("div");
          wrapperElem.classList.add(className$d("w"));
          labelElem.appendChild(wrapperElem);
          const markElem = createSvgIconElement(doc, "check");
          wrapperElem.appendChild(markElem);
          config2.value.emitter.on("change", this.onValueChange_);
          this.value = config2.value;
          this.update_();
        }
        update_() {
          this.inputElement.checked = this.value.rawValue;
        }
        onValueChange_() {
          this.update_();
        }
      }
      class CheckboxController {
        constructor(doc, config2) {
          this.onInputChange_ = this.onInputChange_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new CheckboxView(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.inputElement.addEventListener("change", this.onInputChange_);
        }
        onInputChange_(e) {
          const inputElem = forceCast(e.currentTarget);
          this.value.rawValue = inputElem.checked;
        }
      }
      function createConstraint$5(params) {
        const constraints = [];
        const lc = createListConstraint(params.options);
        if (lc) {
          constraints.push(lc);
        }
        return new CompositeConstraint(constraints);
      }
      const BooleanInputPlugin = {
        id: "input-bool",
        type: "input",
        accept: (value, params) => {
          if (typeof value !== "boolean") {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            options: p.optional.custom(parseListOptions)
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => boolFromUnknown,
          constraint: (args) => createConstraint$5(args.params),
          writer: (_args) => writePrimitive
        },
        controller: (args) => {
          var _a;
          const doc = args.document;
          const value = args.value;
          const c = args.constraint;
          if (c && findConstraint(c, ListConstraint)) {
            return new ListController(doc, {
              props: ValueMap.fromObject({
                options: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : []
              }),
              value,
              viewProps: args.viewProps
            });
          }
          return new CheckboxController(doc, {
            value,
            viewProps: args.viewProps
          });
        }
      };
      const className$c = ClassName("col");
      class ColorView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$c());
          config2.foldable.bindExpandedClass(this.element, className$c(void 0, "expanded"));
          bindValueMap(config2.foldable, "completed", valueToClassName(this.element, className$c(void 0, "cpl")));
          const headElem = doc.createElement("div");
          headElem.classList.add(className$c("h"));
          this.element.appendChild(headElem);
          const swatchElem = doc.createElement("div");
          swatchElem.classList.add(className$c("s"));
          headElem.appendChild(swatchElem);
          this.swatchElement = swatchElem;
          const textElem = doc.createElement("div");
          textElem.classList.add(className$c("t"));
          headElem.appendChild(textElem);
          this.textElement = textElem;
          if (config2.pickerLayout === "inline") {
            const pickerElem = doc.createElement("div");
            pickerElem.classList.add(className$c("p"));
            this.element.appendChild(pickerElem);
            this.pickerElement = pickerElem;
          } else {
            this.pickerElement = null;
          }
        }
      }
      function rgbToHsl(r, g, b) {
        const rp = constrainRange(r / 255, 0, 1);
        const gp = constrainRange(g / 255, 0, 1);
        const bp = constrainRange(b / 255, 0, 1);
        const cmax = Math.max(rp, gp, bp);
        const cmin = Math.min(rp, gp, bp);
        const c = cmax - cmin;
        let h = 0;
        let s = 0;
        const l = (cmin + cmax) / 2;
        if (c !== 0) {
          s = c / (1 - Math.abs(cmax + cmin - 1));
          if (rp === cmax) {
            h = (gp - bp) / c;
          } else if (gp === cmax) {
            h = 2 + (bp - rp) / c;
          } else {
            h = 4 + (rp - gp) / c;
          }
          h = h / 6 + (h < 0 ? 1 : 0);
        }
        return [h * 360, s * 100, l * 100];
      }
      function hslToRgb(h, s, l) {
        const hp = (h % 360 + 360) % 360;
        const sp = constrainRange(s / 100, 0, 1);
        const lp = constrainRange(l / 100, 0, 1);
        const c = (1 - Math.abs(2 * lp - 1)) * sp;
        const x = c * (1 - Math.abs(hp / 60 % 2 - 1));
        const m = lp - c / 2;
        let rp, gp, bp;
        if (hp >= 0 && hp < 60) {
          [rp, gp, bp] = [c, x, 0];
        } else if (hp >= 60 && hp < 120) {
          [rp, gp, bp] = [x, c, 0];
        } else if (hp >= 120 && hp < 180) {
          [rp, gp, bp] = [0, c, x];
        } else if (hp >= 180 && hp < 240) {
          [rp, gp, bp] = [0, x, c];
        } else if (hp >= 240 && hp < 300) {
          [rp, gp, bp] = [x, 0, c];
        } else {
          [rp, gp, bp] = [c, 0, x];
        }
        return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255];
      }
      function rgbToHsv(r, g, b) {
        const rp = constrainRange(r / 255, 0, 1);
        const gp = constrainRange(g / 255, 0, 1);
        const bp = constrainRange(b / 255, 0, 1);
        const cmax = Math.max(rp, gp, bp);
        const cmin = Math.min(rp, gp, bp);
        const d = cmax - cmin;
        let h;
        if (d === 0) {
          h = 0;
        } else if (cmax === rp) {
          h = 60 * (((gp - bp) / d % 6 + 6) % 6);
        } else if (cmax === gp) {
          h = 60 * ((bp - rp) / d + 2);
        } else {
          h = 60 * ((rp - gp) / d + 4);
        }
        const s = cmax === 0 ? 0 : d / cmax;
        const v = cmax;
        return [h, s * 100, v * 100];
      }
      function hsvToRgb(h, s, v) {
        const hp = loopRange(h, 360);
        const sp = constrainRange(s / 100, 0, 1);
        const vp = constrainRange(v / 100, 0, 1);
        const c = vp * sp;
        const x = c * (1 - Math.abs(hp / 60 % 2 - 1));
        const m = vp - c;
        let rp, gp, bp;
        if (hp >= 0 && hp < 60) {
          [rp, gp, bp] = [c, x, 0];
        } else if (hp >= 60 && hp < 120) {
          [rp, gp, bp] = [x, c, 0];
        } else if (hp >= 120 && hp < 180) {
          [rp, gp, bp] = [0, c, x];
        } else if (hp >= 180 && hp < 240) {
          [rp, gp, bp] = [0, x, c];
        } else if (hp >= 240 && hp < 300) {
          [rp, gp, bp] = [x, 0, c];
        } else {
          [rp, gp, bp] = [c, 0, x];
        }
        return [(rp + m) * 255, (gp + m) * 255, (bp + m) * 255];
      }
      function hslToHsv(h, s, l) {
        const sd = l + s * (100 - Math.abs(2 * l - 100)) / (2 * 100);
        return [
          h,
          sd !== 0 ? s * (100 - Math.abs(2 * l - 100)) / sd : 0,
          l + s * (100 - Math.abs(2 * l - 100)) / (2 * 100)
        ];
      }
      function hsvToHsl(h, s, v) {
        const sd = 100 - Math.abs(v * (200 - s) / 100 - 100);
        return [h, sd !== 0 ? s * v / sd : 0, v * (200 - s) / (2 * 100)];
      }
      function removeAlphaComponent(comps) {
        return [comps[0], comps[1], comps[2]];
      }
      function appendAlphaComponent(comps, alpha) {
        return [comps[0], comps[1], comps[2], alpha];
      }
      const MODE_CONVERTER_MAP = {
        hsl: {
          hsl: (h, s, l) => [h, s, l],
          hsv: hslToHsv,
          rgb: hslToRgb
        },
        hsv: {
          hsl: hsvToHsl,
          hsv: (h, s, v) => [h, s, v],
          rgb: hsvToRgb
        },
        rgb: {
          hsl: rgbToHsl,
          hsv: rgbToHsv,
          rgb: (r, g, b) => [r, g, b]
        }
      };
      function convertColorMode(components, fromMode, toMode) {
        return MODE_CONVERTER_MAP[fromMode][toMode](...components);
      }
      const CONSTRAINT_MAP = {
        hsl: (comps) => {
          var _a;
          return [
            loopRange(comps[0], 360),
            constrainRange(comps[1], 0, 100),
            constrainRange(comps[2], 0, 100),
            constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1)
          ];
        },
        hsv: (comps) => {
          var _a;
          return [
            loopRange(comps[0], 360),
            constrainRange(comps[1], 0, 100),
            constrainRange(comps[2], 0, 100),
            constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1)
          ];
        },
        rgb: (comps) => {
          var _a;
          return [
            constrainRange(comps[0], 0, 255),
            constrainRange(comps[1], 0, 255),
            constrainRange(comps[2], 0, 255),
            constrainRange((_a = comps[3]) !== null && _a !== void 0 ? _a : 1, 0, 1)
          ];
        }
      };
      function isRgbColorComponent(obj, key) {
        if (typeof obj !== "object" || isEmpty(obj)) {
          return false;
        }
        return key in obj && typeof obj[key] === "number";
      }
      class Color {
        constructor(comps, mode) {
          this.mode_ = mode;
          this.comps_ = CONSTRAINT_MAP[mode](comps);
        }
        static black() {
          return new Color([0, 0, 0], "rgb");
        }
        static fromObject(obj) {
          const comps = "a" in obj ? [obj.r, obj.g, obj.b, obj.a] : [obj.r, obj.g, obj.b];
          return new Color(comps, "rgb");
        }
        static toRgbaObject(color) {
          return color.toRgbaObject();
        }
        static isRgbColorObject(obj) {
          return isRgbColorComponent(obj, "r") && isRgbColorComponent(obj, "g") && isRgbColorComponent(obj, "b");
        }
        static isRgbaColorObject(obj) {
          return this.isRgbColorObject(obj) && isRgbColorComponent(obj, "a");
        }
        static isColorObject(obj) {
          return this.isRgbColorObject(obj);
        }
        static equals(v1, v2) {
          if (v1.mode_ !== v2.mode_) {
            return false;
          }
          const comps1 = v1.comps_;
          const comps2 = v2.comps_;
          for (let i = 0; i < comps1.length; i++) {
            if (comps1[i] !== comps2[i]) {
              return false;
            }
          }
          return true;
        }
        get mode() {
          return this.mode_;
        }
        getComponents(opt_mode) {
          return appendAlphaComponent(convertColorMode(removeAlphaComponent(this.comps_), this.mode_, opt_mode || this.mode_), this.comps_[3]);
        }
        toRgbaObject() {
          const rgbComps = this.getComponents("rgb");
          return {
            r: rgbComps[0],
            g: rgbComps[1],
            b: rgbComps[2],
            a: rgbComps[3]
          };
        }
      }
      const className$b = ClassName("colp");
      class ColorPickerView {
        constructor(doc, config2) {
          this.alphaViews_ = null;
          this.element = doc.createElement("div");
          this.element.classList.add(className$b());
          const hsvElem = doc.createElement("div");
          hsvElem.classList.add(className$b("hsv"));
          const svElem = doc.createElement("div");
          svElem.classList.add(className$b("sv"));
          this.svPaletteView_ = config2.svPaletteView;
          svElem.appendChild(this.svPaletteView_.element);
          hsvElem.appendChild(svElem);
          const hElem = doc.createElement("div");
          hElem.classList.add(className$b("h"));
          this.hPaletteView_ = config2.hPaletteView;
          hElem.appendChild(this.hPaletteView_.element);
          hsvElem.appendChild(hElem);
          this.element.appendChild(hsvElem);
          const rgbElem = doc.createElement("div");
          rgbElem.classList.add(className$b("rgb"));
          this.textView_ = config2.textView;
          rgbElem.appendChild(this.textView_.element);
          this.element.appendChild(rgbElem);
          if (config2.alphaViews) {
            this.alphaViews_ = {
              palette: config2.alphaViews.palette,
              text: config2.alphaViews.text
            };
            const aElem = doc.createElement("div");
            aElem.classList.add(className$b("a"));
            const apElem = doc.createElement("div");
            apElem.classList.add(className$b("ap"));
            apElem.appendChild(this.alphaViews_.palette.element);
            aElem.appendChild(apElem);
            const atElem = doc.createElement("div");
            atElem.classList.add(className$b("at"));
            atElem.appendChild(this.alphaViews_.text.element);
            aElem.appendChild(atElem);
            this.element.appendChild(aElem);
          }
        }
        get allFocusableElements() {
          const elems = [
            this.svPaletteView_.element,
            this.hPaletteView_.element,
            this.textView_.modeSelectElement,
            ...this.textView_.textViews.map((v) => v.inputElement)
          ];
          if (this.alphaViews_) {
            elems.push(this.alphaViews_.palette.element, this.alphaViews_.text.inputElement);
          }
          return elems;
        }
      }
      function parseColorInputParams(params) {
        const p = ParamsParsers;
        return parseParams(params, {
          alpha: p.optional.boolean,
          expanded: p.optional.boolean,
          picker: p.optional.custom(parsePickerLayout)
        });
      }
      function getBaseStepForColor(forAlpha) {
        return forAlpha ? 0.1 : 1;
      }
      function parseCssNumberOrPercentage(text, maxValue) {
        const m = text.match(/^(.+)%$/);
        if (!m) {
          return Math.min(parseFloat(text), maxValue);
        }
        return Math.min(parseFloat(m[1]) * 0.01 * maxValue, maxValue);
      }
      const ANGLE_TO_DEG_MAP = {
        deg: (angle) => angle,
        grad: (angle) => angle * 360 / 400,
        rad: (angle) => angle * 360 / (2 * Math.PI),
        turn: (angle) => angle * 360
      };
      function parseCssNumberOrAngle(text) {
        const m = text.match(/^([0-9.]+?)(deg|grad|rad|turn)$/);
        if (!m) {
          return parseFloat(text);
        }
        const angle = parseFloat(m[1]);
        const unit = m[2];
        return ANGLE_TO_DEG_MAP[unit](angle);
      }
      const NOTATION_TO_PARSER_MAP = {
        "func.rgb": (text) => {
          const m = text.match(/^rgb\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
          if (!m) {
            return null;
          }
          const comps = [
            parseCssNumberOrPercentage(m[1], 255),
            parseCssNumberOrPercentage(m[2], 255),
            parseCssNumberOrPercentage(m[3], 255)
          ];
          if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2])) {
            return null;
          }
          return new Color(comps, "rgb");
        },
        "func.rgba": (text) => {
          const m = text.match(/^rgba\(\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
          if (!m) {
            return null;
          }
          const comps = [
            parseCssNumberOrPercentage(m[1], 255),
            parseCssNumberOrPercentage(m[2], 255),
            parseCssNumberOrPercentage(m[3], 255),
            parseCssNumberOrPercentage(m[4], 1)
          ];
          if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2]) || isNaN(comps[3])) {
            return null;
          }
          return new Color(comps, "rgb");
        },
        "func.hsl": (text) => {
          const m = text.match(/^hsl\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
          if (!m) {
            return null;
          }
          const comps = [
            parseCssNumberOrAngle(m[1]),
            parseCssNumberOrPercentage(m[2], 100),
            parseCssNumberOrPercentage(m[3], 100)
          ];
          if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2])) {
            return null;
          }
          return new Color(comps, "hsl");
        },
        "func.hsla": (text) => {
          const m = text.match(/^hsla\(\s*([0-9A-Fa-f.]+(?:deg|grad|rad|turn)?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*,\s*([0-9A-Fa-f.]+%?)\s*\)$/);
          if (!m) {
            return null;
          }
          const comps = [
            parseCssNumberOrAngle(m[1]),
            parseCssNumberOrPercentage(m[2], 100),
            parseCssNumberOrPercentage(m[3], 100),
            parseCssNumberOrPercentage(m[4], 1)
          ];
          if (isNaN(comps[0]) || isNaN(comps[1]) || isNaN(comps[2]) || isNaN(comps[3])) {
            return null;
          }
          return new Color(comps, "hsl");
        },
        "hex.rgb": (text) => {
          const mRgb = text.match(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
          if (mRgb) {
            return new Color([
              parseInt(mRgb[1] + mRgb[1], 16),
              parseInt(mRgb[2] + mRgb[2], 16),
              parseInt(mRgb[3] + mRgb[3], 16)
            ], "rgb");
          }
          const mRrggbb = text.match(/^(?:#|0x)([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
          if (mRrggbb) {
            return new Color([
              parseInt(mRrggbb[1], 16),
              parseInt(mRrggbb[2], 16),
              parseInt(mRrggbb[3], 16)
            ], "rgb");
          }
          return null;
        },
        "hex.rgba": (text) => {
          const mRgb = text.match(/^#?([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/);
          if (mRgb) {
            return new Color([
              parseInt(mRgb[1] + mRgb[1], 16),
              parseInt(mRgb[2] + mRgb[2], 16),
              parseInt(mRgb[3] + mRgb[3], 16),
              mapRange(parseInt(mRgb[4] + mRgb[4], 16), 0, 255, 0, 1)
            ], "rgb");
          }
          const mRrggbb = text.match(/^(?:#|0x)?([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
          if (mRrggbb) {
            return new Color([
              parseInt(mRrggbb[1], 16),
              parseInt(mRrggbb[2], 16),
              parseInt(mRrggbb[3], 16),
              mapRange(parseInt(mRrggbb[4], 16), 0, 255, 0, 1)
            ], "rgb");
          }
          return null;
        }
      };
      function getColorNotation(text) {
        const notations = Object.keys(NOTATION_TO_PARSER_MAP);
        return notations.reduce((result, notation) => {
          if (result) {
            return result;
          }
          const subparser = NOTATION_TO_PARSER_MAP[notation];
          return subparser(text) ? notation : null;
        }, null);
      }
      const CompositeColorParser = (text) => {
        const notation = getColorNotation(text);
        return notation ? NOTATION_TO_PARSER_MAP[notation](text) : null;
      };
      function hasAlphaComponent(notation) {
        return notation === "func.hsla" || notation === "func.rgba" || notation === "hex.rgba";
      }
      function colorFromString(value) {
        if (typeof value === "string") {
          const cv = CompositeColorParser(value);
          if (cv) {
            return cv;
          }
        }
        return Color.black();
      }
      function zerofill(comp) {
        const hex = constrainRange(Math.floor(comp), 0, 255).toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      }
      function colorToHexRgbString(value, prefix = "#") {
        const hexes = removeAlphaComponent(value.getComponents("rgb")).map(zerofill).join("");
        return `${prefix}${hexes}`;
      }
      function colorToHexRgbaString(value, prefix = "#") {
        const rgbaComps = value.getComponents("rgb");
        const hexes = [rgbaComps[0], rgbaComps[1], rgbaComps[2], rgbaComps[3] * 255].map(zerofill).join("");
        return `${prefix}${hexes}`;
      }
      function colorToFunctionalRgbString(value) {
        const formatter = createNumberFormatter(0);
        const comps = removeAlphaComponent(value.getComponents("rgb")).map((comp) => formatter(comp));
        return `rgb(${comps.join(", ")})`;
      }
      function colorToFunctionalRgbaString(value) {
        const aFormatter = createNumberFormatter(2);
        const rgbFormatter = createNumberFormatter(0);
        const comps = value.getComponents("rgb").map((comp, index) => {
          const formatter = index === 3 ? aFormatter : rgbFormatter;
          return formatter(comp);
        });
        return `rgba(${comps.join(", ")})`;
      }
      function colorToFunctionalHslString(value) {
        const formatters = [
          createNumberFormatter(0),
          formatPercentage,
          formatPercentage
        ];
        const comps = removeAlphaComponent(value.getComponents("hsl")).map((comp, index) => formatters[index](comp));
        return `hsl(${comps.join(", ")})`;
      }
      function colorToFunctionalHslaString(value) {
        const formatters = [
          createNumberFormatter(0),
          formatPercentage,
          formatPercentage,
          createNumberFormatter(2)
        ];
        const comps = value.getComponents("hsl").map((comp, index) => formatters[index](comp));
        return `hsla(${comps.join(", ")})`;
      }
      const NOTATION_TO_STRINGIFIER_MAP = {
        "func.hsl": colorToFunctionalHslString,
        "func.hsla": colorToFunctionalHslaString,
        "func.rgb": colorToFunctionalRgbString,
        "func.rgba": colorToFunctionalRgbaString,
        "hex.rgb": colorToHexRgbString,
        "hex.rgba": colorToHexRgbaString
      };
      function getColorStringifier(notation) {
        return NOTATION_TO_STRINGIFIER_MAP[notation];
      }
      const className$a = ClassName("apl");
      class APaletteView {
        constructor(doc, config2) {
          this.onValueChange_ = this.onValueChange_.bind(this);
          this.value = config2.value;
          this.value.emitter.on("change", this.onValueChange_);
          this.element = doc.createElement("div");
          this.element.classList.add(className$a());
          config2.viewProps.bindTabIndex(this.element);
          const barElem = doc.createElement("div");
          barElem.classList.add(className$a("b"));
          this.element.appendChild(barElem);
          const colorElem = doc.createElement("div");
          colorElem.classList.add(className$a("c"));
          barElem.appendChild(colorElem);
          this.colorElem_ = colorElem;
          const markerElem = doc.createElement("div");
          markerElem.classList.add(className$a("m"));
          this.element.appendChild(markerElem);
          this.markerElem_ = markerElem;
          const previewElem = doc.createElement("div");
          previewElem.classList.add(className$a("p"));
          this.markerElem_.appendChild(previewElem);
          this.previewElem_ = previewElem;
          this.update_();
        }
        update_() {
          const c = this.value.rawValue;
          const rgbaComps = c.getComponents("rgb");
          const leftColor = new Color([rgbaComps[0], rgbaComps[1], rgbaComps[2], 0], "rgb");
          const rightColor = new Color([rgbaComps[0], rgbaComps[1], rgbaComps[2], 255], "rgb");
          const gradientComps = [
            "to right",
            colorToFunctionalRgbaString(leftColor),
            colorToFunctionalRgbaString(rightColor)
          ];
          this.colorElem_.style.background = `linear-gradient(${gradientComps.join(",")})`;
          this.previewElem_.style.backgroundColor = colorToFunctionalRgbaString(c);
          const left = mapRange(rgbaComps[3], 0, 1, 0, 100);
          this.markerElem_.style.left = `${left}%`;
        }
        onValueChange_() {
          this.update_();
        }
      }
      class APaletteController {
        constructor(doc, config2) {
          this.onKeyDown_ = this.onKeyDown_.bind(this);
          this.onKeyUp_ = this.onKeyUp_.bind(this);
          this.onPointerDown_ = this.onPointerDown_.bind(this);
          this.onPointerMove_ = this.onPointerMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new APaletteView(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
          this.ptHandler_ = new PointerHandler(this.view.element);
          this.ptHandler_.emitter.on("down", this.onPointerDown_);
          this.ptHandler_.emitter.on("move", this.onPointerMove_);
          this.ptHandler_.emitter.on("up", this.onPointerUp_);
          this.view.element.addEventListener("keydown", this.onKeyDown_);
          this.view.element.addEventListener("keyup", this.onKeyUp_);
        }
        handlePointerEvent_(d, opts) {
          if (!d.point) {
            return;
          }
          const alpha = d.point.x / d.bounds.width;
          const c = this.value.rawValue;
          const [h, s, v] = c.getComponents("hsv");
          this.value.setRawValue(new Color([h, s, v, alpha], "hsv"), opts);
        }
        onPointerDown_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerMove_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerUp_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: true,
            last: true
          });
        }
        onKeyDown_(ev) {
          const step = getStepForKey(getBaseStepForColor(true), getHorizontalStepKeys(ev));
          if (step === 0) {
            return;
          }
          const c = this.value.rawValue;
          const [h, s, v, a] = c.getComponents("hsv");
          this.value.setRawValue(new Color([h, s, v, a + step], "hsv"), {
            forceEmit: false,
            last: false
          });
        }
        onKeyUp_(ev) {
          const step = getStepForKey(getBaseStepForColor(true), getHorizontalStepKeys(ev));
          if (step === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue, {
            forceEmit: true,
            last: true
          });
        }
      }
      const className$9 = ClassName("coltxt");
      function createModeSelectElement(doc) {
        const selectElem = doc.createElement("select");
        const items = [
          {text: "RGB", value: "rgb"},
          {text: "HSL", value: "hsl"},
          {text: "HSV", value: "hsv"}
        ];
        selectElem.appendChild(items.reduce((frag, item) => {
          const optElem = doc.createElement("option");
          optElem.textContent = item.text;
          optElem.value = item.value;
          frag.appendChild(optElem);
          return frag;
        }, doc.createDocumentFragment()));
        return selectElem;
      }
      class ColorTextView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$9());
          const modeElem = doc.createElement("div");
          modeElem.classList.add(className$9("m"));
          this.modeElem_ = createModeSelectElement(doc);
          this.modeElem_.classList.add(className$9("ms"));
          modeElem.appendChild(this.modeSelectElement);
          const modeMarkerElem = doc.createElement("div");
          modeMarkerElem.classList.add(className$9("mm"));
          modeMarkerElem.appendChild(createSvgIconElement(doc, "dropdown"));
          modeElem.appendChild(modeMarkerElem);
          this.element.appendChild(modeElem);
          const textsElem = doc.createElement("div");
          textsElem.classList.add(className$9("w"));
          this.element.appendChild(textsElem);
          this.textsElem_ = textsElem;
          this.textViews_ = config2.textViews;
          this.applyTextViews_();
          bindValue(config2.colorMode, (mode) => {
            this.modeElem_.value = mode;
          });
        }
        get modeSelectElement() {
          return this.modeElem_;
        }
        get textViews() {
          return this.textViews_;
        }
        set textViews(textViews) {
          this.textViews_ = textViews;
          this.applyTextViews_();
        }
        applyTextViews_() {
          removeChildElements(this.textsElem_);
          const doc = this.element.ownerDocument;
          this.textViews_.forEach((v) => {
            const compElem = doc.createElement("div");
            compElem.classList.add(className$9("c"));
            compElem.appendChild(v.element);
            this.textsElem_.appendChild(compElem);
          });
        }
      }
      const FORMATTER = createNumberFormatter(0);
      const MODE_TO_CONSTRAINT_MAP = {
        rgb: () => {
          return new RangeConstraint({min: 0, max: 255});
        },
        hsl: (index) => {
          return index === 0 ? new RangeConstraint({min: 0, max: 360}) : new RangeConstraint({min: 0, max: 100});
        },
        hsv: (index) => {
          return index === 0 ? new RangeConstraint({min: 0, max: 360}) : new RangeConstraint({min: 0, max: 100});
        }
      };
      function createComponentController(doc, config2, index) {
        return new NumberTextController(doc, {
          arrayPosition: index === 0 ? "fst" : index === 3 - 1 ? "lst" : "mid",
          baseStep: getBaseStepForColor(false),
          parser: config2.parser,
          props: ValueMap.fromObject({
            draggingScale: 1,
            formatter: FORMATTER
          }),
          value: createValue(0, {
            constraint: MODE_TO_CONSTRAINT_MAP[config2.colorMode](index)
          }),
          viewProps: config2.viewProps
        });
      }
      class ColorTextController {
        constructor(doc, config2) {
          this.onModeSelectChange_ = this.onModeSelectChange_.bind(this);
          this.parser_ = config2.parser;
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.colorMode = createValue(this.value.rawValue.mode);
          this.ccs_ = this.createComponentControllers_(doc);
          this.view = new ColorTextView(doc, {
            colorMode: this.colorMode,
            textViews: [this.ccs_[0].view, this.ccs_[1].view, this.ccs_[2].view]
          });
          this.view.modeSelectElement.addEventListener("change", this.onModeSelectChange_);
        }
        createComponentControllers_(doc) {
          const cc = {
            colorMode: this.colorMode.rawValue,
            parser: this.parser_,
            viewProps: this.viewProps
          };
          const ccs = [
            createComponentController(doc, cc, 0),
            createComponentController(doc, cc, 1),
            createComponentController(doc, cc, 2)
          ];
          ccs.forEach((cs, index) => {
            connectValues({
              primary: this.value,
              secondary: cs.value,
              forward: (p) => {
                return p.rawValue.getComponents(this.colorMode.rawValue)[index];
              },
              backward: (p, s) => {
                const pickedMode = this.colorMode.rawValue;
                const comps = p.rawValue.getComponents(pickedMode);
                comps[index] = s.rawValue;
                return new Color(appendAlphaComponent(removeAlphaComponent(comps), comps[3]), pickedMode);
              }
            });
          });
          return ccs;
        }
        onModeSelectChange_(ev) {
          const selectElem = ev.currentTarget;
          this.colorMode.rawValue = selectElem.value;
          this.ccs_ = this.createComponentControllers_(this.view.element.ownerDocument);
          this.view.textViews = [
            this.ccs_[0].view,
            this.ccs_[1].view,
            this.ccs_[2].view
          ];
        }
      }
      const className$8 = ClassName("hpl");
      class HPaletteView {
        constructor(doc, config2) {
          this.onValueChange_ = this.onValueChange_.bind(this);
          this.value = config2.value;
          this.value.emitter.on("change", this.onValueChange_);
          this.element = doc.createElement("div");
          this.element.classList.add(className$8());
          config2.viewProps.bindTabIndex(this.element);
          const colorElem = doc.createElement("div");
          colorElem.classList.add(className$8("c"));
          this.element.appendChild(colorElem);
          const markerElem = doc.createElement("div");
          markerElem.classList.add(className$8("m"));
          this.element.appendChild(markerElem);
          this.markerElem_ = markerElem;
          this.update_();
        }
        update_() {
          const c = this.value.rawValue;
          const [h] = c.getComponents("hsv");
          this.markerElem_.style.backgroundColor = colorToFunctionalRgbString(new Color([h, 100, 100], "hsv"));
          const left = mapRange(h, 0, 360, 0, 100);
          this.markerElem_.style.left = `${left}%`;
        }
        onValueChange_() {
          this.update_();
        }
      }
      class HPaletteController {
        constructor(doc, config2) {
          this.onKeyDown_ = this.onKeyDown_.bind(this);
          this.onKeyUp_ = this.onKeyUp_.bind(this);
          this.onPointerDown_ = this.onPointerDown_.bind(this);
          this.onPointerMove_ = this.onPointerMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new HPaletteView(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
          this.ptHandler_ = new PointerHandler(this.view.element);
          this.ptHandler_.emitter.on("down", this.onPointerDown_);
          this.ptHandler_.emitter.on("move", this.onPointerMove_);
          this.ptHandler_.emitter.on("up", this.onPointerUp_);
          this.view.element.addEventListener("keydown", this.onKeyDown_);
          this.view.element.addEventListener("keyup", this.onKeyUp_);
        }
        handlePointerEvent_(d, opts) {
          if (!d.point) {
            return;
          }
          const hue = mapRange(constrainRange(d.point.x, 0, d.bounds.width), 0, d.bounds.width, 0, 359);
          const c = this.value.rawValue;
          const [, s, v, a] = c.getComponents("hsv");
          this.value.setRawValue(new Color([hue, s, v, a], "hsv"), opts);
        }
        onPointerDown_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerMove_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerUp_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: true,
            last: true
          });
        }
        onKeyDown_(ev) {
          const step = getStepForKey(getBaseStepForColor(false), getHorizontalStepKeys(ev));
          if (step === 0) {
            return;
          }
          const c = this.value.rawValue;
          const [h, s, v, a] = c.getComponents("hsv");
          this.value.setRawValue(new Color([h + step, s, v, a], "hsv"), {
            forceEmit: false,
            last: false
          });
        }
        onKeyUp_(ev) {
          const step = getStepForKey(getBaseStepForColor(false), getHorizontalStepKeys(ev));
          if (step === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue, {
            forceEmit: true,
            last: true
          });
        }
      }
      const className$7 = ClassName("svp");
      const CANVAS_RESOL = 64;
      class SvPaletteView {
        constructor(doc, config2) {
          this.onValueChange_ = this.onValueChange_.bind(this);
          this.value = config2.value;
          this.value.emitter.on("change", this.onValueChange_);
          this.element = doc.createElement("div");
          this.element.classList.add(className$7());
          config2.viewProps.bindTabIndex(this.element);
          const canvasElem = doc.createElement("canvas");
          canvasElem.height = CANVAS_RESOL;
          canvasElem.width = CANVAS_RESOL;
          canvasElem.classList.add(className$7("c"));
          this.element.appendChild(canvasElem);
          this.canvasElement = canvasElem;
          const markerElem = doc.createElement("div");
          markerElem.classList.add(className$7("m"));
          this.element.appendChild(markerElem);
          this.markerElem_ = markerElem;
          this.update_();
        }
        update_() {
          const ctx = getCanvasContext(this.canvasElement);
          if (!ctx) {
            return;
          }
          const c = this.value.rawValue;
          const hsvComps = c.getComponents("hsv");
          const width = this.canvasElement.width;
          const height = this.canvasElement.height;
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          for (let iy = 0; iy < height; iy++) {
            for (let ix = 0; ix < width; ix++) {
              const s = mapRange(ix, 0, width, 0, 100);
              const v = mapRange(iy, 0, height, 100, 0);
              const rgbComps = hsvToRgb(hsvComps[0], s, v);
              const i = (iy * width + ix) * 4;
              data[i] = rgbComps[0];
              data[i + 1] = rgbComps[1];
              data[i + 2] = rgbComps[2];
              data[i + 3] = 255;
            }
          }
          ctx.putImageData(imgData, 0, 0);
          const left = mapRange(hsvComps[1], 0, 100, 0, 100);
          this.markerElem_.style.left = `${left}%`;
          const top = mapRange(hsvComps[2], 0, 100, 100, 0);
          this.markerElem_.style.top = `${top}%`;
        }
        onValueChange_() {
          this.update_();
        }
      }
      class SvPaletteController {
        constructor(doc, config2) {
          this.onKeyDown_ = this.onKeyDown_.bind(this);
          this.onKeyUp_ = this.onKeyUp_.bind(this);
          this.onPointerDown_ = this.onPointerDown_.bind(this);
          this.onPointerMove_ = this.onPointerMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new SvPaletteView(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
          this.ptHandler_ = new PointerHandler(this.view.element);
          this.ptHandler_.emitter.on("down", this.onPointerDown_);
          this.ptHandler_.emitter.on("move", this.onPointerMove_);
          this.ptHandler_.emitter.on("up", this.onPointerUp_);
          this.view.element.addEventListener("keydown", this.onKeyDown_);
          this.view.element.addEventListener("keyup", this.onKeyUp_);
        }
        handlePointerEvent_(d, opts) {
          if (!d.point) {
            return;
          }
          const saturation = mapRange(d.point.x, 0, d.bounds.width, 0, 100);
          const value = mapRange(d.point.y, 0, d.bounds.height, 100, 0);
          const [h, , , a] = this.value.rawValue.getComponents("hsv");
          this.value.setRawValue(new Color([h, saturation, value, a], "hsv"), opts);
        }
        onPointerDown_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerMove_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerUp_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: true,
            last: true
          });
        }
        onKeyDown_(ev) {
          if (isArrowKey(ev.key)) {
            ev.preventDefault();
          }
          const [h, s, v, a] = this.value.rawValue.getComponents("hsv");
          const baseStep = getBaseStepForColor(false);
          const ds = getStepForKey(baseStep, getHorizontalStepKeys(ev));
          const dv = getStepForKey(baseStep, getVerticalStepKeys(ev));
          if (ds === 0 && dv === 0) {
            return;
          }
          this.value.setRawValue(new Color([h, s + ds, v + dv, a], "hsv"), {
            forceEmit: false,
            last: false
          });
        }
        onKeyUp_(ev) {
          const baseStep = getBaseStepForColor(false);
          const ds = getStepForKey(baseStep, getHorizontalStepKeys(ev));
          const dv = getStepForKey(baseStep, getVerticalStepKeys(ev));
          if (ds === 0 && dv === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue, {
            forceEmit: true,
            last: true
          });
        }
      }
      class ColorPickerController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.hPaletteC_ = new HPaletteController(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
          this.svPaletteC_ = new SvPaletteController(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
          this.alphaIcs_ = config2.supportsAlpha ? {
            palette: new APaletteController(doc, {
              value: this.value,
              viewProps: this.viewProps
            }),
            text: new NumberTextController(doc, {
              parser: parseNumber,
              baseStep: 0.1,
              props: ValueMap.fromObject({
                draggingScale: 0.01,
                formatter: createNumberFormatter(2)
              }),
              value: createValue(0, {
                constraint: new RangeConstraint({min: 0, max: 1})
              }),
              viewProps: this.viewProps
            })
          } : null;
          if (this.alphaIcs_) {
            connectValues({
              primary: this.value,
              secondary: this.alphaIcs_.text.value,
              forward: (p) => {
                return p.rawValue.getComponents()[3];
              },
              backward: (p, s) => {
                const comps = p.rawValue.getComponents();
                comps[3] = s.rawValue;
                return new Color(comps, p.rawValue.mode);
              }
            });
          }
          this.textC_ = new ColorTextController(doc, {
            parser: parseNumber,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view = new ColorPickerView(doc, {
            alphaViews: this.alphaIcs_ ? {
              palette: this.alphaIcs_.palette.view,
              text: this.alphaIcs_.text.view
            } : null,
            hPaletteView: this.hPaletteC_.view,
            supportsAlpha: config2.supportsAlpha,
            svPaletteView: this.svPaletteC_.view,
            textView: this.textC_.view
          });
        }
        get textController() {
          return this.textC_;
        }
      }
      const className$6 = ClassName("colsw");
      class ColorSwatchView {
        constructor(doc, config2) {
          this.onValueChange_ = this.onValueChange_.bind(this);
          config2.value.emitter.on("change", this.onValueChange_);
          this.value = config2.value;
          this.element = doc.createElement("div");
          this.element.classList.add(className$6());
          config2.viewProps.bindClassModifiers(this.element);
          const swatchElem = doc.createElement("div");
          swatchElem.classList.add(className$6("sw"));
          this.element.appendChild(swatchElem);
          this.swatchElem_ = swatchElem;
          const buttonElem = doc.createElement("button");
          buttonElem.classList.add(className$6("b"));
          config2.viewProps.bindDisabled(buttonElem);
          this.element.appendChild(buttonElem);
          this.buttonElement = buttonElem;
          this.update_();
        }
        update_() {
          const value = this.value.rawValue;
          this.swatchElem_.style.backgroundColor = colorToHexRgbaString(value);
        }
        onValueChange_() {
          this.update_();
        }
      }
      class ColorSwatchController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new ColorSwatchView(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
        }
      }
      class ColorController {
        constructor(doc, config2) {
          this.onButtonBlur_ = this.onButtonBlur_.bind(this);
          this.onButtonClick_ = this.onButtonClick_.bind(this);
          this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this);
          this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.foldable_ = Foldable.create(config2.expanded);
          this.swatchC_ = new ColorSwatchController(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
          const buttonElem = this.swatchC_.view.buttonElement;
          buttonElem.addEventListener("blur", this.onButtonBlur_);
          buttonElem.addEventListener("click", this.onButtonClick_);
          this.textC_ = new TextController(doc, {
            parser: config2.parser,
            props: ValueMap.fromObject({
              formatter: config2.formatter
            }),
            value: this.value,
            viewProps: this.viewProps
          });
          this.view = new ColorView(doc, {
            foldable: this.foldable_,
            pickerLayout: config2.pickerLayout
          });
          this.view.swatchElement.appendChild(this.swatchC_.view.element);
          this.view.textElement.appendChild(this.textC_.view.element);
          this.popC_ = config2.pickerLayout === "popup" ? new PopupController(doc, {
            viewProps: this.viewProps
          }) : null;
          const pickerC = new ColorPickerController(doc, {
            supportsAlpha: config2.supportsAlpha,
            value: this.value,
            viewProps: this.viewProps
          });
          pickerC.view.allFocusableElements.forEach((elem) => {
            elem.addEventListener("blur", this.onPopupChildBlur_);
            elem.addEventListener("keydown", this.onPopupChildKeydown_);
          });
          this.pickerC_ = pickerC;
          if (this.popC_) {
            this.view.element.appendChild(this.popC_.view.element);
            this.popC_.view.element.appendChild(pickerC.view.element);
            connectValues({
              primary: this.foldable_.value("expanded"),
              secondary: this.popC_.shows,
              forward: (p) => p.rawValue,
              backward: (_, s) => s.rawValue
            });
          } else if (this.view.pickerElement) {
            this.view.pickerElement.appendChild(this.pickerC_.view.element);
            bindFoldable(this.foldable_, this.view.pickerElement);
          }
        }
        get textController() {
          return this.textC_;
        }
        onButtonBlur_(e) {
          if (!this.popC_) {
            return;
          }
          const elem = this.view.element;
          const nextTarget = forceCast(e.relatedTarget);
          if (!nextTarget || !elem.contains(nextTarget)) {
            this.popC_.shows.rawValue = false;
          }
        }
        onButtonClick_() {
          this.foldable_.set("expanded", !this.foldable_.get("expanded"));
          if (this.foldable_.get("expanded")) {
            this.pickerC_.view.allFocusableElements[0].focus();
          }
        }
        onPopupChildBlur_(ev) {
          if (!this.popC_) {
            return;
          }
          const elem = this.popC_.view.element;
          const nextTarget = findNextTarget(ev);
          if (nextTarget && elem.contains(nextTarget)) {
            return;
          }
          if (nextTarget && nextTarget === this.swatchC_.view.buttonElement && !supportsTouch(elem.ownerDocument)) {
            return;
          }
          this.popC_.shows.rawValue = false;
        }
        onPopupChildKeydown_(ev) {
          if (this.popC_) {
            if (ev.key === "Escape") {
              this.popC_.shows.rawValue = false;
            }
          } else if (this.view.pickerElement) {
            if (ev.key === "Escape") {
              this.swatchC_.view.buttonElement.focus();
            }
          }
        }
      }
      function colorFromObject(value) {
        if (Color.isColorObject(value)) {
          return Color.fromObject(value);
        }
        return Color.black();
      }
      function colorToRgbNumber(value) {
        return removeAlphaComponent(value.getComponents("rgb")).reduce((result, comp) => {
          return result << 8 | Math.floor(comp) & 255;
        }, 0);
      }
      function colorToRgbaNumber(value) {
        return value.getComponents("rgb").reduce((result, comp, index) => {
          const hex = Math.floor(index === 3 ? comp * 255 : comp) & 255;
          return result << 8 | hex;
        }, 0) >>> 0;
      }
      function numberToRgbColor(num) {
        return new Color([num >> 16 & 255, num >> 8 & 255, num & 255], "rgb");
      }
      function numberToRgbaColor(num) {
        return new Color([
          num >> 24 & 255,
          num >> 16 & 255,
          num >> 8 & 255,
          mapRange(num & 255, 0, 255, 0, 1)
        ], "rgb");
      }
      function colorFromRgbNumber(value) {
        if (typeof value !== "number") {
          return Color.black();
        }
        return numberToRgbColor(value);
      }
      function colorFromRgbaNumber(value) {
        if (typeof value !== "number") {
          return Color.black();
        }
        return numberToRgbaColor(value);
      }
      function createColorStringWriter(notation) {
        const stringify = getColorStringifier(notation);
        return (target, value) => {
          writePrimitive(target, stringify(value));
        };
      }
      function createColorNumberWriter(supportsAlpha) {
        const colorToNumber = supportsAlpha ? colorToRgbaNumber : colorToRgbNumber;
        return (target, value) => {
          writePrimitive(target, colorToNumber(value));
        };
      }
      function writeRgbaColorObject(target, value) {
        const obj = value.toRgbaObject();
        target.writeProperty("r", obj.r);
        target.writeProperty("g", obj.g);
        target.writeProperty("b", obj.b);
        target.writeProperty("a", obj.a);
      }
      function writeRgbColorObject(target, value) {
        const obj = value.toRgbaObject();
        target.writeProperty("r", obj.r);
        target.writeProperty("g", obj.g);
        target.writeProperty("b", obj.b);
      }
      function createColorObjectWriter(supportsAlpha) {
        return supportsAlpha ? writeRgbaColorObject : writeRgbColorObject;
      }
      function shouldSupportAlpha$1(inputParams) {
        return "alpha" in inputParams && inputParams.alpha === true;
      }
      function createFormatter$1(supportsAlpha) {
        return supportsAlpha ? (v) => colorToHexRgbaString(v, "0x") : (v) => colorToHexRgbString(v, "0x");
      }
      const NumberColorInputPlugin = {
        id: "input-color-number",
        type: "input",
        accept: (value, params) => {
          if (typeof value !== "number") {
            return null;
          }
          if (!("view" in params)) {
            return null;
          }
          if (params.view !== "color") {
            return null;
          }
          const result = parseColorInputParams(params);
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (args) => {
            return shouldSupportAlpha$1(args.params) ? colorFromRgbaNumber : colorFromRgbNumber;
          },
          equals: Color.equals,
          writer: (args) => {
            return createColorNumberWriter(shouldSupportAlpha$1(args.params));
          }
        },
        controller: (args) => {
          const supportsAlpha = shouldSupportAlpha$1(args.params);
          const expanded = "expanded" in args.params ? args.params.expanded : void 0;
          const picker = "picker" in args.params ? args.params.picker : void 0;
          return new ColorController(args.document, {
            expanded: expanded !== null && expanded !== void 0 ? expanded : false,
            formatter: createFormatter$1(supportsAlpha),
            parser: CompositeColorParser,
            pickerLayout: picker !== null && picker !== void 0 ? picker : "popup",
            supportsAlpha,
            value: args.value,
            viewProps: args.viewProps
          });
        }
      };
      function shouldSupportAlpha(initialValue) {
        return Color.isRgbaColorObject(initialValue);
      }
      const ObjectColorInputPlugin = {
        id: "input-color-object",
        type: "input",
        accept: (value, params) => {
          if (!Color.isColorObject(value)) {
            return null;
          }
          const result = parseColorInputParams(params);
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => colorFromObject,
          equals: Color.equals,
          writer: (args) => createColorObjectWriter(shouldSupportAlpha(args.initialValue))
        },
        controller: (args) => {
          const supportsAlpha = Color.isRgbaColorObject(args.initialValue);
          const expanded = "expanded" in args.params ? args.params.expanded : void 0;
          const picker = "picker" in args.params ? args.params.picker : void 0;
          const formatter = supportsAlpha ? colorToHexRgbaString : colorToHexRgbString;
          return new ColorController(args.document, {
            expanded: expanded !== null && expanded !== void 0 ? expanded : false,
            formatter,
            parser: CompositeColorParser,
            pickerLayout: picker !== null && picker !== void 0 ? picker : "popup",
            supportsAlpha,
            value: args.value,
            viewProps: args.viewProps
          });
        }
      };
      const StringColorInputPlugin = {
        id: "input-color-string",
        type: "input",
        accept: (value, params) => {
          if (typeof value !== "string") {
            return null;
          }
          if ("view" in params && params.view === "text") {
            return null;
          }
          const notation = getColorNotation(value);
          if (!notation) {
            return null;
          }
          const result = parseColorInputParams(params);
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => colorFromString,
          equals: Color.equals,
          writer: (args) => {
            const notation = getColorNotation(args.initialValue);
            if (!notation) {
              throw TpError.shouldNeverHappen();
            }
            return createColorStringWriter(notation);
          }
        },
        controller: (args) => {
          const notation = getColorNotation(args.initialValue);
          if (!notation) {
            throw TpError.shouldNeverHappen();
          }
          const stringifier = getColorStringifier(notation);
          const expanded = "expanded" in args.params ? args.params.expanded : void 0;
          const picker = "picker" in args.params ? args.params.picker : void 0;
          return new ColorController(args.document, {
            expanded: expanded !== null && expanded !== void 0 ? expanded : false,
            formatter: stringifier,
            parser: CompositeColorParser,
            pickerLayout: picker !== null && picker !== void 0 ? picker : "popup",
            supportsAlpha: hasAlphaComponent(notation),
            value: args.value,
            viewProps: args.viewProps
          });
        }
      };
      class PointNdConstraint {
        constructor(config2) {
          this.components = config2.components;
          this.asm_ = config2.assembly;
        }
        constrain(value) {
          const comps = this.asm_.toComponents(value).map((comp, index) => {
            var _a, _b;
            return (_b = (_a = this.components[index]) === null || _a === void 0 ? void 0 : _a.constrain(comp)) !== null && _b !== void 0 ? _b : comp;
          });
          return this.asm_.fromComponents(comps);
        }
      }
      const className$5 = ClassName("pndtxt");
      class PointNdTextView {
        constructor(doc, config2) {
          this.textViews = config2.textViews;
          this.element = doc.createElement("div");
          this.element.classList.add(className$5());
          this.textViews.forEach((v) => {
            const axisElem = doc.createElement("div");
            axisElem.classList.add(className$5("a"));
            axisElem.appendChild(v.element);
            this.element.appendChild(axisElem);
          });
        }
      }
      function createAxisController(doc, config2, index) {
        return new NumberTextController(doc, {
          arrayPosition: index === 0 ? "fst" : index === config2.axes.length - 1 ? "lst" : "mid",
          baseStep: config2.axes[index].baseStep,
          parser: config2.parser,
          props: config2.axes[index].textProps,
          value: createValue(0, {
            constraint: config2.axes[index].constraint
          }),
          viewProps: config2.viewProps
        });
      }
      class PointNdTextController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.acs_ = config2.axes.map((_, index) => createAxisController(doc, config2, index));
          this.acs_.forEach((c, index) => {
            connectValues({
              primary: this.value,
              secondary: c.value,
              forward: (p) => {
                return config2.assembly.toComponents(p.rawValue)[index];
              },
              backward: (p, s) => {
                const comps = config2.assembly.toComponents(p.rawValue);
                comps[index] = s.rawValue;
                return config2.assembly.fromComponents(comps);
              }
            });
          });
          this.view = new PointNdTextView(doc, {
            textViews: this.acs_.map((ac) => ac.view)
          });
        }
      }
      function createStepConstraint(params) {
        if ("step" in params && !isEmpty(params.step)) {
          return new StepConstraint(params.step);
        }
        return null;
      }
      function createRangeConstraint(params) {
        if ("max" in params && !isEmpty(params.max) || "min" in params && !isEmpty(params.min)) {
          return new RangeConstraint({
            max: params.max,
            min: params.min
          });
        }
        return null;
      }
      function createConstraint$4(params) {
        const constraints = [];
        const sc = createStepConstraint(params);
        if (sc) {
          constraints.push(sc);
        }
        const rc = createRangeConstraint(params);
        if (rc) {
          constraints.push(rc);
        }
        const lc = createListConstraint(params.options);
        if (lc) {
          constraints.push(lc);
        }
        return new CompositeConstraint(constraints);
      }
      function findRange(constraint) {
        const c = constraint ? findConstraint(constraint, RangeConstraint) : null;
        if (!c) {
          return [void 0, void 0];
        }
        return [c.minValue, c.maxValue];
      }
      function estimateSuitableRange(constraint) {
        const [min, max] = findRange(constraint);
        return [min !== null && min !== void 0 ? min : 0, max !== null && max !== void 0 ? max : 100];
      }
      const NumberInputPlugin = {
        id: "input-number",
        type: "input",
        accept: (value, params) => {
          if (typeof value !== "number") {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            format: p.optional.function,
            max: p.optional.number,
            min: p.optional.number,
            options: p.optional.custom(parseListOptions),
            step: p.optional.number
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => numberFromUnknown,
          constraint: (args) => createConstraint$4(args.params),
          writer: (_args) => writePrimitive
        },
        controller: (args) => {
          var _a, _b;
          const value = args.value;
          const c = args.constraint;
          if (c && findConstraint(c, ListConstraint)) {
            return new ListController(args.document, {
              props: ValueMap.fromObject({
                options: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : []
              }),
              value,
              viewProps: args.viewProps
            });
          }
          const formatter = (_b = "format" in args.params ? args.params.format : void 0) !== null && _b !== void 0 ? _b : createNumberFormatter(getSuitableDecimalDigits(c, value.rawValue));
          if (c && findConstraint(c, RangeConstraint)) {
            const [min, max] = estimateSuitableRange(c);
            return new SliderTextController(args.document, {
              baseStep: getBaseStep(c),
              parser: parseNumber,
              sliderProps: ValueMap.fromObject({
                maxValue: max,
                minValue: min
              }),
              textProps: ValueMap.fromObject({
                draggingScale: getSuitableDraggingScale(c, value.rawValue),
                formatter
              }),
              value,
              viewProps: args.viewProps
            });
          }
          return new NumberTextController(args.document, {
            baseStep: getBaseStep(c),
            parser: parseNumber,
            props: ValueMap.fromObject({
              draggingScale: getSuitableDraggingScale(c, value.rawValue),
              formatter
            }),
            value,
            viewProps: args.viewProps
          });
        }
      };
      class Point2d {
        constructor(x = 0, y = 0) {
          this.x = x;
          this.y = y;
        }
        getComponents() {
          return [this.x, this.y];
        }
        static isObject(obj) {
          if (isEmpty(obj)) {
            return false;
          }
          const x = obj.x;
          const y = obj.y;
          if (typeof x !== "number" || typeof y !== "number") {
            return false;
          }
          return true;
        }
        static equals(v1, v2) {
          return v1.x === v2.x && v1.y === v2.y;
        }
        toObject() {
          return {
            x: this.x,
            y: this.y
          };
        }
      }
      const Point2dAssembly = {
        toComponents: (p) => p.getComponents(),
        fromComponents: (comps) => new Point2d(...comps)
      };
      const className$4 = ClassName("p2d");
      class Point2dView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$4());
          config2.viewProps.bindClassModifiers(this.element);
          bindValue(config2.expanded, valueToClassName(this.element, className$4(void 0, "expanded")));
          const headElem = doc.createElement("div");
          headElem.classList.add(className$4("h"));
          this.element.appendChild(headElem);
          const buttonElem = doc.createElement("button");
          buttonElem.classList.add(className$4("b"));
          buttonElem.appendChild(createSvgIconElement(doc, "p2dpad"));
          config2.viewProps.bindDisabled(buttonElem);
          headElem.appendChild(buttonElem);
          this.buttonElement = buttonElem;
          const textElem = doc.createElement("div");
          textElem.classList.add(className$4("t"));
          headElem.appendChild(textElem);
          this.textElement = textElem;
          if (config2.pickerLayout === "inline") {
            const pickerElem = doc.createElement("div");
            pickerElem.classList.add(className$4("p"));
            this.element.appendChild(pickerElem);
            this.pickerElement = pickerElem;
          } else {
            this.pickerElement = null;
          }
        }
      }
      const className$3 = ClassName("p2dp");
      class Point2dPickerView {
        constructor(doc, config2) {
          this.onFoldableChange_ = this.onFoldableChange_.bind(this);
          this.onValueChange_ = this.onValueChange_.bind(this);
          this.invertsY_ = config2.invertsY;
          this.maxValue_ = config2.maxValue;
          this.element = doc.createElement("div");
          this.element.classList.add(className$3());
          if (config2.layout === "popup") {
            this.element.classList.add(className$3(void 0, "p"));
          }
          const padElem = doc.createElement("div");
          padElem.classList.add(className$3("p"));
          config2.viewProps.bindTabIndex(padElem);
          this.element.appendChild(padElem);
          this.padElement = padElem;
          const svgElem = doc.createElementNS(SVG_NS, "svg");
          svgElem.classList.add(className$3("g"));
          this.padElement.appendChild(svgElem);
          this.svgElem_ = svgElem;
          const xAxisElem = doc.createElementNS(SVG_NS, "line");
          xAxisElem.classList.add(className$3("ax"));
          xAxisElem.setAttributeNS(null, "x1", "0");
          xAxisElem.setAttributeNS(null, "y1", "50%");
          xAxisElem.setAttributeNS(null, "x2", "100%");
          xAxisElem.setAttributeNS(null, "y2", "50%");
          this.svgElem_.appendChild(xAxisElem);
          const yAxisElem = doc.createElementNS(SVG_NS, "line");
          yAxisElem.classList.add(className$3("ax"));
          yAxisElem.setAttributeNS(null, "x1", "50%");
          yAxisElem.setAttributeNS(null, "y1", "0");
          yAxisElem.setAttributeNS(null, "x2", "50%");
          yAxisElem.setAttributeNS(null, "y2", "100%");
          this.svgElem_.appendChild(yAxisElem);
          const lineElem = doc.createElementNS(SVG_NS, "line");
          lineElem.classList.add(className$3("l"));
          lineElem.setAttributeNS(null, "x1", "50%");
          lineElem.setAttributeNS(null, "y1", "50%");
          this.svgElem_.appendChild(lineElem);
          this.lineElem_ = lineElem;
          const markerElem = doc.createElement("div");
          markerElem.classList.add(className$3("m"));
          this.padElement.appendChild(markerElem);
          this.markerElem_ = markerElem;
          config2.value.emitter.on("change", this.onValueChange_);
          this.value = config2.value;
          this.update_();
        }
        get allFocusableElements() {
          return [this.padElement];
        }
        update_() {
          const [x, y] = this.value.rawValue.getComponents();
          const max = this.maxValue_;
          const px = mapRange(x, -max, +max, 0, 100);
          const py = mapRange(y, -max, +max, 0, 100);
          const ipy = this.invertsY_ ? 100 - py : py;
          this.lineElem_.setAttributeNS(null, "x2", `${px}%`);
          this.lineElem_.setAttributeNS(null, "y2", `${ipy}%`);
          this.markerElem_.style.left = `${px}%`;
          this.markerElem_.style.top = `${ipy}%`;
        }
        onValueChange_() {
          this.update_();
        }
        onFoldableChange_() {
          this.update_();
        }
      }
      function computeOffset(ev, baseSteps, invertsY) {
        return [
          getStepForKey(baseSteps[0], getHorizontalStepKeys(ev)),
          getStepForKey(baseSteps[1], getVerticalStepKeys(ev)) * (invertsY ? 1 : -1)
        ];
      }
      class Point2dPickerController {
        constructor(doc, config2) {
          this.onPadKeyDown_ = this.onPadKeyDown_.bind(this);
          this.onPadKeyUp_ = this.onPadKeyUp_.bind(this);
          this.onPointerDown_ = this.onPointerDown_.bind(this);
          this.onPointerMove_ = this.onPointerMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.baseSteps_ = config2.baseSteps;
          this.maxValue_ = config2.maxValue;
          this.invertsY_ = config2.invertsY;
          this.view = new Point2dPickerView(doc, {
            invertsY: this.invertsY_,
            layout: config2.layout,
            maxValue: this.maxValue_,
            value: this.value,
            viewProps: this.viewProps
          });
          this.ptHandler_ = new PointerHandler(this.view.padElement);
          this.ptHandler_.emitter.on("down", this.onPointerDown_);
          this.ptHandler_.emitter.on("move", this.onPointerMove_);
          this.ptHandler_.emitter.on("up", this.onPointerUp_);
          this.view.padElement.addEventListener("keydown", this.onPadKeyDown_);
          this.view.padElement.addEventListener("keyup", this.onPadKeyUp_);
        }
        handlePointerEvent_(d, opts) {
          if (!d.point) {
            return;
          }
          const max = this.maxValue_;
          const px = mapRange(d.point.x, 0, d.bounds.width, -max, +max);
          const py = mapRange(this.invertsY_ ? d.bounds.height - d.point.y : d.point.y, 0, d.bounds.height, -max, +max);
          this.value.setRawValue(new Point2d(px, py), opts);
        }
        onPointerDown_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerMove_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerUp_(ev) {
          this.handlePointerEvent_(ev.data, {
            forceEmit: true,
            last: true
          });
        }
        onPadKeyDown_(ev) {
          if (isArrowKey(ev.key)) {
            ev.preventDefault();
          }
          const [dx, dy] = computeOffset(ev, this.baseSteps_, this.invertsY_);
          if (dx === 0 && dy === 0) {
            return;
          }
          this.value.setRawValue(new Point2d(this.value.rawValue.x + dx, this.value.rawValue.y + dy), {
            forceEmit: false,
            last: false
          });
        }
        onPadKeyUp_(ev) {
          const [dx, dy] = computeOffset(ev, this.baseSteps_, this.invertsY_);
          if (dx === 0 && dy === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue, {
            forceEmit: true,
            last: true
          });
        }
      }
      class Point2dController {
        constructor(doc, config2) {
          var _a, _b;
          this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this);
          this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this);
          this.onPadButtonBlur_ = this.onPadButtonBlur_.bind(this);
          this.onPadButtonClick_ = this.onPadButtonClick_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.foldable_ = Foldable.create(config2.expanded);
          this.popC_ = config2.pickerLayout === "popup" ? new PopupController(doc, {
            viewProps: this.viewProps
          }) : null;
          const padC = new Point2dPickerController(doc, {
            baseSteps: [config2.axes[0].baseStep, config2.axes[1].baseStep],
            invertsY: config2.invertsY,
            layout: config2.pickerLayout,
            maxValue: config2.maxValue,
            value: this.value,
            viewProps: this.viewProps
          });
          padC.view.allFocusableElements.forEach((elem) => {
            elem.addEventListener("blur", this.onPopupChildBlur_);
            elem.addEventListener("keydown", this.onPopupChildKeydown_);
          });
          this.pickerC_ = padC;
          this.textC_ = new PointNdTextController(doc, {
            assembly: Point2dAssembly,
            axes: config2.axes,
            parser: config2.parser,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view = new Point2dView(doc, {
            expanded: this.foldable_.value("expanded"),
            pickerLayout: config2.pickerLayout,
            viewProps: this.viewProps
          });
          this.view.textElement.appendChild(this.textC_.view.element);
          (_a = this.view.buttonElement) === null || _a === void 0 ? void 0 : _a.addEventListener("blur", this.onPadButtonBlur_);
          (_b = this.view.buttonElement) === null || _b === void 0 ? void 0 : _b.addEventListener("click", this.onPadButtonClick_);
          if (this.popC_) {
            this.view.element.appendChild(this.popC_.view.element);
            this.popC_.view.element.appendChild(this.pickerC_.view.element);
            connectValues({
              primary: this.foldable_.value("expanded"),
              secondary: this.popC_.shows,
              forward: (p) => p.rawValue,
              backward: (_, s) => s.rawValue
            });
          } else if (this.view.pickerElement) {
            this.view.pickerElement.appendChild(this.pickerC_.view.element);
            bindFoldable(this.foldable_, this.view.pickerElement);
          }
        }
        onPadButtonBlur_(e) {
          if (!this.popC_) {
            return;
          }
          const elem = this.view.element;
          const nextTarget = forceCast(e.relatedTarget);
          if (!nextTarget || !elem.contains(nextTarget)) {
            this.popC_.shows.rawValue = false;
          }
        }
        onPadButtonClick_() {
          this.foldable_.set("expanded", !this.foldable_.get("expanded"));
          if (this.foldable_.get("expanded")) {
            this.pickerC_.view.allFocusableElements[0].focus();
          }
        }
        onPopupChildBlur_(ev) {
          if (!this.popC_) {
            return;
          }
          const elem = this.popC_.view.element;
          const nextTarget = findNextTarget(ev);
          if (nextTarget && elem.contains(nextTarget)) {
            return;
          }
          if (nextTarget && nextTarget === this.view.buttonElement && !supportsTouch(elem.ownerDocument)) {
            return;
          }
          this.popC_.shows.rawValue = false;
        }
        onPopupChildKeydown_(ev) {
          if (this.popC_) {
            if (ev.key === "Escape") {
              this.popC_.shows.rawValue = false;
            }
          } else if (this.view.pickerElement) {
            if (ev.key === "Escape") {
              this.view.buttonElement.focus();
            }
          }
        }
      }
      function point2dFromUnknown(value) {
        return Point2d.isObject(value) ? new Point2d(value.x, value.y) : new Point2d();
      }
      function writePoint2d(target, value) {
        target.writeProperty("x", value.x);
        target.writeProperty("y", value.y);
      }
      function createDimensionConstraint$2(params) {
        if (!params) {
          return void 0;
        }
        const constraints = [];
        if (!isEmpty(params.step)) {
          constraints.push(new StepConstraint(params.step));
        }
        if (!isEmpty(params.max) || !isEmpty(params.min)) {
          constraints.push(new RangeConstraint({
            max: params.max,
            min: params.min
          }));
        }
        return new CompositeConstraint(constraints);
      }
      function createConstraint$3(params) {
        return new PointNdConstraint({
          assembly: Point2dAssembly,
          components: [
            createDimensionConstraint$2("x" in params ? params.x : void 0),
            createDimensionConstraint$2("y" in params ? params.y : void 0)
          ]
        });
      }
      function getSuitableMaxDimensionValue(constraint, rawValue) {
        const rc = constraint && findConstraint(constraint, RangeConstraint);
        if (rc) {
          return Math.max(Math.abs(rc.minValue || 0), Math.abs(rc.maxValue || 0));
        }
        const step = getBaseStep(constraint);
        return Math.max(Math.abs(step) * 10, Math.abs(rawValue) * 10);
      }
      function getSuitableMaxValue(initialValue, constraint) {
        const xc = constraint instanceof PointNdConstraint ? constraint.components[0] : void 0;
        const yc = constraint instanceof PointNdConstraint ? constraint.components[1] : void 0;
        const xr = getSuitableMaxDimensionValue(xc, initialValue.x);
        const yr = getSuitableMaxDimensionValue(yc, initialValue.y);
        return Math.max(xr, yr);
      }
      function createAxis$2(initialValue, constraint) {
        return {
          baseStep: getBaseStep(constraint),
          constraint,
          textProps: ValueMap.fromObject({
            draggingScale: getSuitableDraggingScale(constraint, initialValue),
            formatter: createNumberFormatter(getSuitableDecimalDigits(constraint, initialValue))
          })
        };
      }
      function shouldInvertY(params) {
        if (!("y" in params)) {
          return false;
        }
        const yParams = params.y;
        if (!yParams) {
          return false;
        }
        return "inverted" in yParams ? !!yParams.inverted : false;
      }
      const Point2dInputPlugin = {
        id: "input-point2d",
        type: "input",
        accept: (value, params) => {
          if (!Point2d.isObject(value)) {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            expanded: p.optional.boolean,
            picker: p.optional.custom(parsePickerLayout),
            x: p.optional.custom(parsePointDimensionParams),
            y: p.optional.object({
              inverted: p.optional.boolean,
              max: p.optional.number,
              min: p.optional.number,
              step: p.optional.number
            })
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => point2dFromUnknown,
          constraint: (args) => createConstraint$3(args.params),
          equals: Point2d.equals,
          writer: (_args) => writePoint2d
        },
        controller: (args) => {
          const doc = args.document;
          const value = args.value;
          const c = args.constraint;
          if (!(c instanceof PointNdConstraint)) {
            throw TpError.shouldNeverHappen();
          }
          const expanded = "expanded" in args.params ? args.params.expanded : void 0;
          const picker = "picker" in args.params ? args.params.picker : void 0;
          return new Point2dController(doc, {
            axes: [
              createAxis$2(value.rawValue.x, c.components[0]),
              createAxis$2(value.rawValue.y, c.components[1])
            ],
            expanded: expanded !== null && expanded !== void 0 ? expanded : false,
            invertsY: shouldInvertY(args.params),
            maxValue: getSuitableMaxValue(value.rawValue, c),
            parser: parseNumber,
            pickerLayout: picker !== null && picker !== void 0 ? picker : "popup",
            value,
            viewProps: args.viewProps
          });
        }
      };
      class Point3d {
        constructor(x = 0, y = 0, z = 0) {
          this.x = x;
          this.y = y;
          this.z = z;
        }
        getComponents() {
          return [this.x, this.y, this.z];
        }
        static isObject(obj) {
          if (isEmpty(obj)) {
            return false;
          }
          const x = obj.x;
          const y = obj.y;
          const z = obj.z;
          if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") {
            return false;
          }
          return true;
        }
        static equals(v1, v2) {
          return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
        }
        toObject() {
          return {
            x: this.x,
            y: this.y,
            z: this.z
          };
        }
      }
      const Point3dAssembly = {
        toComponents: (p) => p.getComponents(),
        fromComponents: (comps) => new Point3d(...comps)
      };
      function point3dFromUnknown(value) {
        return Point3d.isObject(value) ? new Point3d(value.x, value.y, value.z) : new Point3d();
      }
      function writePoint3d(target, value) {
        target.writeProperty("x", value.x);
        target.writeProperty("y", value.y);
        target.writeProperty("z", value.z);
      }
      function createDimensionConstraint$1(params) {
        if (!params) {
          return void 0;
        }
        const constraints = [];
        if (!isEmpty(params.step)) {
          constraints.push(new StepConstraint(params.step));
        }
        if (!isEmpty(params.max) || !isEmpty(params.min)) {
          constraints.push(new RangeConstraint({
            max: params.max,
            min: params.min
          }));
        }
        return new CompositeConstraint(constraints);
      }
      function createConstraint$2(params) {
        return new PointNdConstraint({
          assembly: Point3dAssembly,
          components: [
            createDimensionConstraint$1("x" in params ? params.x : void 0),
            createDimensionConstraint$1("y" in params ? params.y : void 0),
            createDimensionConstraint$1("z" in params ? params.z : void 0)
          ]
        });
      }
      function createAxis$1(initialValue, constraint) {
        return {
          baseStep: getBaseStep(constraint),
          constraint,
          textProps: ValueMap.fromObject({
            draggingScale: getSuitableDraggingScale(constraint, initialValue),
            formatter: createNumberFormatter(getSuitableDecimalDigits(constraint, initialValue))
          })
        };
      }
      const Point3dInputPlugin = {
        id: "input-point3d",
        type: "input",
        accept: (value, params) => {
          if (!Point3d.isObject(value)) {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            x: p.optional.custom(parsePointDimensionParams),
            y: p.optional.custom(parsePointDimensionParams),
            z: p.optional.custom(parsePointDimensionParams)
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => point3dFromUnknown,
          constraint: (args) => createConstraint$2(args.params),
          equals: Point3d.equals,
          writer: (_args) => writePoint3d
        },
        controller: (args) => {
          const value = args.value;
          const c = args.constraint;
          if (!(c instanceof PointNdConstraint)) {
            throw TpError.shouldNeverHappen();
          }
          return new PointNdTextController(args.document, {
            assembly: Point3dAssembly,
            axes: [
              createAxis$1(value.rawValue.x, c.components[0]),
              createAxis$1(value.rawValue.y, c.components[1]),
              createAxis$1(value.rawValue.z, c.components[2])
            ],
            parser: parseNumber,
            value,
            viewProps: args.viewProps
          });
        }
      };
      class Point4d {
        constructor(x = 0, y = 0, z = 0, w = 0) {
          this.x = x;
          this.y = y;
          this.z = z;
          this.w = w;
        }
        getComponents() {
          return [this.x, this.y, this.z, this.w];
        }
        static isObject(obj) {
          if (isEmpty(obj)) {
            return false;
          }
          const x = obj.x;
          const y = obj.y;
          const z = obj.z;
          const w = obj.w;
          if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number" || typeof w !== "number") {
            return false;
          }
          return true;
        }
        static equals(v1, v2) {
          return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z && v1.w === v2.w;
        }
        toObject() {
          return {
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.w
          };
        }
      }
      const Point4dAssembly = {
        toComponents: (p) => p.getComponents(),
        fromComponents: (comps) => new Point4d(...comps)
      };
      function point4dFromUnknown(value) {
        return Point4d.isObject(value) ? new Point4d(value.x, value.y, value.z, value.w) : new Point4d();
      }
      function writePoint4d(target, value) {
        target.writeProperty("x", value.x);
        target.writeProperty("y", value.y);
        target.writeProperty("z", value.z);
        target.writeProperty("w", value.w);
      }
      function createDimensionConstraint(params) {
        if (!params) {
          return void 0;
        }
        const constraints = [];
        if (!isEmpty(params.step)) {
          constraints.push(new StepConstraint(params.step));
        }
        if (!isEmpty(params.max) || !isEmpty(params.min)) {
          constraints.push(new RangeConstraint({
            max: params.max,
            min: params.min
          }));
        }
        return new CompositeConstraint(constraints);
      }
      function createConstraint$1(params) {
        return new PointNdConstraint({
          assembly: Point4dAssembly,
          components: [
            createDimensionConstraint("x" in params ? params.x : void 0),
            createDimensionConstraint("y" in params ? params.y : void 0),
            createDimensionConstraint("z" in params ? params.z : void 0),
            createDimensionConstraint("w" in params ? params.w : void 0)
          ]
        });
      }
      function createAxis(initialValue, constraint) {
        return {
          baseStep: getBaseStep(constraint),
          constraint,
          textProps: ValueMap.fromObject({
            draggingScale: getSuitableDraggingScale(constraint, initialValue),
            formatter: createNumberFormatter(getSuitableDecimalDigits(constraint, initialValue))
          })
        };
      }
      const Point4dInputPlugin = {
        id: "input-point4d",
        type: "input",
        accept: (value, params) => {
          if (!Point4d.isObject(value)) {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            x: p.optional.custom(parsePointDimensionParams),
            y: p.optional.custom(parsePointDimensionParams),
            z: p.optional.custom(parsePointDimensionParams),
            w: p.optional.custom(parsePointDimensionParams)
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => point4dFromUnknown,
          constraint: (args) => createConstraint$1(args.params),
          equals: Point4d.equals,
          writer: (_args) => writePoint4d
        },
        controller: (args) => {
          const value = args.value;
          const c = args.constraint;
          if (!(c instanceof PointNdConstraint)) {
            throw TpError.shouldNeverHappen();
          }
          return new PointNdTextController(args.document, {
            assembly: Point4dAssembly,
            axes: value.rawValue.getComponents().map((comp, index) => createAxis(comp, c.components[index])),
            parser: parseNumber,
            value,
            viewProps: args.viewProps
          });
        }
      };
      function createConstraint(params) {
        const constraints = [];
        const lc = createListConstraint(params.options);
        if (lc) {
          constraints.push(lc);
        }
        return new CompositeConstraint(constraints);
      }
      const StringInputPlugin = {
        id: "input-string",
        type: "input",
        accept: (value, params) => {
          if (typeof value !== "string") {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            options: p.optional.custom(parseListOptions)
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => stringFromUnknown,
          constraint: (args) => createConstraint(args.params),
          writer: (_args) => writePrimitive
        },
        controller: (args) => {
          var _a;
          const doc = args.document;
          const value = args.value;
          const c = args.constraint;
          if (c && findConstraint(c, ListConstraint)) {
            return new ListController(doc, {
              props: ValueMap.fromObject({
                options: (_a = findListItems(c)) !== null && _a !== void 0 ? _a : []
              }),
              value,
              viewProps: args.viewProps
            });
          }
          return new TextController(doc, {
            parser: (v) => v,
            props: ValueMap.fromObject({
              formatter: formatString
            }),
            value,
            viewProps: args.viewProps
          });
        }
      };
      const Constants = {
        monitor: {
          defaultInterval: 200,
          defaultLineCount: 3
        }
      };
      const className$2 = ClassName("mll");
      class MultiLogView {
        constructor(doc, config2) {
          this.onValueUpdate_ = this.onValueUpdate_.bind(this);
          this.formatter_ = config2.formatter;
          this.element = doc.createElement("div");
          this.element.classList.add(className$2());
          config2.viewProps.bindClassModifiers(this.element);
          const textareaElem = doc.createElement("textarea");
          textareaElem.classList.add(className$2("i"));
          textareaElem.style.height = `calc(var(--bld-us) * ${config2.lineCount})`;
          textareaElem.readOnly = true;
          config2.viewProps.bindDisabled(textareaElem);
          this.element.appendChild(textareaElem);
          this.textareaElem_ = textareaElem;
          config2.value.emitter.on("change", this.onValueUpdate_);
          this.value = config2.value;
          this.update_();
        }
        update_() {
          const elem = this.textareaElem_;
          const shouldScroll = elem.scrollTop === elem.scrollHeight - elem.clientHeight;
          const lines = [];
          this.value.rawValue.forEach((value) => {
            if (value !== void 0) {
              lines.push(this.formatter_(value));
            }
          });
          elem.textContent = lines.join("\n");
          if (shouldScroll) {
            elem.scrollTop = elem.scrollHeight;
          }
        }
        onValueUpdate_() {
          this.update_();
        }
      }
      class MultiLogController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new MultiLogView(doc, {
            formatter: config2.formatter,
            lineCount: config2.lineCount,
            value: this.value,
            viewProps: this.viewProps
          });
        }
      }
      const className$1 = ClassName("sgl");
      class SingleLogView {
        constructor(doc, config2) {
          this.onValueUpdate_ = this.onValueUpdate_.bind(this);
          this.formatter_ = config2.formatter;
          this.element = doc.createElement("div");
          this.element.classList.add(className$1());
          config2.viewProps.bindClassModifiers(this.element);
          const inputElem = doc.createElement("input");
          inputElem.classList.add(className$1("i"));
          inputElem.readOnly = true;
          inputElem.type = "text";
          config2.viewProps.bindDisabled(inputElem);
          this.element.appendChild(inputElem);
          this.inputElement = inputElem;
          config2.value.emitter.on("change", this.onValueUpdate_);
          this.value = config2.value;
          this.update_();
        }
        update_() {
          const values = this.value.rawValue;
          const lastValue = values[values.length - 1];
          this.inputElement.value = lastValue !== void 0 ? this.formatter_(lastValue) : "";
        }
        onValueUpdate_() {
          this.update_();
        }
      }
      class SingleLogController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new SingleLogView(doc, {
            formatter: config2.formatter,
            value: this.value,
            viewProps: this.viewProps
          });
        }
      }
      const BooleanMonitorPlugin = {
        id: "monitor-bool",
        type: "monitor",
        accept: (value, params) => {
          if (typeof value !== "boolean") {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            lineCount: p.optional.number
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => boolFromUnknown
        },
        controller: (args) => {
          var _a;
          if (args.value.rawValue.length === 1) {
            return new SingleLogController(args.document, {
              formatter: BooleanFormatter,
              value: args.value,
              viewProps: args.viewProps
            });
          }
          return new MultiLogController(args.document, {
            formatter: BooleanFormatter,
            lineCount: (_a = args.params.lineCount) !== null && _a !== void 0 ? _a : Constants.monitor.defaultLineCount,
            value: args.value,
            viewProps: args.viewProps
          });
        }
      };
      class GraphCursor {
        constructor() {
          this.emitter = new Emitter();
          this.index_ = -1;
        }
        get index() {
          return this.index_;
        }
        set index(index) {
          const changed = this.index_ !== index;
          if (changed) {
            this.index_ = index;
            this.emitter.emit("change", {
              index,
              sender: this
            });
          }
        }
      }
      const className = ClassName("grl");
      class GraphLogView {
        constructor(doc, config2) {
          this.onCursorChange_ = this.onCursorChange_.bind(this);
          this.onValueUpdate_ = this.onValueUpdate_.bind(this);
          this.element = doc.createElement("div");
          this.element.classList.add(className());
          config2.viewProps.bindClassModifiers(this.element);
          this.formatter_ = config2.formatter;
          this.minValue_ = config2.minValue;
          this.maxValue_ = config2.maxValue;
          this.cursor_ = config2.cursor;
          this.cursor_.emitter.on("change", this.onCursorChange_);
          const svgElem = doc.createElementNS(SVG_NS, "svg");
          svgElem.classList.add(className("g"));
          svgElem.style.height = `calc(var(--bld-us) * ${config2.lineCount})`;
          this.element.appendChild(svgElem);
          this.svgElem_ = svgElem;
          const lineElem = doc.createElementNS(SVG_NS, "polyline");
          this.svgElem_.appendChild(lineElem);
          this.lineElem_ = lineElem;
          const tooltipElem = doc.createElement("div");
          tooltipElem.classList.add(className("t"), ClassName("tt")());
          this.element.appendChild(tooltipElem);
          this.tooltipElem_ = tooltipElem;
          config2.value.emitter.on("change", this.onValueUpdate_);
          this.value = config2.value;
          this.update_();
        }
        get graphElement() {
          return this.svgElem_;
        }
        update_() {
          const bounds = this.svgElem_.getBoundingClientRect();
          const maxIndex = this.value.rawValue.length - 1;
          const min = this.minValue_;
          const max = this.maxValue_;
          const points = [];
          this.value.rawValue.forEach((v, index) => {
            if (v === void 0) {
              return;
            }
            const x = mapRange(index, 0, maxIndex, 0, bounds.width);
            const y = mapRange(v, min, max, bounds.height, 0);
            points.push([x, y].join(","));
          });
          this.lineElem_.setAttributeNS(null, "points", points.join(" "));
          const tooltipElem = this.tooltipElem_;
          const value = this.value.rawValue[this.cursor_.index];
          if (value === void 0) {
            tooltipElem.classList.remove(className("t", "a"));
            return;
          }
          const tx = mapRange(this.cursor_.index, 0, maxIndex, 0, bounds.width);
          const ty = mapRange(value, min, max, bounds.height, 0);
          tooltipElem.style.left = `${tx}px`;
          tooltipElem.style.top = `${ty}px`;
          tooltipElem.textContent = `${this.formatter_(value)}`;
          if (!tooltipElem.classList.contains(className("t", "a"))) {
            tooltipElem.classList.add(className("t", "a"), className("t", "in"));
            forceReflow(tooltipElem);
            tooltipElem.classList.remove(className("t", "in"));
          }
        }
        onValueUpdate_() {
          this.update_();
        }
        onCursorChange_() {
          this.update_();
        }
      }
      class GraphLogController {
        constructor(doc, config2) {
          this.onGraphMouseMove_ = this.onGraphMouseMove_.bind(this);
          this.onGraphMouseLeave_ = this.onGraphMouseLeave_.bind(this);
          this.onGraphPointerDown_ = this.onGraphPointerDown_.bind(this);
          this.onGraphPointerMove_ = this.onGraphPointerMove_.bind(this);
          this.onGraphPointerUp_ = this.onGraphPointerUp_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.cursor_ = new GraphCursor();
          this.view = new GraphLogView(doc, {
            cursor: this.cursor_,
            formatter: config2.formatter,
            lineCount: config2.lineCount,
            maxValue: config2.maxValue,
            minValue: config2.minValue,
            value: this.value,
            viewProps: this.viewProps
          });
          if (!supportsTouch(doc)) {
            this.view.element.addEventListener("mousemove", this.onGraphMouseMove_);
            this.view.element.addEventListener("mouseleave", this.onGraphMouseLeave_);
          } else {
            const ph = new PointerHandler(this.view.element);
            ph.emitter.on("down", this.onGraphPointerDown_);
            ph.emitter.on("move", this.onGraphPointerMove_);
            ph.emitter.on("up", this.onGraphPointerUp_);
          }
        }
        onGraphMouseLeave_() {
          this.cursor_.index = -1;
        }
        onGraphMouseMove_(ev) {
          const bounds = this.view.element.getBoundingClientRect();
          this.cursor_.index = Math.floor(mapRange(ev.offsetX, 0, bounds.width, 0, this.value.rawValue.length));
        }
        onGraphPointerDown_(ev) {
          this.onGraphPointerMove_(ev);
        }
        onGraphPointerMove_(ev) {
          if (!ev.data.point) {
            this.cursor_.index = -1;
            return;
          }
          this.cursor_.index = Math.floor(mapRange(ev.data.point.x, 0, ev.data.bounds.width, 0, this.value.rawValue.length));
        }
        onGraphPointerUp_() {
          this.cursor_.index = -1;
        }
      }
      function createFormatter(params) {
        return "format" in params && !isEmpty(params.format) ? params.format : createNumberFormatter(2);
      }
      function createTextMonitor(args) {
        var _a;
        if (args.value.rawValue.length === 1) {
          return new SingleLogController(args.document, {
            formatter: createFormatter(args.params),
            value: args.value,
            viewProps: args.viewProps
          });
        }
        return new MultiLogController(args.document, {
          formatter: createFormatter(args.params),
          lineCount: (_a = args.params.lineCount) !== null && _a !== void 0 ? _a : Constants.monitor.defaultLineCount,
          value: args.value,
          viewProps: args.viewProps
        });
      }
      function createGraphMonitor(args) {
        var _a, _b, _c;
        return new GraphLogController(args.document, {
          formatter: createFormatter(args.params),
          lineCount: (_a = args.params.lineCount) !== null && _a !== void 0 ? _a : Constants.monitor.defaultLineCount,
          maxValue: (_b = "max" in args.params ? args.params.max : null) !== null && _b !== void 0 ? _b : 100,
          minValue: (_c = "min" in args.params ? args.params.min : null) !== null && _c !== void 0 ? _c : 0,
          value: args.value,
          viewProps: args.viewProps
        });
      }
      function shouldShowGraph(params) {
        return "view" in params && params.view === "graph";
      }
      const NumberMonitorPlugin = {
        id: "monitor-number",
        type: "monitor",
        accept: (value, params) => {
          if (typeof value !== "number") {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            format: p.optional.function,
            lineCount: p.optional.number,
            max: p.optional.number,
            min: p.optional.number,
            view: p.optional.string
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          defaultBufferSize: (params) => shouldShowGraph(params) ? 64 : 1,
          reader: (_args) => numberFromUnknown
        },
        controller: (args) => {
          if (shouldShowGraph(args.params)) {
            return createGraphMonitor(args);
          }
          return createTextMonitor(args);
        }
      };
      const StringMonitorPlugin = {
        id: "monitor-string",
        type: "monitor",
        accept: (value, params) => {
          if (typeof value !== "string") {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            lineCount: p.optional.number,
            multiline: p.optional.boolean
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => stringFromUnknown
        },
        controller: (args) => {
          var _a;
          const value = args.value;
          const multiline = value.rawValue.length > 1 || "multiline" in args.params && args.params.multiline;
          if (multiline) {
            return new MultiLogController(args.document, {
              formatter: formatString,
              lineCount: (_a = args.params.lineCount) !== null && _a !== void 0 ? _a : Constants.monitor.defaultLineCount,
              value,
              viewProps: args.viewProps
            });
          }
          return new SingleLogController(args.document, {
            formatter: formatString,
            value,
            viewProps: args.viewProps
          });
        }
      };
      class InputBinding {
        constructor(config2) {
          this.onValueChange_ = this.onValueChange_.bind(this);
          this.reader = config2.reader;
          this.writer = config2.writer;
          this.emitter = new Emitter();
          this.value = config2.value;
          this.value.emitter.on("change", this.onValueChange_);
          this.target = config2.target;
          this.read();
        }
        read() {
          const targetValue = this.target.read();
          if (targetValue !== void 0) {
            this.value.rawValue = this.reader(targetValue);
          }
        }
        write_(rawValue) {
          this.writer(this.target, rawValue);
        }
        onValueChange_(ev) {
          this.write_(ev.rawValue);
          this.emitter.emit("change", {
            options: ev.options,
            rawValue: ev.rawValue,
            sender: this
          });
        }
      }
      function createInputBindingController(plugin, args) {
        const result = plugin.accept(args.target.read(), args.params);
        if (isEmpty(result)) {
          return null;
        }
        const p = ParamsParsers;
        const valueArgs = {
          target: args.target,
          initialValue: result.initialValue,
          params: result.params
        };
        const reader = plugin.binding.reader(valueArgs);
        const constraint = plugin.binding.constraint ? plugin.binding.constraint(valueArgs) : void 0;
        const value = createValue(reader(result.initialValue), {
          constraint,
          equals: plugin.binding.equals
        });
        const binding = new InputBinding({
          reader,
          target: args.target,
          value,
          writer: plugin.binding.writer(valueArgs)
        });
        const disabled = p.optional.boolean(args.params.disabled).value;
        const hidden = p.optional.boolean(args.params.hidden).value;
        const controller = plugin.controller({
          constraint,
          document: args.document,
          initialValue: result.initialValue,
          params: result.params,
          value: binding.value,
          viewProps: ViewProps.create({
            disabled,
            hidden
          })
        });
        const label = p.optional.string(args.params.label).value;
        return new InputBindingController(args.document, {
          binding,
          blade: createBlade(),
          props: ValueMap.fromObject({
            label: label || args.target.key
          }),
          valueController: controller
        });
      }
      class MonitorBinding {
        constructor(config2) {
          this.onTick_ = this.onTick_.bind(this);
          this.reader_ = config2.reader;
          this.target = config2.target;
          this.emitter = new Emitter();
          this.value = config2.value;
          this.ticker = config2.ticker;
          this.ticker.emitter.on("tick", this.onTick_);
          this.read();
        }
        dispose() {
          this.ticker.dispose();
        }
        read() {
          const targetValue = this.target.read();
          if (targetValue === void 0) {
            return;
          }
          const buffer = this.value.rawValue;
          const newValue = this.reader_(targetValue);
          this.value.rawValue = createPushedBuffer(buffer, newValue);
          this.emitter.emit("update", {
            rawValue: newValue,
            sender: this
          });
        }
        onTick_(_) {
          this.read();
        }
      }
      function createTicker(document2, interval) {
        return interval === 0 ? new ManualTicker() : new IntervalTicker(document2, interval !== null && interval !== void 0 ? interval : Constants.monitor.defaultInterval);
      }
      function createMonitorBindingController(plugin, args) {
        var _a, _b, _c;
        const P = ParamsParsers;
        const result = plugin.accept(args.target.read(), args.params);
        if (isEmpty(result)) {
          return null;
        }
        const bindingArgs = {
          target: args.target,
          initialValue: result.initialValue,
          params: result.params
        };
        const reader = plugin.binding.reader(bindingArgs);
        const bufferSize = (_b = (_a = P.optional.number(args.params.bufferSize).value) !== null && _a !== void 0 ? _a : plugin.binding.defaultBufferSize && plugin.binding.defaultBufferSize(result.params)) !== null && _b !== void 0 ? _b : 1;
        const interval = P.optional.number(args.params.interval).value;
        const binding = new MonitorBinding({
          reader,
          target: args.target,
          ticker: createTicker(args.document, interval),
          value: initializeBuffer(bufferSize)
        });
        const disabled = P.optional.boolean(args.params.disabled).value;
        const hidden = P.optional.boolean(args.params.hidden).value;
        const controller = plugin.controller({
          document: args.document,
          params: result.params,
          value: binding.value,
          viewProps: ViewProps.create({
            disabled,
            hidden
          })
        });
        const label = (_c = P.optional.string(args.params.label).value) !== null && _c !== void 0 ? _c : args.target.key;
        return new MonitorBindingController(args.document, {
          binding,
          blade: createBlade(),
          props: ValueMap.fromObject({
            label
          }),
          valueController: controller
        });
      }
      class PluginPool {
        constructor() {
          this.pluginsMap_ = {
            blades: [],
            inputs: [],
            monitors: []
          };
        }
        getAll() {
          return [
            ...this.pluginsMap_.blades,
            ...this.pluginsMap_.inputs,
            ...this.pluginsMap_.monitors
          ];
        }
        register(r) {
          if (r.type === "blade") {
            this.pluginsMap_.blades.unshift(r);
          } else if (r.type === "input") {
            this.pluginsMap_.inputs.unshift(r);
          } else if (r.type === "monitor") {
            this.pluginsMap_.monitors.unshift(r);
          }
        }
        createInput(document2, target, params) {
          const initialValue = target.read();
          if (isEmpty(initialValue)) {
            throw new TpError({
              context: {
                key: target.key
              },
              type: "nomatchingcontroller"
            });
          }
          const bc = this.pluginsMap_.inputs.reduce((result, plugin) => result || createInputBindingController(plugin, {
            document: document2,
            target,
            params
          }), null);
          if (bc) {
            return bc;
          }
          throw new TpError({
            context: {
              key: target.key
            },
            type: "nomatchingcontroller"
          });
        }
        createMonitor(document2, target, params) {
          const bc = this.pluginsMap_.monitors.reduce((result, plugin) => result || createMonitorBindingController(plugin, {
            document: document2,
            params,
            target
          }), null);
          if (bc) {
            return bc;
          }
          throw new TpError({
            context: {
              key: target.key
            },
            type: "nomatchingcontroller"
          });
        }
        createBlade(document2, params) {
          const bc = this.pluginsMap_.blades.reduce((result, plugin) => result || createBladeController(plugin, {
            document: document2,
            params
          }), null);
          if (!bc) {
            throw new TpError({
              type: "nomatchingview",
              context: {
                params
              }
            });
          }
          return bc;
        }
        createBladeApi(bc) {
          if (bc instanceof InputBindingController) {
            return new InputBindingApi(bc);
          }
          if (bc instanceof MonitorBindingController) {
            return new MonitorBindingApi(bc);
          }
          if (bc instanceof RackController) {
            return new RackApi(bc, this);
          }
          const api = this.pluginsMap_.blades.reduce((result, plugin) => result || plugin.api({
            controller: bc,
            pool: this
          }), null);
          if (!api) {
            throw TpError.shouldNeverHappen();
          }
          return api;
        }
      }
      function createDefaultPluginPool() {
        const pool = new PluginPool();
        [
          Point2dInputPlugin,
          Point3dInputPlugin,
          Point4dInputPlugin,
          StringInputPlugin,
          NumberInputPlugin,
          StringColorInputPlugin,
          ObjectColorInputPlugin,
          NumberColorInputPlugin,
          BooleanInputPlugin,
          BooleanMonitorPlugin,
          StringMonitorPlugin,
          NumberMonitorPlugin,
          ButtonBladePlugin,
          FolderBladePlugin,
          SeparatorBladePlugin,
          TabBladePlugin
        ].forEach((p) => {
          pool.register(p);
        });
        return pool;
      }
      class ListApi extends BladeApi {
        constructor(controller) {
          super(controller);
          this.emitter_ = new Emitter();
          this.controller_.valueController.value.emitter.on("change", (ev) => {
            this.emitter_.emit("change", {
              event: new TpChangeEvent(this, ev.rawValue)
            });
          });
        }
        get label() {
          return this.controller_.props.get("label");
        }
        set label(label) {
          this.controller_.props.set("label", label);
        }
        get options() {
          return this.controller_.valueController.props.get("options");
        }
        set options(options) {
          this.controller_.valueController.props.set("options", options);
        }
        get value() {
          return this.controller_.valueController.value.rawValue;
        }
        set value(value) {
          this.controller_.valueController.value.rawValue = value;
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
      }
      class SliderApi extends BladeApi {
        constructor(controller) {
          super(controller);
          this.emitter_ = new Emitter();
          this.controller_.valueController.value.emitter.on("change", (ev) => {
            this.emitter_.emit("change", {
              event: new TpChangeEvent(this, ev.rawValue)
            });
          });
        }
        get label() {
          return this.controller_.props.get("label");
        }
        set label(label) {
          this.controller_.props.set("label", label);
        }
        get maxValue() {
          return this.controller_.valueController.sliderController.props.get("maxValue");
        }
        set maxValue(maxValue) {
          this.controller_.valueController.sliderController.props.set("maxValue", maxValue);
        }
        get minValue() {
          return this.controller_.valueController.sliderController.props.get("minValue");
        }
        set minValue(minValue) {
          this.controller_.valueController.sliderController.props.set("minValue", minValue);
        }
        get value() {
          return this.controller_.valueController.value.rawValue;
        }
        set value(value) {
          this.controller_.valueController.value.rawValue = value;
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
      }
      class TextApi extends BladeApi {
        constructor(controller) {
          super(controller);
          this.emitter_ = new Emitter();
          this.controller_.valueController.value.emitter.on("change", (ev) => {
            this.emitter_.emit("change", {
              event: new TpChangeEvent(this, ev.rawValue)
            });
          });
        }
        get label() {
          return this.controller_.props.get("label");
        }
        set label(label) {
          this.controller_.props.set("label", label);
        }
        get formatter() {
          return this.controller_.valueController.props.get("formatter");
        }
        set formatter(formatter) {
          this.controller_.valueController.props.set("formatter", formatter);
        }
        get value() {
          return this.controller_.valueController.value.rawValue;
        }
        set value(value) {
          this.controller_.valueController.value.rawValue = value;
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
      }
      const ListBladePlugin = function() {
        return {
          id: "list",
          type: "blade",
          accept(params) {
            const p = ParamsParsers;
            const result = parseParams(params, {
              options: p.required.custom(parseListOptions),
              value: p.required.raw,
              view: p.required.constant("list"),
              label: p.optional.string
            });
            return result ? {params: result} : null;
          },
          controller(args) {
            const ic = new ListController(args.document, {
              props: ValueMap.fromObject({
                options: normalizeListOptions(args.params.options)
              }),
              value: createValue(args.params.value),
              viewProps: args.viewProps
            });
            return new LabeledValueController(args.document, {
              blade: args.blade,
              props: ValueMap.fromObject({
                label: args.params.label
              }),
              valueController: ic
            });
          },
          api(args) {
            if (!(args.controller instanceof LabeledValueController)) {
              return null;
            }
            if (!(args.controller.valueController instanceof ListController)) {
              return null;
            }
            return new ListApi(args.controller);
          }
        };
      }();
      function exportPresetJson(targets) {
        return targets.reduce((result, target) => {
          return Object.assign(result, {
            [target.presetKey]: target.read()
          });
        }, {});
      }
      function importPresetJson(targets, preset) {
        targets.forEach((target) => {
          const value = preset[target.presetKey];
          if (value !== void 0) {
            target.write(value);
          }
        });
      }
      class RootApi extends FolderApi {
        constructor(controller, pool) {
          super(controller, pool);
        }
        get element() {
          return this.controller_.view.element;
        }
        importPreset(preset) {
          const targets = this.controller_.rackController.rack.find(InputBindingController).map((ibc) => {
            return ibc.binding.target;
          });
          importPresetJson(targets, preset);
          this.refresh();
        }
        exportPreset() {
          const targets = this.controller_.rackController.rack.find(InputBindingController).map((ibc) => {
            return ibc.binding.target;
          });
          return exportPresetJson(targets);
        }
        refresh() {
          this.controller_.rackController.rack.find(InputBindingController).forEach((ibc) => {
            ibc.binding.read();
          });
          this.controller_.rackController.rack.find(MonitorBindingController).forEach((mbc) => {
            mbc.binding.read();
          });
        }
      }
      class RootController extends FolderController {
        constructor(doc, config2) {
          super(doc, {
            expanded: config2.expanded,
            blade: config2.blade,
            props: config2.props,
            root: true,
            viewProps: config2.viewProps
          });
        }
      }
      const SliderBladePlugin = {
        id: "slider",
        type: "blade",
        accept(params) {
          const p = ParamsParsers;
          const result = parseParams(params, {
            max: p.required.number,
            min: p.required.number,
            view: p.required.constant("slider"),
            format: p.optional.function,
            label: p.optional.string,
            value: p.optional.number
          });
          return result ? {params: result} : null;
        },
        controller(args) {
          var _a, _b;
          const v = (_a = args.params.value) !== null && _a !== void 0 ? _a : 0;
          const vc = new SliderTextController(args.document, {
            baseStep: 1,
            parser: parseNumber,
            sliderProps: ValueMap.fromObject({
              maxValue: args.params.max,
              minValue: args.params.min
            }),
            textProps: ValueMap.fromObject({
              draggingScale: getSuitableDraggingScale(void 0, v),
              formatter: (_b = args.params.format) !== null && _b !== void 0 ? _b : numberToString
            }),
            value: createValue(v),
            viewProps: args.viewProps
          });
          return new LabeledValueController(args.document, {
            blade: args.blade,
            props: ValueMap.fromObject({
              label: args.params.label
            }),
            valueController: vc
          });
        },
        api(args) {
          if (!(args.controller instanceof LabeledValueController)) {
            return null;
          }
          if (!(args.controller.valueController instanceof SliderTextController)) {
            return null;
          }
          return new SliderApi(args.controller);
        }
      };
      const TextBladePlugin = function() {
        return {
          id: "text",
          type: "blade",
          accept(params) {
            const p = ParamsParsers;
            const result = parseParams(params, {
              parse: p.required.function,
              value: p.required.raw,
              view: p.required.constant("text"),
              format: p.optional.function,
              label: p.optional.string
            });
            return result ? {params: result} : null;
          },
          controller(args) {
            var _a;
            const ic = new TextController(args.document, {
              parser: args.params.parse,
              props: ValueMap.fromObject({
                formatter: (_a = args.params.format) !== null && _a !== void 0 ? _a : (v) => String(v)
              }),
              value: createValue(args.params.value),
              viewProps: args.viewProps
            });
            return new LabeledValueController(args.document, {
              blade: args.blade,
              props: ValueMap.fromObject({
                label: args.params.label
              }),
              valueController: ic
            });
          },
          api(args) {
            if (!(args.controller instanceof LabeledValueController)) {
              return null;
            }
            if (!(args.controller.valueController instanceof TextController)) {
              return null;
            }
            return new TextApi(args.controller);
          }
        };
      }();
      function createDefaultWrapperElement(doc) {
        const elem = doc.createElement("div");
        elem.classList.add(ClassName("dfw")());
        if (doc.body) {
          doc.body.appendChild(elem);
        }
        return elem;
      }
      function embedStyle(doc, id, css) {
        if (doc.querySelector(`style[data-tp-style=${id}]`)) {
          return;
        }
        const styleElem = doc.createElement("style");
        styleElem.dataset.tpStyle = id;
        styleElem.textContent = css;
        doc.head.appendChild(styleElem);
      }
      class Pane2 extends RootApi {
        constructor(opt_config) {
          var _a;
          const config2 = opt_config || {};
          const doc = (_a = config2.document) !== null && _a !== void 0 ? _a : getWindowDocument();
          const pool = createDefaultPluginPool();
          const rootController = new RootController(doc, {
            expanded: config2.expanded,
            blade: createBlade(),
            props: ValueMap.fromObject({
              title: config2.title
            }),
            viewProps: ViewProps.create()
          });
          super(rootController, pool);
          this.pool_ = pool;
          this.containerElem_ = config2.container || createDefaultWrapperElement(doc);
          this.containerElem_.appendChild(this.element);
          this.doc_ = doc;
          this.usesDefaultWrapper_ = !config2.container;
          this.setUpDefaultPlugins_();
        }
        get document() {
          if (!this.doc_) {
            throw TpError.alreadyDisposed();
          }
          return this.doc_;
        }
        dispose() {
          const containerElem = this.containerElem_;
          if (!containerElem) {
            throw TpError.alreadyDisposed();
          }
          if (this.usesDefaultWrapper_) {
            const parentElem = containerElem.parentElement;
            if (parentElem) {
              parentElem.removeChild(containerElem);
            }
          }
          this.containerElem_ = null;
          this.doc_ = null;
          super.dispose();
        }
        registerPlugin(bundle) {
          const plugins = "plugin" in bundle ? [bundle.plugin] : "plugins" in bundle ? bundle.plugins : [];
          plugins.forEach((p) => {
            this.pool_.register(p);
            this.embedPluginStyle_(p);
          });
        }
        embedPluginStyle_(plugin) {
          if (plugin.css) {
            embedStyle(this.document, `plugin-${plugin.id}`, plugin.css);
          }
        }
        setUpDefaultPlugins_() {
          embedStyle(this.document, "default", '.tp-tbiv_b,.tp-coltxtv_ms,.tp-ckbv_i,.tp-rotv_b,.tp-fldv_b,.tp-mllv_i,.tp-sglv_i,.tp-grlv_g,.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw,.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-p2dv_b,.tp-btnv_b,.tp-lstv_s{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-p2dv_b:hover,.tp-btnv_b:hover,.tp-lstv_s:hover{background-color:var(--btn-bg-h)}.tp-p2dv_b:focus,.tp-btnv_b:focus,.tp-lstv_s:focus{background-color:var(--btn-bg-f)}.tp-p2dv_b:active,.tp-btnv_b:active,.tp-lstv_s:active{background-color:var(--btn-bg-a)}.tp-p2dv_b:disabled,.tp-btnv_b:disabled,.tp-lstv_s:disabled{opacity:.5}.tp-txtv_i,.tp-p2dpv_p,.tp-colswv_sw{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-txtv_i:hover,.tp-p2dpv_p:hover,.tp-colswv_sw:hover{background-color:var(--in-bg-h)}.tp-txtv_i:focus,.tp-p2dpv_p:focus,.tp-colswv_sw:focus{background-color:var(--in-bg-f)}.tp-txtv_i:active,.tp-p2dpv_p:active,.tp-colswv_sw:active{background-color:var(--in-bg-a)}.tp-txtv_i:disabled,.tp-p2dpv_p:disabled,.tp-colswv_sw:disabled{opacity:.5}.tp-mllv_i,.tp-sglv_i,.tp-grlv_g{background-color:var(--mo-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--mo-fg);height:var(--bld-us);scrollbar-color:currentColor transparent;scrollbar-width:thin;width:100%}.tp-mllv_i::-webkit-scrollbar,.tp-sglv_i::-webkit-scrollbar,.tp-grlv_g::-webkit-scrollbar{height:8px;width:8px}.tp-mllv_i::-webkit-scrollbar-corner,.tp-sglv_i::-webkit-scrollbar-corner,.tp-grlv_g::-webkit-scrollbar-corner{background-color:transparent}.tp-mllv_i::-webkit-scrollbar-thumb,.tp-sglv_i::-webkit-scrollbar-thumb,.tp-grlv_g::-webkit-scrollbar-thumb{background-clip:padding-box;background-color:currentColor;border:transparent solid 2px;border-radius:4px}.tp-rotv{--font-family: var(--tp-font-family, Roboto Mono, Source Code Pro, Menlo, Courier, monospace);--bs-br: var(--tp-base-border-radius, 6px);--cnt-h-p: var(--tp-container-horizontal-padding, 4px);--cnt-v-p: var(--tp-container-vertical-padding, 4px);--elm-br: var(--tp-element-border-radius, 2px);--bld-s: var(--tp-blade-spacing, 4px);--bld-us: var(--tp-blade-unit-size, 20px);--bs-bg: var(--tp-base-background-color, #28292e);--bs-sh: var(--tp-base-shadow-color, rgba(0, 0, 0, 0.2));--btn-bg: var(--tp-button-background-color, #adafb8);--btn-bg-a: var(--tp-button-background-color-active, #d6d7db);--btn-bg-f: var(--tp-button-background-color-focus, #c8cad0);--btn-bg-h: var(--tp-button-background-color-hover, #bbbcc4);--btn-fg: var(--tp-button-foreground-color, #28292e);--cnt-bg: var(--tp-container-background-color, rgba(187, 188, 196, 0.1));--cnt-bg-a: var(--tp-container-background-color-active, rgba(187, 188, 196, 0.25));--cnt-bg-f: var(--tp-container-background-color-focus, rgba(187, 188, 196, 0.2));--cnt-bg-h: var(--tp-container-background-color-hover, rgba(187, 188, 196, 0.15));--cnt-fg: var(--tp-container-foreground-color, #bbbcc4);--in-bg: var(--tp-input-background-color, rgba(187, 188, 196, 0.1));--in-bg-a: var(--tp-input-background-color-active, rgba(187, 188, 196, 0.25));--in-bg-f: var(--tp-input-background-color-focus, rgba(187, 188, 196, 0.2));--in-bg-h: var(--tp-input-background-color-hover, rgba(187, 188, 196, 0.15));--in-fg: var(--tp-input-foreground-color, #bbbcc4);--lbl-fg: var(--tp-label-foreground-color, rgba(187, 188, 196, 0.7));--mo-bg: var(--tp-monitor-background-color, rgba(0, 0, 0, 0.2));--mo-fg: var(--tp-monitor-foreground-color, rgba(187, 188, 196, 0.7));--grv-fg: var(--tp-groove-foreground-color, rgba(187, 188, 196, 0.1))}.tp-rotv_c>.tp-cntv.tp-v-lst,.tp-tabv_c .tp-brkv>.tp-cntv.tp-v-lst,.tp-fldv_c>.tp-cntv.tp-v-lst{margin-bottom:calc(-1*var(--cnt-v-p))}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-tabv_c .tp-brkv>.tp-fldv.tp-v-lst .tp-fldv_c,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_c{border-bottom-left-radius:0}.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-tabv_c .tp-brkv>.tp-fldv.tp-v-lst .tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_b{border-bottom-left-radius:0}.tp-rotv_c>*:not(.tp-v-fst),.tp-tabv_c .tp-brkv>*:not(.tp-v-fst),.tp-fldv_c>*:not(.tp-v-fst){margin-top:var(--bld-s)}.tp-rotv_c>.tp-sprv:not(.tp-v-fst),.tp-tabv_c .tp-brkv>.tp-sprv:not(.tp-v-fst),.tp-fldv_c>.tp-sprv:not(.tp-v-fst),.tp-rotv_c>.tp-cntv:not(.tp-v-fst),.tp-tabv_c .tp-brkv>.tp-cntv:not(.tp-v-fst),.tp-fldv_c>.tp-cntv:not(.tp-v-fst){margin-top:var(--cnt-v-p)}.tp-rotv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-tabv_c .tp-brkv>.tp-sprv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-sprv+*:not(.tp-v-hidden),.tp-rotv_c>.tp-cntv+*:not(.tp-v-hidden),.tp-tabv_c .tp-brkv>.tp-cntv+*:not(.tp-v-hidden),.tp-fldv_c>.tp-cntv+*:not(.tp-v-hidden){margin-top:var(--cnt-v-p)}.tp-rotv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-tabv_c .tp-brkv>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-fldv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,.tp-rotv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-tabv_c .tp-brkv>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,.tp-fldv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv{margin-top:0}.tp-tabv_c .tp-brkv>.tp-cntv,.tp-fldv_c>.tp-cntv{margin-left:4px}.tp-tabv_c .tp-brkv>.tp-fldv>.tp-fldv_b,.tp-fldv_c>.tp-fldv>.tp-fldv_b{border-top-left-radius:var(--elm-br);border-bottom-left-radius:var(--elm-br)}.tp-tabv_c .tp-brkv>.tp-fldv.tp-fldv-expanded>.tp-fldv_b,.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b{border-bottom-left-radius:0}.tp-tabv_c .tp-brkv .tp-fldv>.tp-fldv_c,.tp-fldv_c .tp-fldv>.tp-fldv_c{border-bottom-left-radius:var(--elm-br)}.tp-tabv_c .tp-brkv>.tp-tabv>.tp-tabv_i,.tp-fldv_c>.tp-tabv>.tp-tabv_i{border-top-left-radius:var(--elm-br)}.tp-tabv_c .tp-brkv .tp-tabv>.tp-tabv_c,.tp-fldv_c .tp-tabv>.tp-tabv_c{border-bottom-left-radius:var(--elm-br)}.tp-rotv_b,.tp-fldv_b{background-color:var(--cnt-bg);color:var(--cnt-fg);cursor:pointer;display:block;height:calc(var(--bld-us) + 4px);line-height:calc(var(--bld-us) + 4px);overflow:hidden;padding-left:var(--cnt-h-p);padding-right:calc(4px + var(--bld-us) + var(--cnt-h-p));position:relative;text-align:left;text-overflow:ellipsis;white-space:nowrap;width:100%;transition:border-radius .2s ease-in-out .2s}.tp-rotv_b:hover,.tp-fldv_b:hover{background-color:var(--cnt-bg-h)}.tp-rotv_b:focus,.tp-fldv_b:focus{background-color:var(--cnt-bg-f)}.tp-rotv_b:active,.tp-fldv_b:active{background-color:var(--cnt-bg-a)}.tp-rotv_b:disabled,.tp-fldv_b:disabled{opacity:.5}.tp-rotv_m,.tp-fldv_m{background:linear-gradient(to left, var(--cnt-fg), var(--cnt-fg) 2px, transparent 2px, transparent 4px, var(--cnt-fg) 4px);border-radius:2px;bottom:0;content:"";display:block;height:6px;right:calc(var(--cnt-h-p) + (var(--bld-us) + 4px - 6px)/2 - 2px);margin:auto;opacity:.5;position:absolute;top:0;transform:rotate(90deg);transition:transform .2s ease-in-out;width:6px}.tp-rotv.tp-rotv-expanded .tp-rotv_m,.tp-fldv.tp-fldv-expanded>.tp-fldv_b>.tp-fldv_m{transform:none}.tp-rotv_c,.tp-fldv_c{box-sizing:border-box;height:0;opacity:0;overflow:hidden;padding-bottom:0;padding-top:0;position:relative;transition:height .2s ease-in-out,opacity .2s linear,padding .2s ease-in-out}.tp-rotv.tp-rotv-cpl:not(.tp-rotv-expanded) .tp-rotv_c,.tp-fldv.tp-fldv-cpl:not(.tp-fldv-expanded)>.tp-fldv_c{display:none}.tp-rotv.tp-rotv-expanded .tp-rotv_c,.tp-fldv.tp-fldv-expanded>.tp-fldv_c{opacity:1;padding-bottom:var(--cnt-v-p);padding-top:var(--cnt-v-p);transform:none;overflow:visible;transition:height .2s ease-in-out,opacity .2s linear .2s,padding .2s ease-in-out}.tp-lstv,.tp-coltxtv_m{position:relative}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m,.tp-coltxtv_mm{bottom:0;margin:auto;pointer-events:none;position:absolute;right:2px;top:0}.tp-lstv_m svg,.tp-coltxtv_mm svg{bottom:0;height:16px;margin:auto;position:absolute;right:0;top:0;width:16px}.tp-lstv_m svg path,.tp-coltxtv_mm svg path{fill:currentColor}.tp-pndtxtv,.tp-coltxtv_w{display:flex}.tp-pndtxtv_a,.tp-coltxtv_c{width:100%}.tp-pndtxtv_a+.tp-pndtxtv_a,.tp-coltxtv_c+.tp-pndtxtv_a,.tp-pndtxtv_a+.tp-coltxtv_c,.tp-coltxtv_c+.tp-coltxtv_c{margin-left:2px}.tp-btnv_b{width:100%}.tp-btnv_t{text-align:center}.tp-ckbv_l{display:block;position:relative}.tp-ckbv_i{left:0;opacity:0;position:absolute;top:0}.tp-ckbv_w{background-color:var(--in-bg);border-radius:var(--elm-br);cursor:pointer;display:block;height:var(--bld-us);position:relative;width:var(--bld-us)}.tp-ckbv_w svg{bottom:0;display:block;height:16px;left:0;margin:auto;opacity:0;position:absolute;right:0;top:0;width:16px}.tp-ckbv_w svg path{fill:none;stroke:var(--in-fg);stroke-width:2}.tp-ckbv_i:hover+.tp-ckbv_w{background-color:var(--in-bg-h)}.tp-ckbv_i:focus+.tp-ckbv_w{background-color:var(--in-bg-f)}.tp-ckbv_i:active+.tp-ckbv_w{background-color:var(--in-bg-a)}.tp-ckbv_i:checked+.tp-ckbv_w svg{opacity:1}.tp-ckbv.tp-v-disabled .tp-ckbv_w{opacity:.5}.tp-colv{position:relative}.tp-colv_h{display:flex}.tp-colv_s{flex-grow:0;flex-shrink:0;width:var(--bld-us)}.tp-colv_t{flex:1;margin-left:4px}.tp-colv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-colv.tp-colv-cpl .tp-colv_p{overflow:visible}.tp-colv.tp-colv-expanded .tp-colv_p{margin-top:var(--bld-s);opacity:1}.tp-colv .tp-popv{left:calc(-1*var(--cnt-h-p));right:calc(-1*var(--cnt-h-p));top:var(--bld-us)}.tp-colpv_h,.tp-colpv_ap{margin-left:6px;margin-right:6px}.tp-colpv_h{margin-top:var(--bld-s)}.tp-colpv_rgb{display:flex;margin-top:var(--bld-s);width:100%}.tp-colpv_a{display:flex;margin-top:var(--cnt-v-p);padding-top:calc(var(--cnt-v-p) + 2px);position:relative}.tp-colpv_a:before{background-color:var(--grv-fg);content:"";height:2px;left:calc(-1*var(--cnt-h-p));position:absolute;right:calc(-1*var(--cnt-h-p));top:0}.tp-colpv_ap{align-items:center;display:flex;flex:3}.tp-colpv_at{flex:1;margin-left:4px}.tp-svpv{border-radius:var(--elm-br);outline:none;overflow:hidden;position:relative}.tp-svpv_c{cursor:crosshair;display:block;height:calc(var(--bld-us)*4);width:100%}.tp-svpv_m{border-radius:100%;border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;filter:drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));height:12px;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;width:12px}.tp-svpv:focus .tp-svpv_m{border-color:#fff}.tp-hplv{cursor:pointer;height:var(--bld-us);outline:none;position:relative}.tp-hplv_c{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);background-position:left top;background-repeat:no-repeat;background-size:100% 100%;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;position:absolute;top:50%;width:100%}.tp-hplv_m{border-radius:var(--elm-br);border:rgba(255,255,255,.75) solid 2px;box-shadow:0 0 2px rgba(0,0,0,.1);box-sizing:border-box;height:12px;left:50%;margin-left:-6px;margin-top:-6px;pointer-events:none;position:absolute;top:50%;width:12px}.tp-hplv:focus .tp-hplv_m{border-color:#fff}.tp-aplv{cursor:pointer;height:var(--bld-us);outline:none;position:relative;width:100%}.tp-aplv_b{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:4px 4px;background-position:0 0,2px 2px;border-radius:2px;display:block;height:4px;left:0;margin-top:-2px;overflow:hidden;position:absolute;top:50%;width:100%}.tp-aplv_c{bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv_m{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:12px 12px;background-position:0 0,6px 6px;border-radius:var(--elm-br);box-shadow:0 0 2px rgba(0,0,0,.1);height:12px;left:50%;margin-left:-6px;margin-top:-6px;overflow:hidden;pointer-events:none;position:absolute;top:50%;width:12px}.tp-aplv_p{border-radius:var(--elm-br);border:rgba(255,255,255,.75) solid 2px;box-sizing:border-box;bottom:0;left:0;position:absolute;right:0;top:0}.tp-aplv:focus .tp-aplv_p{border-color:#fff}.tp-colswv{background-color:#fff;background-image:linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);background-size:10px 10px;background-position:0 0,5px 5px;border-radius:var(--elm-br);overflow:hidden}.tp-colswv.tp-v-disabled{opacity:.5}.tp-colswv_sw{border-radius:0}.tp-colswv_b{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;cursor:pointer;display:block;height:var(--bld-us);left:0;margin:0;outline:none;padding:0;position:absolute;top:0;width:var(--bld-us)}.tp-colswv_b:focus::after{border:rgba(255,255,255,.75) solid 2px;border-radius:var(--elm-br);bottom:0;content:"";display:block;left:0;position:absolute;right:0;top:0}.tp-coltxtv{display:flex;width:100%}.tp-coltxtv_m{margin-right:4px}.tp-coltxtv_ms{border-radius:var(--elm-br);color:var(--lbl-fg);cursor:pointer;height:var(--bld-us);line-height:var(--bld-us);padding:0 18px 0 4px}.tp-coltxtv_ms:hover{background-color:var(--in-bg-h)}.tp-coltxtv_ms:focus{background-color:var(--in-bg-f)}.tp-coltxtv_ms:active{background-color:var(--in-bg-a)}.tp-coltxtv_mm{color:var(--lbl-fg)}.tp-coltxtv_w{flex:1}.tp-dfwv{position:absolute;top:8px;right:8px;width:256px}.tp-fldv.tp-fldv-not .tp-fldv_b{display:none}.tp-fldv_t{padding-left:4px}.tp-fldv_c{border-left:var(--cnt-bg) solid 4px}.tp-fldv_b:hover+.tp-fldv_c{border-left-color:var(--cnt-bg-h)}.tp-fldv_b:focus+.tp-fldv_c{border-left-color:var(--cnt-bg-f)}.tp-fldv_b:active+.tp-fldv_c{border-left-color:var(--cnt-bg-a)}.tp-grlv{position:relative}.tp-grlv_g{display:block;height:calc(var(--bld-us)*3)}.tp-grlv_g polyline{fill:none;stroke:var(--mo-fg);stroke-linejoin:round}.tp-grlv_t{margin-top:-4px;transition:left .05s,top .05s;visibility:hidden}.tp-grlv_t.tp-grlv_t-a{visibility:visible}.tp-grlv_t.tp-grlv_t-in{transition:none}.tp-grlv.tp-v-disabled .tp-grlv_g{opacity:.5}.tp-grlv .tp-ttv{background-color:var(--mo-fg)}.tp-grlv .tp-ttv::before{border-top-color:var(--mo-fg)}.tp-lblv{align-items:center;display:flex;line-height:1.3;padding-left:var(--cnt-h-p);padding-right:var(--cnt-h-p)}.tp-lblv.tp-lblv-nol{display:block}.tp-lblv_l{color:var(--lbl-fg);flex:1;-webkit-hyphens:auto;-ms-hyphens:auto;hyphens:auto;overflow:hidden;padding-left:4px;padding-right:16px}.tp-lblv.tp-v-disabled .tp-lblv_l{opacity:.5}.tp-lblv.tp-lblv-nol .tp-lblv_l{display:none}.tp-lblv_v{align-self:flex-start;flex-grow:0;flex-shrink:0;width:160px}.tp-lblv.tp-lblv-nol .tp-lblv_v{width:100%}.tp-lstv_s{padding:0 20px 0 4px;width:100%}.tp-lstv_m{color:var(--btn-fg)}.tp-sglv_i{padding:0 4px}.tp-sglv.tp-v-disabled .tp-sglv_i{opacity:.5}.tp-mllv_i{display:block;height:calc(var(--bld-us)*3);line-height:var(--bld-us);padding:0 4px;resize:none;white-space:pre}.tp-mllv.tp-v-disabled .tp-mllv_i{opacity:.5}.tp-p2dv{position:relative}.tp-p2dv_h{display:flex}.tp-p2dv_b{height:var(--bld-us);margin-right:4px;position:relative;width:var(--bld-us)}.tp-p2dv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-p2dv_b svg path{stroke:currentColor;stroke-width:2}.tp-p2dv_b svg circle{fill:currentColor}.tp-p2dv_t{flex:1}.tp-p2dv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-p2dv.tp-p2dv-expanded .tp-p2dv_p{margin-top:var(--bld-s);opacity:1}.tp-p2dv .tp-popv{left:calc(-1*var(--cnt-h-p));right:calc(-1*var(--cnt-h-p));top:var(--bld-us)}.tp-p2dpv{padding-left:calc(var(--bld-us) + 4px)}.tp-p2dpv_p{cursor:crosshair;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-p2dpv_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-p2dpv_ax{opacity:.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_l{opacity:.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-p2dpv_m{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;position:absolute;width:4px}.tp-p2dpv_p:focus .tp-p2dpv_m{background-color:var(--in-fg);border-width:0}.tp-popv{background-color:var(--bs-bg);border-radius:6px;box-shadow:0 2px 4px var(--bs-sh);display:none;max-width:168px;padding:var(--cnt-v-p) var(--cnt-h-p);position:absolute;visibility:hidden;z-index:1000}.tp-popv.tp-popv-v{display:block;visibility:visible}.tp-sprv_r{background-color:var(--grv-fg);border-width:0;display:block;height:2px;margin:0;width:100%}.tp-sldv.tp-v-disabled{opacity:.5}.tp-sldv_t{box-sizing:border-box;cursor:pointer;height:var(--bld-us);margin:0 6px;outline:none;position:relative}.tp-sldv_t::before{background-color:var(--in-bg);border-radius:1px;bottom:0;content:"";display:block;height:2px;left:0;margin:auto;position:absolute;right:0;top:0}.tp-sldv_k{height:100%;left:0;position:absolute;top:0}.tp-sldv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:"";display:block;height:2px;left:0;margin-bottom:auto;margin-top:auto;position:absolute;right:0;top:0}.tp-sldv_k::after{background-color:var(--btn-bg);border-radius:var(--elm-br);bottom:0;content:"";display:block;height:12px;margin-bottom:auto;margin-top:auto;position:absolute;right:-6px;top:0;width:12px}.tp-sldv_t:hover .tp-sldv_k::after{background-color:var(--btn-bg-h)}.tp-sldv_t:focus .tp-sldv_k::after{background-color:var(--btn-bg-f)}.tp-sldv_t:active .tp-sldv_k::after{background-color:var(--btn-bg-a)}.tp-sldtxtv{display:flex}.tp-sldtxtv_s{flex:2}.tp-sldtxtv_t{flex:1;margin-left:4px}.tp-tabv.tp-v-disabled{opacity:.5}.tp-tabv_i{align-items:flex-end;display:flex;overflow:hidden}.tp-tabv.tp-tabv-nop .tp-tabv_i{height:calc(var(--bld-us) + 4px);position:relative}.tp-tabv.tp-tabv-nop .tp-tabv_i::before{background-color:var(--cnt-bg);bottom:0;content:"";height:2px;left:0;position:absolute;right:0}.tp-tabv_c{border-left:var(--cnt-bg) solid 4px;padding-bottom:var(--cnt-v-p);padding-top:var(--cnt-v-p)}.tp-tbiv{flex:1;min-width:0;position:relative}.tp-tbiv+.tp-tbiv{margin-left:2px}.tp-tbiv+.tp-tbiv::before{background-color:var(--cnt-bg);bottom:0;content:"";height:2px;left:-2px;position:absolute;width:2px}.tp-tbiv_b{background-color:var(--cnt-bg);display:block;padding-left:calc(var(--cnt-h-p) + 4px);padding-right:calc(var(--cnt-h-p) + 4px);width:100%}.tp-tbiv_b:hover{background-color:var(--cnt-bg-h)}.tp-tbiv_b:focus{background-color:var(--cnt-bg-f)}.tp-tbiv_b:active{background-color:var(--cnt-bg-a)}.tp-tbiv_b:disabled{opacity:.5}.tp-tbiv_t{color:var(--cnt-fg);height:calc(var(--bld-us) + 4px);line-height:calc(var(--bld-us) + 4px);opacity:.5;overflow:hidden;text-overflow:ellipsis}.tp-tbiv.tp-tbiv-sel .tp-tbiv_t{opacity:1}.tp-txtv{position:relative}.tp-txtv_i{padding:0 4px}.tp-txtv.tp-txtv-fst .tp-txtv_i{border-bottom-right-radius:0;border-top-right-radius:0}.tp-txtv.tp-txtv-mid .tp-txtv_i{border-radius:0}.tp-txtv.tp-txtv-lst .tp-txtv_i{border-bottom-left-radius:0;border-top-left-radius:0}.tp-txtv.tp-txtv-num .tp-txtv_i{text-align:right}.tp-txtv.tp-txtv-drg .tp-txtv_i{opacity:.3}.tp-txtv_k{cursor:pointer;height:100%;left:-3px;position:absolute;top:0;width:12px}.tp-txtv_k::before{background-color:var(--in-fg);border-radius:1px;bottom:0;content:"";height:calc(var(--bld-us) - 4px);left:50%;margin-bottom:auto;margin-left:-1px;margin-top:auto;opacity:.1;position:absolute;top:0;transition:border-radius .1s,height .1s,transform .1s,width .1s;width:2px}.tp-txtv_k:hover::before,.tp-txtv.tp-txtv-drg .tp-txtv_k::before{opacity:1}.tp-txtv.tp-txtv-drg .tp-txtv_k::before{border-radius:50%;height:4px;transform:translateX(-1px);width:4px}.tp-txtv_g{bottom:0;display:block;height:8px;left:50%;margin:auto;overflow:visible;pointer-events:none;position:absolute;top:0;visibility:hidden;width:100%}.tp-txtv.tp-txtv-drg .tp-txtv_g{visibility:visible}.tp-txtv_gb{fill:none;stroke:var(--in-fg);stroke-dasharray:1}.tp-txtv_gh{fill:none;stroke:var(--in-fg)}.tp-txtv .tp-ttv{margin-left:6px;visibility:hidden}.tp-txtv.tp-txtv-drg .tp-ttv{visibility:visible}.tp-ttv{background-color:var(--in-fg);border-radius:var(--elm-br);color:var(--bs-bg);padding:2px 4px;pointer-events:none;position:absolute;transform:translate(-50%, -100%)}.tp-ttv::before{border-color:var(--in-fg) transparent transparent transparent;border-style:solid;border-width:2px;box-sizing:border-box;content:"";font-size:.9em;height:4px;left:50%;margin-left:-2px;position:absolute;top:100%;width:4px}.tp-rotv{background-color:var(--bs-bg);border-radius:var(--bs-br);box-shadow:0 2px 4px var(--bs-sh);font-family:var(--font-family);font-size:11px;font-weight:500;line-height:1;text-align:left}.tp-rotv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br);border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br);padding-left:calc(4px + var(--bld-us) + var(--cnt-h-p));text-align:center}.tp-rotv.tp-rotv-expanded .tp-rotv_b{border-bottom-left-radius:0;border-bottom-right-radius:0}.tp-rotv.tp-rotv-not .tp-rotv_b{display:none}.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_c,.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_c{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c>.tp-fldv.tp-v-lst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-left-radius:var(--bs-br);border-bottom-right-radius:var(--bs-br)}.tp-rotv_c .tp-fldv.tp-v-vlst:not(.tp-fldv-expanded)>.tp-fldv_b{border-bottom-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst{margin-top:calc(-1*var(--cnt-v-p))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst>.tp-fldv_b{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst{margin-top:calc(-1*var(--cnt-v-p))}.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst>.tp-tabv_i{border-top-left-radius:var(--bs-br);border-top-right-radius:var(--bs-br)}.tp-rotv.tp-v-disabled,.tp-rotv .tp-v-disabled{pointer-events:none}.tp-rotv.tp-v-hidden,.tp-rotv .tp-v-hidden{display:none}');
          this.pool_.getAll().forEach((plugin) => {
            this.embedPluginStyle_(plugin);
          });
          this.registerPlugin({
            plugins: [
              SliderBladePlugin,
              ListBladePlugin,
              TabBladePlugin,
              TextBladePlugin
            ]
          });
        }
      }
      const VERSION = new Semver("3.0.8");
      exports2.BladeApi = BladeApi;
      exports2.ButtonApi = ButtonApi;
      exports2.FolderApi = FolderApi;
      exports2.InputBindingApi = InputBindingApi;
      exports2.ListApi = ListApi;
      exports2.MonitorBindingApi = MonitorBindingApi;
      exports2.Pane = Pane2;
      exports2.SeparatorApi = SeparatorApi;
      exports2.SliderApi = SliderApi;
      exports2.TabApi = TabApi;
      exports2.TabPageApi = TabPageApi;
      exports2.TextApi = TextApi;
      exports2.TpChangeEvent = TpChangeEvent;
      exports2.VERSION = VERSION;
      Object.defineProperty(exports2, "__esModule", {value: true});
    });
  });

  // node_modules/@tweakpane/plugin-essentials/dist/tweakpane-plugin-essentials.js
  var require_tweakpane_plugin_essentials = __commonJS((exports, module) => {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.TweakpaneEssentialsPlugin = {}));
    })(exports, function(exports2) {
      "use strict";
      class BladeApi {
        constructor(controller) {
          this.controller_ = controller;
        }
        get disabled() {
          return this.controller_.viewProps.get("disabled");
        }
        set disabled(disabled) {
          this.controller_.viewProps.set("disabled", disabled);
        }
        get hidden() {
          return this.controller_.viewProps.get("hidden");
        }
        set hidden(hidden) {
          this.controller_.viewProps.set("hidden", hidden);
        }
        dispose() {
          this.controller_.viewProps.set("disposed", true);
        }
      }
      class TpEvent {
        constructor(target) {
          this.target = target;
        }
      }
      class TpChangeEvent extends TpEvent {
        constructor(target, value, presetKey, last) {
          super(target);
          this.value = value;
          this.presetKey = presetKey;
          this.last = last !== null && last !== void 0 ? last : true;
        }
      }
      function forceCast(v) {
        return v;
      }
      function isEmpty(value) {
        return value === null || value === void 0;
      }
      const CREATE_MESSAGE_MAP = {
        alreadydisposed: () => "View has been already disposed",
        invalidparams: (context) => `Invalid parameters for '${context.name}'`,
        nomatchingcontroller: (context) => `No matching controller for '${context.key}'`,
        nomatchingview: (context) => `No matching view for '${JSON.stringify(context.params)}'`,
        notbindable: () => `Value is not bindable`,
        propertynotfound: (context) => `Property '${context.name}' not found`,
        shouldneverhappen: () => "This error should never happen"
      };
      class TpError {
        constructor(config2) {
          var _a;
          this.message = (_a = CREATE_MESSAGE_MAP[config2.type](forceCast(config2.context))) !== null && _a !== void 0 ? _a : "Unexpected error";
          this.name = this.constructor.name;
          this.stack = new Error(this.message).stack;
          this.type = config2.type;
        }
        static alreadyDisposed() {
          return new TpError({type: "alreadydisposed"});
        }
        static notBindable() {
          return new TpError({
            type: "notbindable"
          });
        }
        static propertyNotFound(name) {
          return new TpError({
            type: "propertynotfound",
            context: {
              name
            }
          });
        }
        static shouldNeverHappen() {
          return new TpError({type: "shouldneverhappen"});
        }
      }
      class Emitter {
        constructor() {
          this.observers_ = {};
        }
        on(eventName, handler) {
          let observers = this.observers_[eventName];
          if (!observers) {
            observers = this.observers_[eventName] = [];
          }
          observers.push({
            handler
          });
          return this;
        }
        off(eventName, handler) {
          const observers = this.observers_[eventName];
          if (observers) {
            this.observers_[eventName] = observers.filter((observer) => {
              return observer.handler !== handler;
            });
          }
          return this;
        }
        emit(eventName, event2) {
          const observers = this.observers_[eventName];
          if (!observers) {
            return;
          }
          observers.forEach((observer) => {
            observer.handler(event2);
          });
        }
      }
      const PREFIX = "tp";
      function ClassName(viewName) {
        const fn = (opt_elementName, opt_modifier) => {
          return [
            PREFIX,
            "-",
            viewName,
            "v",
            opt_elementName ? `_${opt_elementName}` : "",
            opt_modifier ? `-${opt_modifier}` : ""
          ].join("");
        };
        return fn;
      }
      function compose$1(h1, h2) {
        return (input) => h2(h1(input));
      }
      function extractValue(ev) {
        return ev.rawValue;
      }
      function bindValue(value, applyValue) {
        value.emitter.on("change", compose$1(extractValue, applyValue));
        applyValue(value.rawValue);
      }
      function bindValueMap(valueMap, key, applyValue) {
        bindValue(valueMap.value(key), applyValue);
      }
      function applyClass(elem, className2, active) {
        if (active) {
          elem.classList.add(className2);
        } else {
          elem.classList.remove(className2);
        }
      }
      function valueToClassName(elem, className2) {
        return (value) => {
          applyClass(elem, className2, value);
        };
      }
      function bindValueToTextContent(value, elem) {
        bindValue(value, (text) => {
          elem.textContent = text !== null && text !== void 0 ? text : "";
        });
      }
      const className$g = ClassName("btn");
      class ButtonView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$g());
          config2.viewProps.bindClassModifiers(this.element);
          const buttonElem = doc.createElement("button");
          buttonElem.classList.add(className$g("b"));
          config2.viewProps.bindDisabled(buttonElem);
          this.element.appendChild(buttonElem);
          this.buttonElement = buttonElem;
          const titleElem = doc.createElement("div");
          titleElem.classList.add(className$g("t"));
          bindValueToTextContent(config2.props.value("title"), titleElem);
          this.buttonElement.appendChild(titleElem);
        }
      }
      class ButtonController {
        constructor(doc, config2) {
          this.emitter = new Emitter();
          this.onClick_ = this.onClick_.bind(this);
          this.props = config2.props;
          this.viewProps = config2.viewProps;
          this.view = new ButtonView(doc, {
            props: this.props,
            viewProps: this.viewProps
          });
          this.view.buttonElement.addEventListener("click", this.onClick_);
        }
        onClick_() {
          this.emitter.emit("click", {
            sender: this
          });
        }
      }
      class BoundValue {
        constructor(initialValue, config2) {
          var _a;
          this.constraint_ = config2 === null || config2 === void 0 ? void 0 : config2.constraint;
          this.equals_ = (_a = config2 === null || config2 === void 0 ? void 0 : config2.equals) !== null && _a !== void 0 ? _a : (v1, v2) => v1 === v2;
          this.emitter = new Emitter();
          this.rawValue_ = initialValue;
        }
        get constraint() {
          return this.constraint_;
        }
        get rawValue() {
          return this.rawValue_;
        }
        set rawValue(rawValue) {
          this.setRawValue(rawValue, {
            forceEmit: false,
            last: true
          });
        }
        setRawValue(rawValue, options) {
          const opts = options !== null && options !== void 0 ? options : {
            forceEmit: false,
            last: true
          };
          const constrainedValue = this.constraint_ ? this.constraint_.constrain(rawValue) : rawValue;
          const changed = !this.equals_(this.rawValue_, constrainedValue);
          if (!changed && !opts.forceEmit) {
            return;
          }
          this.emitter.emit("beforechange", {
            sender: this
          });
          this.rawValue_ = constrainedValue;
          this.emitter.emit("change", {
            options: opts,
            rawValue: constrainedValue,
            sender: this
          });
        }
      }
      class PrimitiveValue {
        constructor(initialValue) {
          this.emitter = new Emitter();
          this.value_ = initialValue;
        }
        get rawValue() {
          return this.value_;
        }
        set rawValue(value) {
          this.setRawValue(value, {
            forceEmit: false,
            last: true
          });
        }
        setRawValue(value, options) {
          const opts = options !== null && options !== void 0 ? options : {
            forceEmit: false,
            last: true
          };
          if (this.value_ === value && !opts.forceEmit) {
            return;
          }
          this.emitter.emit("beforechange", {
            sender: this
          });
          this.value_ = value;
          this.emitter.emit("change", {
            options: opts,
            rawValue: this.value_,
            sender: this
          });
        }
      }
      function createValue(initialValue, config2) {
        const constraint = config2 === null || config2 === void 0 ? void 0 : config2.constraint;
        const equals = config2 === null || config2 === void 0 ? void 0 : config2.equals;
        if (!constraint && !equals) {
          return new PrimitiveValue(initialValue);
        }
        return new BoundValue(initialValue, config2);
      }
      class ValueMap {
        constructor(valueMap) {
          this.emitter = new Emitter();
          this.valMap_ = valueMap;
          for (const key in this.valMap_) {
            const v = this.valMap_[key];
            v.emitter.on("change", () => {
              this.emitter.emit("change", {
                key,
                sender: this
              });
            });
          }
        }
        static createCore(initialValue) {
          const keys = Object.keys(initialValue);
          return keys.reduce((o, key) => {
            return Object.assign(o, {
              [key]: createValue(initialValue[key])
            });
          }, {});
        }
        static fromObject(initialValue) {
          const core = this.createCore(initialValue);
          return new ValueMap(core);
        }
        get(key) {
          return this.valMap_[key].rawValue;
        }
        set(key, value) {
          this.valMap_[key].rawValue = value;
        }
        value(key) {
          return this.valMap_[key];
        }
      }
      function parseObject(value, keyToParserMap) {
        const keys = Object.keys(keyToParserMap);
        const result = keys.reduce((tmp, key) => {
          if (tmp === void 0) {
            return void 0;
          }
          const parser = keyToParserMap[key];
          const result2 = parser(value[key]);
          return result2.succeeded ? Object.assign(Object.assign({}, tmp), {[key]: result2.value}) : void 0;
        }, {});
        return forceCast(result);
      }
      function parseArray(value, parseItem) {
        return value.reduce((tmp, item) => {
          if (tmp === void 0) {
            return void 0;
          }
          const result = parseItem(item);
          if (!result.succeeded || result.value === void 0) {
            return void 0;
          }
          return [...tmp, result.value];
        }, []);
      }
      function isObject(value) {
        if (value === null) {
          return false;
        }
        return typeof value === "object";
      }
      function createParamsParserBuilder(parse) {
        return (optional) => (v) => {
          if (!optional && v === void 0) {
            return {
              succeeded: false,
              value: void 0
            };
          }
          if (optional && v === void 0) {
            return {
              succeeded: true,
              value: void 0
            };
          }
          const result = parse(v);
          return result !== void 0 ? {
            succeeded: true,
            value: result
          } : {
            succeeded: false,
            value: void 0
          };
        };
      }
      function createParamsParserBuilders(optional) {
        return {
          custom: (parse) => createParamsParserBuilder(parse)(optional),
          boolean: createParamsParserBuilder((v) => typeof v === "boolean" ? v : void 0)(optional),
          number: createParamsParserBuilder((v) => typeof v === "number" ? v : void 0)(optional),
          string: createParamsParserBuilder((v) => typeof v === "string" ? v : void 0)(optional),
          function: createParamsParserBuilder((v) => typeof v === "function" ? v : void 0)(optional),
          constant: (value) => createParamsParserBuilder((v) => v === value ? value : void 0)(optional),
          raw: createParamsParserBuilder((v) => v)(optional),
          object: (keyToParserMap) => createParamsParserBuilder((v) => {
            if (!isObject(v)) {
              return void 0;
            }
            return parseObject(v, keyToParserMap);
          })(optional),
          array: (itemParser) => createParamsParserBuilder((v) => {
            if (!Array.isArray(v)) {
              return void 0;
            }
            return parseArray(v, itemParser);
          })(optional)
        };
      }
      const ParamsParsers = {
        optional: createParamsParserBuilders(true),
        required: createParamsParserBuilders(false)
      };
      function parseParams(value, keyToParserMap) {
        const result = ParamsParsers.required.object(keyToParserMap)(value);
        return result.succeeded ? result.value : void 0;
      }
      function disposeElement(elem) {
        if (elem && elem.parentElement) {
          elem.parentElement.removeChild(elem);
        }
        return null;
      }
      function getAllBladePositions() {
        return ["veryfirst", "first", "last", "verylast"];
      }
      const className$f = ClassName("");
      const POS_TO_CLASS_NAME_MAP = {
        veryfirst: "vfst",
        first: "fst",
        last: "lst",
        verylast: "vlst"
      };
      class BladeController {
        constructor(config2) {
          this.parent_ = null;
          this.blade = config2.blade;
          this.view = config2.view;
          this.viewProps = config2.viewProps;
          const elem = this.view.element;
          this.blade.value("positions").emitter.on("change", () => {
            getAllBladePositions().forEach((pos) => {
              elem.classList.remove(className$f(void 0, POS_TO_CLASS_NAME_MAP[pos]));
            });
            this.blade.get("positions").forEach((pos) => {
              elem.classList.add(className$f(void 0, POS_TO_CLASS_NAME_MAP[pos]));
            });
          });
          this.viewProps.handleDispose(() => {
            disposeElement(elem);
          });
        }
        get parent() {
          return this.parent_;
        }
      }
      const SVG_NS = "http://www.w3.org/2000/svg";
      function forceReflow(element) {
        element.offsetHeight;
      }
      function disableTransitionTemporarily(element, callback) {
        const t = element.style.transition;
        element.style.transition = "none";
        callback();
        element.style.transition = t;
      }
      function supportsTouch(doc) {
        return doc.ontouchstart !== void 0;
      }
      function removeChildNodes(element) {
        while (element.childNodes.length > 0) {
          element.removeChild(element.childNodes[0]);
        }
      }
      function findNextTarget(ev) {
        if (ev.relatedTarget) {
          return forceCast(ev.relatedTarget);
        }
        if ("explicitOriginalTarget" in ev) {
          return ev.explicitOriginalTarget;
        }
        return null;
      }
      const className$e = ClassName("lbl");
      function createLabelNode(doc, label) {
        const frag = doc.createDocumentFragment();
        const lineNodes = label.split("\n").map((line) => {
          return doc.createTextNode(line);
        });
        lineNodes.forEach((lineNode, index) => {
          if (index > 0) {
            frag.appendChild(doc.createElement("br"));
          }
          frag.appendChild(lineNode);
        });
        return frag;
      }
      class LabelView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$e());
          config2.viewProps.bindClassModifiers(this.element);
          const labelElem = doc.createElement("div");
          labelElem.classList.add(className$e("l"));
          bindValueMap(config2.props, "label", (value) => {
            if (isEmpty(value)) {
              this.element.classList.add(className$e(void 0, "nol"));
            } else {
              this.element.classList.remove(className$e(void 0, "nol"));
              removeChildNodes(labelElem);
              labelElem.appendChild(createLabelNode(doc, value));
            }
          });
          this.element.appendChild(labelElem);
          this.labelElement = labelElem;
          const valueElem = doc.createElement("div");
          valueElem.classList.add(className$e("v"));
          this.element.appendChild(valueElem);
          this.valueElement = valueElem;
        }
      }
      class LabelController extends BladeController {
        constructor(doc, config2) {
          const viewProps = config2.valueController.viewProps;
          super(Object.assign(Object.assign({}, config2), {view: new LabelView(doc, {
            props: config2.props,
            viewProps
          }), viewProps}));
          this.props = config2.props;
          this.valueController = config2.valueController;
          this.view.valueElement.appendChild(this.valueController.view.element);
        }
      }
      class ValueBladeController extends BladeController {
        constructor(config2) {
          super(config2);
          this.value = config2.value;
        }
      }
      class Foldable extends ValueMap {
        constructor(valueMap) {
          super(valueMap);
        }
        static create(expanded) {
          const coreObj = {
            completed: true,
            expanded,
            expandedHeight: null,
            shouldFixHeight: false,
            temporaryExpanded: null
          };
          const core = ValueMap.createCore(coreObj);
          return new Foldable(core);
        }
        get styleExpanded() {
          var _a;
          return (_a = this.get("temporaryExpanded")) !== null && _a !== void 0 ? _a : this.get("expanded");
        }
        get styleHeight() {
          if (!this.styleExpanded) {
            return "0";
          }
          const exHeight = this.get("expandedHeight");
          if (this.get("shouldFixHeight") && !isEmpty(exHeight)) {
            return `${exHeight}px`;
          }
          return "auto";
        }
        bindExpandedClass(elem, expandedClassName) {
          bindValueMap(this, "expanded", () => {
            const expanded = this.styleExpanded;
            if (expanded) {
              elem.classList.add(expandedClassName);
            } else {
              elem.classList.remove(expandedClassName);
            }
          });
        }
      }
      function createFoldable(expanded) {
        return Foldable.create(expanded);
      }
      function computeExpandedFolderHeight(folder, containerElement) {
        let height = 0;
        disableTransitionTemporarily(containerElement, () => {
          folder.set("expandedHeight", null);
          folder.set("temporaryExpanded", true);
          forceReflow(containerElement);
          height = containerElement.clientHeight;
          folder.set("temporaryExpanded", null);
          forceReflow(containerElement);
        });
        return height;
      }
      function applyHeight(foldable, elem) {
        elem.style.height = foldable.styleHeight;
      }
      function bindFoldable(foldable, elem) {
        foldable.value("expanded").emitter.on("beforechange", () => {
          foldable.set("completed", false);
          if (isEmpty(foldable.get("expandedHeight"))) {
            foldable.set("expandedHeight", computeExpandedFolderHeight(foldable, elem));
          }
          foldable.set("shouldFixHeight", true);
          forceReflow(elem);
        });
        foldable.emitter.on("change", () => {
          applyHeight(foldable, elem);
        });
        applyHeight(foldable, elem);
        elem.addEventListener("transitionend", (ev) => {
          if (ev.propertyName !== "height") {
            return;
          }
          foldable.set("shouldFixHeight", false);
          foldable.set("expandedHeight", null);
          foldable.set("completed", true);
        });
      }
      class PlainView {
        constructor(doc, config2) {
          const className2 = ClassName(config2.viewName);
          this.element = doc.createElement("div");
          this.element.classList.add(className2());
          config2.viewProps.bindClassModifiers(this.element);
        }
      }
      class LabeledValueController extends ValueBladeController {
        constructor(doc, config2) {
          const viewProps = config2.valueController.viewProps;
          super(Object.assign(Object.assign({}, config2), {value: config2.valueController.value, view: new LabelView(doc, {
            props: config2.props,
            viewProps
          }), viewProps}));
          this.props = config2.props;
          this.valueController = config2.valueController;
          this.view.valueElement.appendChild(this.valueController.view.element);
        }
      }
      const className$d = ClassName("");
      function valueToModifier(elem, modifier) {
        return valueToClassName(elem, className$d(void 0, modifier));
      }
      class ViewProps extends ValueMap {
        constructor(valueMap) {
          super(valueMap);
        }
        static create(opt_initialValue) {
          var _a, _b;
          const initialValue = opt_initialValue !== null && opt_initialValue !== void 0 ? opt_initialValue : {};
          const coreObj = {
            disabled: (_a = initialValue.disabled) !== null && _a !== void 0 ? _a : false,
            disposed: false,
            hidden: (_b = initialValue.hidden) !== null && _b !== void 0 ? _b : false
          };
          const core = ValueMap.createCore(coreObj);
          return new ViewProps(core);
        }
        bindClassModifiers(elem) {
          bindValueMap(this, "disabled", valueToModifier(elem, "disabled"));
          bindValueMap(this, "hidden", valueToModifier(elem, "hidden"));
        }
        bindDisabled(target) {
          bindValueMap(this, "disabled", (disabled) => {
            target.disabled = disabled;
          });
        }
        bindTabIndex(elem) {
          bindValueMap(this, "disabled", (disabled) => {
            elem.tabIndex = disabled ? -1 : 0;
          });
        }
        handleDispose(callback) {
          this.value("disposed").emitter.on("change", (disposed) => {
            if (disposed) {
              callback();
            }
          });
        }
      }
      class ManualTicker {
        constructor() {
          this.disabled = false;
          this.emitter = new Emitter();
        }
        dispose() {
        }
        tick() {
          if (this.disabled) {
            return;
          }
          this.emitter.emit("tick", {
            sender: this
          });
        }
      }
      class IntervalTicker {
        constructor(doc, interval) {
          this.disabled_ = false;
          this.timerId_ = null;
          this.onTick_ = this.onTick_.bind(this);
          this.doc_ = doc;
          this.emitter = new Emitter();
          this.interval_ = interval;
          this.setTimer_();
        }
        get disabled() {
          return this.disabled_;
        }
        set disabled(inactive) {
          this.disabled_ = inactive;
          if (this.disabled_) {
            this.clearTimer_();
          } else {
            this.setTimer_();
          }
        }
        dispose() {
          this.clearTimer_();
        }
        clearTimer_() {
          if (this.timerId_ === null) {
            return;
          }
          const win = this.doc_.defaultView;
          if (win) {
            win.clearInterval(this.timerId_);
          }
          this.timerId_ = null;
        }
        setTimer_() {
          this.clearTimer_();
          if (this.interval_ <= 0) {
            return;
          }
          const win = this.doc_.defaultView;
          if (win) {
            this.timerId_ = win.setInterval(this.onTick_, this.interval_);
          }
        }
        onTick_() {
          if (this.disabled_) {
            return;
          }
          this.emitter.emit("tick", {
            sender: this
          });
        }
      }
      class CompositeConstraint {
        constructor(constraints) {
          this.constraints = constraints;
        }
        constrain(value) {
          return this.constraints.reduce((result, c) => {
            return c.constrain(result);
          }, value);
        }
      }
      function findConstraint(c, constraintClass) {
        if (c instanceof constraintClass) {
          return c;
        }
        if (c instanceof CompositeConstraint) {
          const result = c.constraints.reduce((tmpResult, sc) => {
            if (tmpResult) {
              return tmpResult;
            }
            return sc instanceof constraintClass ? sc : null;
          }, null);
          if (result) {
            return result;
          }
        }
        return null;
      }
      class RangeConstraint {
        constructor(config2) {
          this.maxValue = config2.max;
          this.minValue = config2.min;
        }
        constrain(value) {
          let result = value;
          if (!isEmpty(this.minValue)) {
            result = Math.max(result, this.minValue);
          }
          if (!isEmpty(this.maxValue)) {
            result = Math.min(result, this.maxValue);
          }
          return result;
        }
      }
      class StepConstraint {
        constructor(step) {
          this.step = step;
        }
        constrain(value) {
          const r = value < 0 ? -Math.round(-value / this.step) : Math.round(value / this.step);
          return r * this.step;
        }
      }
      const className$c = ClassName("pop");
      class PopupView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$c());
          config2.viewProps.bindClassModifiers(this.element);
          bindValue(config2.shows, valueToClassName(this.element, className$c(void 0, "v")));
        }
      }
      class PopupController {
        constructor(doc, config2) {
          this.shows = createValue(false);
          this.viewProps = config2.viewProps;
          this.view = new PopupView(doc, {
            shows: this.shows,
            viewProps: this.viewProps
          });
        }
      }
      const className$b = ClassName("txt");
      class TextView {
        constructor(doc, config2) {
          this.onChange_ = this.onChange_.bind(this);
          this.element = doc.createElement("div");
          this.element.classList.add(className$b());
          config2.viewProps.bindClassModifiers(this.element);
          this.props_ = config2.props;
          this.props_.emitter.on("change", this.onChange_);
          const inputElem = doc.createElement("input");
          inputElem.classList.add(className$b("i"));
          inputElem.type = "text";
          config2.viewProps.bindDisabled(inputElem);
          this.element.appendChild(inputElem);
          this.inputElement = inputElem;
          config2.value.emitter.on("change", this.onChange_);
          this.value_ = config2.value;
          this.refresh();
        }
        refresh() {
          const formatter = this.props_.get("formatter");
          this.inputElement.value = formatter(this.value_.rawValue);
        }
        onChange_() {
          this.refresh();
        }
      }
      class TextController {
        constructor(doc, config2) {
          this.onInputChange_ = this.onInputChange_.bind(this);
          this.parser_ = config2.parser;
          this.props = config2.props;
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new TextView(doc, {
            props: config2.props,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.inputElement.addEventListener("change", this.onInputChange_);
        }
        onInputChange_(e) {
          const inputElem = forceCast(e.currentTarget);
          const value = inputElem.value;
          const parsedValue = this.parser_(value);
          if (!isEmpty(parsedValue)) {
            this.value.rawValue = parsedValue;
          }
          this.view.refresh();
        }
      }
      class NumberLiteralNode {
        constructor(text) {
          this.text = text;
        }
        evaluate() {
          return Number(this.text);
        }
        toString() {
          return this.text;
        }
      }
      const BINARY_OPERATION_MAP = {
        "**": (v1, v2) => Math.pow(v1, v2),
        "*": (v1, v2) => v1 * v2,
        "/": (v1, v2) => v1 / v2,
        "%": (v1, v2) => v1 % v2,
        "+": (v1, v2) => v1 + v2,
        "-": (v1, v2) => v1 - v2,
        "<<": (v1, v2) => v1 << v2,
        ">>": (v1, v2) => v1 >> v2,
        ">>>": (v1, v2) => v1 >>> v2,
        "&": (v1, v2) => v1 & v2,
        "^": (v1, v2) => v1 ^ v2,
        "|": (v1, v2) => v1 | v2
      };
      class BinaryOperationNode {
        constructor(operator, left, right) {
          this.left = left;
          this.operator = operator;
          this.right = right;
        }
        evaluate() {
          const op = BINARY_OPERATION_MAP[this.operator];
          if (!op) {
            throw new Error(`unexpected binary operator: '${this.operator}`);
          }
          return op(this.left.evaluate(), this.right.evaluate());
        }
        toString() {
          return [
            "b(",
            this.left.toString(),
            this.operator,
            this.right.toString(),
            ")"
          ].join(" ");
        }
      }
      const UNARY_OPERATION_MAP = {
        "+": (v) => v,
        "-": (v) => -v,
        "~": (v) => ~v
      };
      class UnaryOperationNode {
        constructor(operator, expr) {
          this.operator = operator;
          this.expression = expr;
        }
        evaluate() {
          const op = UNARY_OPERATION_MAP[this.operator];
          if (!op) {
            throw new Error(`unexpected unary operator: '${this.operator}`);
          }
          return op(this.expression.evaluate());
        }
        toString() {
          return ["u(", this.operator, this.expression.toString(), ")"].join(" ");
        }
      }
      function combineReader(parsers) {
        return (text, cursor) => {
          for (let i = 0; i < parsers.length; i++) {
            const result = parsers[i](text, cursor);
            if (result !== "") {
              return result;
            }
          }
          return "";
        };
      }
      function readWhitespace(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^\s+/);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readNonZeroDigit(text, cursor) {
        const ch = text.substr(cursor, 1);
        return ch.match(/^[1-9]$/) ? ch : "";
      }
      function readDecimalDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-9]+/);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readSignedInteger(text, cursor) {
        const ds = readDecimalDigits(text, cursor);
        if (ds !== "") {
          return ds;
        }
        const sign = text.substr(cursor, 1);
        cursor += 1;
        if (sign !== "-" && sign !== "+") {
          return "";
        }
        const sds = readDecimalDigits(text, cursor);
        if (sds === "") {
          return "";
        }
        return sign + sds;
      }
      function readExponentPart(text, cursor) {
        const e = text.substr(cursor, 1);
        cursor += 1;
        if (e.toLowerCase() !== "e") {
          return "";
        }
        const si = readSignedInteger(text, cursor);
        if (si === "") {
          return "";
        }
        return e + si;
      }
      function readDecimalIntegerLiteral(text, cursor) {
        const ch = text.substr(cursor, 1);
        if (ch === "0") {
          return ch;
        }
        const nzd = readNonZeroDigit(text, cursor);
        cursor += nzd.length;
        if (nzd === "") {
          return "";
        }
        return nzd + readDecimalDigits(text, cursor);
      }
      function readDecimalLiteral1(text, cursor) {
        const dil = readDecimalIntegerLiteral(text, cursor);
        cursor += dil.length;
        if (dil === "") {
          return "";
        }
        const dot = text.substr(cursor, 1);
        cursor += dot.length;
        if (dot !== ".") {
          return "";
        }
        const dds = readDecimalDigits(text, cursor);
        cursor += dds.length;
        return dil + dot + dds + readExponentPart(text, cursor);
      }
      function readDecimalLiteral2(text, cursor) {
        const dot = text.substr(cursor, 1);
        cursor += dot.length;
        if (dot !== ".") {
          return "";
        }
        const dds = readDecimalDigits(text, cursor);
        cursor += dds.length;
        if (dds === "") {
          return "";
        }
        return dot + dds + readExponentPart(text, cursor);
      }
      function readDecimalLiteral3(text, cursor) {
        const dil = readDecimalIntegerLiteral(text, cursor);
        cursor += dil.length;
        if (dil === "") {
          return "";
        }
        return dil + readExponentPart(text, cursor);
      }
      const readDecimalLiteral = combineReader([
        readDecimalLiteral1,
        readDecimalLiteral2,
        readDecimalLiteral3
      ]);
      function parseBinaryDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[01]+/);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readBinaryIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== "0b") {
          return "";
        }
        const bds = parseBinaryDigits(text, cursor);
        if (bds === "") {
          return "";
        }
        return prefix + bds;
      }
      function readOctalDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-7]+/);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readOctalIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== "0o") {
          return "";
        }
        const ods = readOctalDigits(text, cursor);
        if (ods === "") {
          return "";
        }
        return prefix + ods;
      }
      function readHexDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-9a-f]+/i);
        return (_a = m && m[0]) !== null && _a !== void 0 ? _a : "";
      }
      function readHexIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== "0x") {
          return "";
        }
        const hds = readHexDigits(text, cursor);
        if (hds === "") {
          return "";
        }
        return prefix + hds;
      }
      const readNonDecimalIntegerLiteral = combineReader([
        readBinaryIntegerLiteral,
        readOctalIntegerLiteral,
        readHexIntegerLiteral
      ]);
      const readNumericLiteral = combineReader([
        readNonDecimalIntegerLiteral,
        readDecimalLiteral
      ]);
      function parseLiteral(text, cursor) {
        const num = readNumericLiteral(text, cursor);
        cursor += num.length;
        if (num === "") {
          return null;
        }
        return {
          evaluable: new NumberLiteralNode(num),
          cursor
        };
      }
      function parseParenthesizedExpression(text, cursor) {
        const op = text.substr(cursor, 1);
        cursor += op.length;
        if (op !== "(") {
          return null;
        }
        const expr = parseExpression(text, cursor);
        if (!expr) {
          return null;
        }
        cursor = expr.cursor;
        cursor += readWhitespace(text, cursor).length;
        const cl = text.substr(cursor, 1);
        cursor += cl.length;
        if (cl !== ")") {
          return null;
        }
        return {
          evaluable: expr.evaluable,
          cursor
        };
      }
      function parsePrimaryExpression(text, cursor) {
        return parseLiteral(text, cursor) || parseParenthesizedExpression(text, cursor);
      }
      function parseUnaryExpression(text, cursor) {
        const expr = parsePrimaryExpression(text, cursor);
        if (expr) {
          return expr;
        }
        const op = text.substr(cursor, 1);
        cursor += op.length;
        if (op !== "+" && op !== "-" && op !== "~") {
          return null;
        }
        const num = parseUnaryExpression(text, cursor);
        if (!num) {
          return null;
        }
        cursor = num.cursor;
        return {
          cursor,
          evaluable: new UnaryOperationNode(op, num.evaluable)
        };
      }
      function readBinaryOperator(ops, text, cursor) {
        cursor += readWhitespace(text, cursor).length;
        const op = ops.filter((op2) => text.startsWith(op2, cursor))[0];
        if (!op) {
          return null;
        }
        cursor += op.length;
        cursor += readWhitespace(text, cursor).length;
        return {
          cursor,
          operator: op
        };
      }
      function createBinaryOperationExpressionParser(exprParser, ops) {
        return (text, cursor) => {
          const firstExpr = exprParser(text, cursor);
          if (!firstExpr) {
            return null;
          }
          cursor = firstExpr.cursor;
          let expr = firstExpr.evaluable;
          for (; ; ) {
            const op = readBinaryOperator(ops, text, cursor);
            if (!op) {
              break;
            }
            cursor = op.cursor;
            const nextExpr = exprParser(text, cursor);
            if (!nextExpr) {
              return null;
            }
            cursor = nextExpr.cursor;
            expr = new BinaryOperationNode(op.operator, expr, nextExpr.evaluable);
          }
          return expr ? {
            cursor,
            evaluable: expr
          } : null;
        };
      }
      const parseBinaryOperationExpression = [
        ["**"],
        ["*", "/", "%"],
        ["+", "-"],
        ["<<", ">>>", ">>"],
        ["&"],
        ["^"],
        ["|"]
      ].reduce((parser, ops) => {
        return createBinaryOperationExpressionParser(parser, ops);
      }, parseUnaryExpression);
      function parseExpression(text, cursor) {
        cursor += readWhitespace(text, cursor).length;
        return parseBinaryOperationExpression(text, cursor);
      }
      function parseEcmaNumberExpression(text) {
        const expr = parseExpression(text, 0);
        if (!expr) {
          return null;
        }
        const cursor = expr.cursor + readWhitespace(text, expr.cursor).length;
        if (cursor !== text.length) {
          return null;
        }
        return expr.evaluable;
      }
      function parseNumber(text) {
        var _a;
        const r = parseEcmaNumberExpression(text);
        return (_a = r === null || r === void 0 ? void 0 : r.evaluate()) !== null && _a !== void 0 ? _a : null;
      }
      function numberFromUnknown(value) {
        if (typeof value === "number") {
          return value;
        }
        if (typeof value === "string") {
          const pv = parseNumber(value);
          if (!isEmpty(pv)) {
            return pv;
          }
        }
        return 0;
      }
      function createNumberFormatter(digits) {
        return (value) => {
          return value.toFixed(Math.max(Math.min(digits, 20), 0));
        };
      }
      function fillBuffer(buffer, bufferSize) {
        while (buffer.length < bufferSize) {
          buffer.push(void 0);
        }
      }
      function initializeBuffer(bufferSize) {
        const buffer = [];
        fillBuffer(buffer, bufferSize);
        return createValue(buffer);
      }
      function createTrimmedBuffer(buffer) {
        const index = buffer.indexOf(void 0);
        return forceCast(index < 0 ? buffer : buffer.slice(0, index));
      }
      function createPushedBuffer(buffer, newValue) {
        const newBuffer = [...createTrimmedBuffer(buffer), newValue];
        if (newBuffer.length > buffer.length) {
          newBuffer.splice(0, newBuffer.length - buffer.length);
        } else {
          fillBuffer(newBuffer, buffer.length);
        }
        return newBuffer;
      }
      function connectValues({primary, secondary, forward, backward}) {
        let changing = false;
        function preventFeedback(callback) {
          if (changing) {
            return;
          }
          changing = true;
          callback();
          changing = false;
        }
        primary.emitter.on("change", (ev) => {
          preventFeedback(() => {
            secondary.setRawValue(forward(primary, secondary), ev.options);
          });
        });
        secondary.emitter.on("change", (ev) => {
          preventFeedback(() => {
            primary.setRawValue(backward(primary, secondary), ev.options);
          });
          preventFeedback(() => {
            secondary.setRawValue(forward(primary, secondary), ev.options);
          });
        });
        preventFeedback(() => {
          secondary.setRawValue(forward(primary, secondary), {
            forceEmit: false,
            last: true
          });
        });
      }
      function getStepForKey(baseStep, keys) {
        const step = baseStep * (keys.altKey ? 0.1 : 1) * (keys.shiftKey ? 10 : 1);
        if (keys.upKey) {
          return +step;
        } else if (keys.downKey) {
          return -step;
        }
        return 0;
      }
      function getVerticalStepKeys(ev) {
        return {
          altKey: ev.altKey,
          downKey: ev.key === "ArrowDown",
          shiftKey: ev.shiftKey,
          upKey: ev.key === "ArrowUp"
        };
      }
      function getHorizontalStepKeys(ev) {
        return {
          altKey: ev.altKey,
          downKey: ev.key === "ArrowLeft",
          shiftKey: ev.shiftKey,
          upKey: ev.key === "ArrowRight"
        };
      }
      function isVerticalArrowKey(key) {
        return key === "ArrowUp" || key === "ArrowDown";
      }
      function isArrowKey(key) {
        return isVerticalArrowKey(key) || key === "ArrowLeft" || key === "ArrowRight";
      }
      function computeOffset(ev, elem) {
        const win = elem.ownerDocument.defaultView;
        const rect = elem.getBoundingClientRect();
        return {
          x: ev.pageX - ((win && win.scrollX || 0) + rect.left),
          y: ev.pageY - ((win && win.scrollY || 0) + rect.top)
        };
      }
      class PointerHandler {
        constructor(element) {
          this.lastTouch_ = null;
          this.onDocumentMouseMove_ = this.onDocumentMouseMove_.bind(this);
          this.onDocumentMouseUp_ = this.onDocumentMouseUp_.bind(this);
          this.onMouseDown_ = this.onMouseDown_.bind(this);
          this.onTouchEnd_ = this.onTouchEnd_.bind(this);
          this.onTouchMove_ = this.onTouchMove_.bind(this);
          this.onTouchStart_ = this.onTouchStart_.bind(this);
          this.elem_ = element;
          this.emitter = new Emitter();
          element.addEventListener("touchstart", this.onTouchStart_);
          element.addEventListener("touchmove", this.onTouchMove_);
          element.addEventListener("touchend", this.onTouchEnd_);
          element.addEventListener("mousedown", this.onMouseDown_);
        }
        computePosition_(offset) {
          const rect = this.elem_.getBoundingClientRect();
          return {
            bounds: {
              width: rect.width,
              height: rect.height
            },
            point: offset ? {
              x: offset.x,
              y: offset.y
            } : null
          };
        }
        onMouseDown_(ev) {
          var _a;
          ev.preventDefault();
          (_a = ev.currentTarget) === null || _a === void 0 ? void 0 : _a.focus();
          const doc = this.elem_.ownerDocument;
          doc.addEventListener("mousemove", this.onDocumentMouseMove_);
          doc.addEventListener("mouseup", this.onDocumentMouseUp_);
          this.emitter.emit("down", {
            altKey: ev.altKey,
            data: this.computePosition_(computeOffset(ev, this.elem_)),
            sender: this,
            shiftKey: ev.shiftKey
          });
        }
        onDocumentMouseMove_(ev) {
          this.emitter.emit("move", {
            altKey: ev.altKey,
            data: this.computePosition_(computeOffset(ev, this.elem_)),
            sender: this,
            shiftKey: ev.shiftKey
          });
        }
        onDocumentMouseUp_(ev) {
          const doc = this.elem_.ownerDocument;
          doc.removeEventListener("mousemove", this.onDocumentMouseMove_);
          doc.removeEventListener("mouseup", this.onDocumentMouseUp_);
          this.emitter.emit("up", {
            altKey: ev.altKey,
            data: this.computePosition_(computeOffset(ev, this.elem_)),
            sender: this,
            shiftKey: ev.shiftKey
          });
        }
        onTouchStart_(ev) {
          ev.preventDefault();
          const touch = ev.targetTouches.item(0);
          const rect = this.elem_.getBoundingClientRect();
          this.emitter.emit("down", {
            altKey: ev.altKey,
            data: this.computePosition_(touch ? {
              x: touch.clientX - rect.left,
              y: touch.clientY - rect.top
            } : void 0),
            sender: this,
            shiftKey: ev.shiftKey
          });
          this.lastTouch_ = touch;
        }
        onTouchMove_(ev) {
          const touch = ev.targetTouches.item(0);
          const rect = this.elem_.getBoundingClientRect();
          this.emitter.emit("move", {
            altKey: ev.altKey,
            data: this.computePosition_(touch ? {
              x: touch.clientX - rect.left,
              y: touch.clientY - rect.top
            } : void 0),
            sender: this,
            shiftKey: ev.shiftKey
          });
          this.lastTouch_ = touch;
        }
        onTouchEnd_(ev) {
          var _a;
          const touch = (_a = ev.targetTouches.item(0)) !== null && _a !== void 0 ? _a : this.lastTouch_;
          const rect = this.elem_.getBoundingClientRect();
          this.emitter.emit("up", {
            altKey: ev.altKey,
            data: this.computePosition_(touch ? {
              x: touch.clientX - rect.left,
              y: touch.clientY - rect.top
            } : void 0),
            sender: this,
            shiftKey: ev.shiftKey
          });
        }
      }
      function mapRange(value, start1, end1, start2, end2) {
        const p = (value - start1) / (end1 - start1);
        return start2 + p * (end2 - start2);
      }
      function getDecimalDigits(value) {
        const text = String(value.toFixed(10));
        const frac = text.split(".")[1];
        return frac.replace(/0+$/, "").length;
      }
      function constrainRange(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }
      const className$a = ClassName("txt");
      class NumberTextView {
        constructor(doc, config2) {
          this.onChange_ = this.onChange_.bind(this);
          this.props_ = config2.props;
          this.props_.emitter.on("change", this.onChange_);
          this.element = doc.createElement("div");
          this.element.classList.add(className$a(), className$a(void 0, "num"));
          if (config2.arrayPosition) {
            this.element.classList.add(className$a(void 0, config2.arrayPosition));
          }
          config2.viewProps.bindClassModifiers(this.element);
          const inputElem = doc.createElement("input");
          inputElem.classList.add(className$a("i"));
          inputElem.type = "text";
          config2.viewProps.bindDisabled(inputElem);
          this.element.appendChild(inputElem);
          this.inputElement = inputElem;
          this.onDraggingChange_ = this.onDraggingChange_.bind(this);
          this.dragging_ = config2.dragging;
          this.dragging_.emitter.on("change", this.onDraggingChange_);
          this.element.classList.add(className$a());
          this.inputElement.classList.add(className$a("i"));
          const knobElem = doc.createElement("div");
          knobElem.classList.add(className$a("k"));
          this.element.appendChild(knobElem);
          this.knobElement = knobElem;
          const guideElem = doc.createElementNS(SVG_NS, "svg");
          guideElem.classList.add(className$a("g"));
          this.knobElement.appendChild(guideElem);
          const bodyElem = doc.createElementNS(SVG_NS, "path");
          bodyElem.classList.add(className$a("gb"));
          guideElem.appendChild(bodyElem);
          this.guideBodyElem_ = bodyElem;
          const headElem = doc.createElementNS(SVG_NS, "path");
          headElem.classList.add(className$a("gh"));
          guideElem.appendChild(headElem);
          this.guideHeadElem_ = headElem;
          const tooltipElem = doc.createElement("div");
          tooltipElem.classList.add(ClassName("tt")());
          this.knobElement.appendChild(tooltipElem);
          this.tooltipElem_ = tooltipElem;
          config2.value.emitter.on("change", this.onChange_);
          this.value = config2.value;
          this.refresh();
        }
        onDraggingChange_(ev) {
          if (ev.rawValue === null) {
            this.element.classList.remove(className$a(void 0, "drg"));
            return;
          }
          this.element.classList.add(className$a(void 0, "drg"));
          const x = ev.rawValue / this.props_.get("draggingScale");
          const aox = x + (x > 0 ? -1 : x < 0 ? 1 : 0);
          const adx = constrainRange(-aox, -4, 4);
          this.guideHeadElem_.setAttributeNS(null, "d", [`M ${aox + adx},0 L${aox},4 L${aox + adx},8`, `M ${x},-1 L${x},9`].join(" "));
          this.guideBodyElem_.setAttributeNS(null, "d", `M 0,4 L${x},4`);
          const formatter = this.props_.get("formatter");
          this.tooltipElem_.textContent = formatter(this.value.rawValue);
          this.tooltipElem_.style.left = `${x}px`;
        }
        refresh() {
          const formatter = this.props_.get("formatter");
          this.inputElement.value = formatter(this.value.rawValue);
        }
        onChange_() {
          this.refresh();
        }
      }
      class NumberTextController {
        constructor(doc, config2) {
          this.originRawValue_ = 0;
          this.onInputChange_ = this.onInputChange_.bind(this);
          this.onInputKeyDown_ = this.onInputKeyDown_.bind(this);
          this.onInputKeyUp_ = this.onInputKeyUp_.bind(this);
          this.onPointerDown_ = this.onPointerDown_.bind(this);
          this.onPointerMove_ = this.onPointerMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.baseStep_ = config2.baseStep;
          this.parser_ = config2.parser;
          this.props = config2.props;
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.dragging_ = createValue(null);
          this.view = new NumberTextView(doc, {
            arrayPosition: config2.arrayPosition,
            dragging: this.dragging_,
            props: this.props,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.inputElement.addEventListener("change", this.onInputChange_);
          this.view.inputElement.addEventListener("keydown", this.onInputKeyDown_);
          this.view.inputElement.addEventListener("keyup", this.onInputKeyUp_);
          const ph = new PointerHandler(this.view.knobElement);
          ph.emitter.on("down", this.onPointerDown_);
          ph.emitter.on("move", this.onPointerMove_);
          ph.emitter.on("up", this.onPointerUp_);
        }
        onInputChange_(e) {
          const inputElem = forceCast(e.currentTarget);
          const value = inputElem.value;
          const parsedValue = this.parser_(value);
          if (!isEmpty(parsedValue)) {
            this.value.rawValue = parsedValue;
          }
          this.view.refresh();
        }
        onInputKeyDown_(ev) {
          const step = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
          if (step === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue + step, {
            forceEmit: false,
            last: false
          });
        }
        onInputKeyUp_(ev) {
          const step = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
          if (step === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue, {
            forceEmit: true,
            last: true
          });
        }
        onPointerDown_() {
          this.originRawValue_ = this.value.rawValue;
          this.dragging_.rawValue = 0;
        }
        computeDraggingValue_(data) {
          if (!data.point) {
            return null;
          }
          const dx = data.point.x - data.bounds.width / 2;
          return this.originRawValue_ + dx * this.props.get("draggingScale");
        }
        onPointerMove_(ev) {
          const v = this.computeDraggingValue_(ev.data);
          if (v === null) {
            return;
          }
          this.value.setRawValue(v, {
            forceEmit: false,
            last: false
          });
          this.dragging_.rawValue = this.value.rawValue - this.originRawValue_;
        }
        onPointerUp_(ev) {
          const v = this.computeDraggingValue_(ev.data);
          if (v === null) {
            return;
          }
          this.value.setRawValue(v, {
            forceEmit: true,
            last: true
          });
          this.dragging_.rawValue = null;
        }
      }
      function writePrimitive(target, value) {
        target.write(value);
      }
      function findStep(constraint) {
        const c = constraint ? findConstraint(constraint, StepConstraint) : null;
        if (!c) {
          return null;
        }
        return c.step;
      }
      function getSuitableDecimalDigits(constraint, rawValue) {
        const sc = constraint && findConstraint(constraint, StepConstraint);
        if (sc) {
          return getDecimalDigits(sc.step);
        }
        return Math.max(getDecimalDigits(rawValue), 2);
      }
      function getBaseStep(constraint) {
        const step = findStep(constraint);
        return step !== null && step !== void 0 ? step : 1;
      }
      function getSuitableDraggingScale(constraint, rawValue) {
        var _a;
        const sc = constraint && findConstraint(constraint, StepConstraint);
        const base = Math.abs((_a = sc === null || sc === void 0 ? void 0 : sc.step) !== null && _a !== void 0 ? _a : rawValue);
        return base === 0 ? 0.1 : Math.pow(10, Math.floor(Math.log10(base)) - 1);
      }
      class PointNdConstraint {
        constructor(config2) {
          this.components = config2.components;
          this.asm_ = config2.assembly;
        }
        constrain(value) {
          const comps = this.asm_.toComponents(value).map((comp, index) => {
            var _a, _b;
            return (_b = (_a = this.components[index]) === null || _a === void 0 ? void 0 : _a.constrain(comp)) !== null && _b !== void 0 ? _b : comp;
          });
          return this.asm_.fromComponents(comps);
        }
      }
      const className$9 = ClassName("pndtxt");
      class PointNdTextView {
        constructor(doc, config2) {
          this.textViews = config2.textViews;
          this.element = doc.createElement("div");
          this.element.classList.add(className$9());
          this.textViews.forEach((v) => {
            const axisElem = doc.createElement("div");
            axisElem.classList.add(className$9("a"));
            axisElem.appendChild(v.element);
            this.element.appendChild(axisElem);
          });
        }
      }
      function createAxisController(doc, config2, index) {
        return new NumberTextController(doc, {
          arrayPosition: index === 0 ? "fst" : index === config2.axes.length - 1 ? "lst" : "mid",
          baseStep: config2.axes[index].baseStep,
          parser: config2.parser,
          props: config2.axes[index].textProps,
          value: createValue(0, {
            constraint: config2.axes[index].constraint
          }),
          viewProps: config2.viewProps
        });
      }
      class PointNdTextController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.acs_ = config2.axes.map((_, index) => createAxisController(doc, config2, index));
          this.acs_.forEach((c, index) => {
            connectValues({
              primary: this.value,
              secondary: c.value,
              forward: (p) => {
                return config2.assembly.toComponents(p.rawValue)[index];
              },
              backward: (p, s) => {
                const comps = config2.assembly.toComponents(p.rawValue);
                comps[index] = s.rawValue;
                return config2.assembly.fromComponents(comps);
              }
            });
          });
          this.view = new PointNdTextView(doc, {
            textViews: this.acs_.map((ac) => ac.view)
          });
        }
      }
      function createStepConstraint(params) {
        if ("step" in params && !isEmpty(params.step)) {
          return new StepConstraint(params.step);
        }
        return null;
      }
      function createRangeConstraint(params) {
        if ("max" in params && !isEmpty(params.max) || "min" in params && !isEmpty(params.min)) {
          return new RangeConstraint({
            max: params.max,
            min: params.min
          });
        }
        return null;
      }
      const Constants = {
        monitor: {
          defaultInterval: 200,
          defaultLineCount: 3
        }
      };
      class GraphCursor {
        constructor() {
          this.emitter = new Emitter();
          this.index_ = -1;
        }
        get index() {
          return this.index_;
        }
        set index(index) {
          const changed = this.index_ !== index;
          if (changed) {
            this.index_ = index;
            this.emitter.emit("change", {
              index,
              sender: this
            });
          }
        }
      }
      const className$8 = ClassName("grl");
      class GraphLogView {
        constructor(doc, config2) {
          this.onCursorChange_ = this.onCursorChange_.bind(this);
          this.onValueUpdate_ = this.onValueUpdate_.bind(this);
          this.element = doc.createElement("div");
          this.element.classList.add(className$8());
          config2.viewProps.bindClassModifiers(this.element);
          this.formatter_ = config2.formatter;
          this.minValue_ = config2.minValue;
          this.maxValue_ = config2.maxValue;
          this.cursor_ = config2.cursor;
          this.cursor_.emitter.on("change", this.onCursorChange_);
          const svgElem = doc.createElementNS(SVG_NS, "svg");
          svgElem.classList.add(className$8("g"));
          svgElem.style.height = `calc(var(--bld-us) * ${config2.lineCount})`;
          this.element.appendChild(svgElem);
          this.svgElem_ = svgElem;
          const lineElem = doc.createElementNS(SVG_NS, "polyline");
          this.svgElem_.appendChild(lineElem);
          this.lineElem_ = lineElem;
          const tooltipElem = doc.createElement("div");
          tooltipElem.classList.add(className$8("t"), ClassName("tt")());
          this.element.appendChild(tooltipElem);
          this.tooltipElem_ = tooltipElem;
          config2.value.emitter.on("change", this.onValueUpdate_);
          this.value = config2.value;
          this.update_();
        }
        get graphElement() {
          return this.svgElem_;
        }
        update_() {
          const bounds = this.svgElem_.getBoundingClientRect();
          const maxIndex = this.value.rawValue.length - 1;
          const min = this.minValue_;
          const max = this.maxValue_;
          const points = [];
          this.value.rawValue.forEach((v, index) => {
            if (v === void 0) {
              return;
            }
            const x = mapRange(index, 0, maxIndex, 0, bounds.width);
            const y2 = mapRange(v, min, max, bounds.height, 0);
            points.push([x, y2].join(","));
          });
          this.lineElem_.setAttributeNS(null, "points", points.join(" "));
          const tooltipElem = this.tooltipElem_;
          const value = this.value.rawValue[this.cursor_.index];
          if (value === void 0) {
            tooltipElem.classList.remove(className$8("t", "a"));
            return;
          }
          const tx = mapRange(this.cursor_.index, 0, maxIndex, 0, bounds.width);
          const ty = mapRange(value, min, max, bounds.height, 0);
          tooltipElem.style.left = `${tx}px`;
          tooltipElem.style.top = `${ty}px`;
          tooltipElem.textContent = `${this.formatter_(value)}`;
          if (!tooltipElem.classList.contains(className$8("t", "a"))) {
            tooltipElem.classList.add(className$8("t", "a"), className$8("t", "in"));
            forceReflow(tooltipElem);
            tooltipElem.classList.remove(className$8("t", "in"));
          }
        }
        onValueUpdate_() {
          this.update_();
        }
        onCursorChange_() {
          this.update_();
        }
      }
      class GraphLogController {
        constructor(doc, config2) {
          this.onGraphMouseMove_ = this.onGraphMouseMove_.bind(this);
          this.onGraphMouseLeave_ = this.onGraphMouseLeave_.bind(this);
          this.onGraphPointerDown_ = this.onGraphPointerDown_.bind(this);
          this.onGraphPointerMove_ = this.onGraphPointerMove_.bind(this);
          this.onGraphPointerUp_ = this.onGraphPointerUp_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.cursor_ = new GraphCursor();
          this.view = new GraphLogView(doc, {
            cursor: this.cursor_,
            formatter: config2.formatter,
            lineCount: config2.lineCount,
            maxValue: config2.maxValue,
            minValue: config2.minValue,
            value: this.value,
            viewProps: this.viewProps
          });
          if (!supportsTouch(doc)) {
            this.view.element.addEventListener("mousemove", this.onGraphMouseMove_);
            this.view.element.addEventListener("mouseleave", this.onGraphMouseLeave_);
          } else {
            const ph = new PointerHandler(this.view.element);
            ph.emitter.on("down", this.onGraphPointerDown_);
            ph.emitter.on("move", this.onGraphPointerMove_);
            ph.emitter.on("up", this.onGraphPointerUp_);
          }
        }
        onGraphMouseLeave_() {
          this.cursor_.index = -1;
        }
        onGraphMouseMove_(ev) {
          const bounds = this.view.element.getBoundingClientRect();
          this.cursor_.index = Math.floor(mapRange(ev.offsetX, 0, bounds.width, 0, this.value.rawValue.length));
        }
        onGraphPointerDown_(ev) {
          this.onGraphPointerMove_(ev);
        }
        onGraphPointerMove_(ev) {
          if (!ev.data.point) {
            this.cursor_.index = -1;
            return;
          }
          this.cursor_.index = Math.floor(mapRange(ev.data.point.x, 0, ev.data.bounds.width, 0, this.value.rawValue.length));
        }
        onGraphPointerUp_() {
          this.cursor_.index = -1;
        }
      }
      class ButtonCellApi {
        constructor(controller) {
          this.controller_ = controller;
        }
        get disabled() {
          return this.controller_.viewProps.get("disabled");
        }
        set disabled(disabled) {
          this.controller_.viewProps.set("disabled", disabled);
        }
        get title() {
          var _a;
          return (_a = this.controller_.props.get("title")) !== null && _a !== void 0 ? _a : "";
        }
        set title(title) {
          this.controller_.props.set("title", title);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          const emitter = this.controller_.emitter;
          emitter.on(eventName, () => {
            bh(new TpEvent(this));
          });
          return this;
        }
      }
      class TpButtonGridEvent extends TpEvent {
        constructor(target, cell, index) {
          super(target);
          this.cell = cell;
          this.index = index;
        }
      }
      class ButtonGridApi extends BladeApi {
        constructor(controller) {
          super(controller);
          this.cellToApiMap_ = new Map();
          this.emitter_ = new Emitter();
          const gc = this.controller_.valueController;
          gc.cellControllers.forEach((cc, i) => {
            const api = new ButtonCellApi(cc);
            this.cellToApiMap_.set(cc, api);
            cc.emitter.on("click", () => {
              const x = i % gc.size[0];
              const y2 = Math.floor(i / gc.size[0]);
              this.emitter_.emit("click", {
                event: new TpButtonGridEvent(this, api, [x, y2])
              });
            });
          });
        }
        cell(x, y2) {
          const gc = this.controller_.valueController;
          const cc = gc.cellControllers[y2 * gc.size[0] + x];
          return this.cellToApiMap_.get(cc);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.emitter_.on(eventName, (ev) => {
            bh(ev.event);
          });
          return this;
        }
      }
      class ButtonGridController {
        constructor(doc, config2) {
          this.size = config2.size;
          const [w, h] = this.size;
          const bcs = [];
          for (let y2 = 0; y2 < h; y2++) {
            for (let x = 0; x < w; x++) {
              const bc = new ButtonController(doc, {
                props: ValueMap.fromObject(Object.assign({}, config2.cellConfig(x, y2))),
                viewProps: ViewProps.create()
              });
              bcs.push(bc);
            }
          }
          this.cellCs_ = bcs;
          this.viewProps = ViewProps.create();
          this.viewProps.handleDispose(() => {
            this.cellCs_.forEach((c) => {
              c.viewProps.set("disposed", true);
            });
          });
          this.view = new PlainView(doc, {
            viewProps: this.viewProps,
            viewName: "btngrid"
          });
          this.view.element.style.gridTemplateColumns = `repeat(${w}, 1fr)`;
          this.cellCs_.forEach((bc) => {
            this.view.element.appendChild(bc.view.element);
          });
        }
        get cellControllers() {
          return this.cellCs_;
        }
      }
      const ButtonGridBladePlugin = {
        id: "buttongrid",
        type: "blade",
        css: ".tp-cbzv_b,.tp-rslv_k,.tp-radv_b,.tp-cbzgv{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-cbzv_b,.tp-rslv_k,.tp-radv_b{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-cbzv_b:hover,.tp-rslv_k:hover,.tp-radv_b:hover{background-color:var(--btn-bg-h)}.tp-cbzv_b:focus,.tp-rslv_k:focus,.tp-radv_b:focus{background-color:var(--btn-bg-f)}.tp-cbzv_b:active,.tp-rslv_k:active,.tp-radv_b:active{background-color:var(--btn-bg-a)}.tp-cbzv_b:disabled,.tp-rslv_k:disabled,.tp-radv_b:disabled{opacity:0.5}.tp-cbzgv{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-cbzgv:hover{background-color:var(--in-bg-h)}.tp-cbzgv:focus{background-color:var(--in-bg-f)}.tp-cbzgv:active{background-color:var(--in-bg-a)}.tp-cbzgv:disabled{opacity:0.5}.tp-btngridv{border-radius:var(--elm-br);display:grid;overflow:hidden;gap:2px}.tp-btngridv.tp-v-disabled{opacity:0.5}.tp-btngridv .tp-btnv_b:disabled{opacity:1}.tp-btngridv .tp-btnv_b:disabled .tp-btnv_t{opacity:0.5}.tp-btngridv .tp-btnv_b{border-radius:0}.tp-cbzv{position:relative}.tp-cbzv_h{display:flex}.tp-cbzv_b{margin-right:4px;position:relative;width:var(--bld-us)}.tp-cbzv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-cbzv_b svg path{stroke:var(--bs-bg);stroke-width:2}.tp-cbzv_t{flex:1}.tp-cbzv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-cbzv.tp-cbzv-expanded .tp-cbzv_p{margin-top:var(--bld-s);opacity:1}.tp-cbzv.tp-cbzv-cpl .tp-cbzv_p{overflow:visible}.tp-cbzv .tp-popv{left:calc(-1 * var(--cnt-h-p));position:absolute;right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-cbzpv_t{margin-top:var(--bld-s)}.tp-cbzgv{height:auto;overflow:hidden;position:relative}.tp-cbzgv.tp-v-disabled{opacity:0.5}.tp-cbzgv_p{left:16px;position:absolute;right:16px;top:0}.tp-cbzgv_g{cursor:pointer;display:block;height:calc(var(--bld-us) * 5);width:100%}.tp-cbzgv_u{opacity:0.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-cbzgv_l{fill:transparent;stroke:var(--in-fg)}.tp-cbzgv_v{opacity:0.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-cbzgv_h{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;pointer-events:none;position:absolute;width:4px}.tp-cbzgv:focus .tp-cbzgv_h-sel{background-color:var(--in-fg);border-width:0}.tp-cbzprvv{cursor:pointer;height:4px;padding:4px 0;position:relative}.tp-cbzprvv_g{display:block;height:100%;overflow:visible;width:100%}.tp-cbzprvv_t{opacity:0.5;stroke:var(--mo-fg)}.tp-cbzprvv_m{background-color:var(--mo-fg);border-radius:50%;height:4px;margin-left:-2px;margin-top:-2px;opacity:0;position:absolute;top:50%;transition:opacity 0.2s ease-out;width:4px}.tp-cbzprvv_m.tp-cbzprvv_m-a{opacity:1}.tp-fpsv{position:relative}.tp-fpsv_l{bottom:4px;color:var(--mo-fg);line-height:1;right:4px;pointer-events:none;position:absolute}.tp-fpsv_u{margin-left:0.2em;opacity:0.7}.tp-rslv{cursor:pointer;padding-left:8px;padding-right:8px}.tp-rslv.tp-v-disabled{opacity:0.5}.tp-rslv_t{height:calc(var(--bld-us));position:relative}.tp-rslv_t::before{background-color:var(--in-bg);border-radius:1px;content:'';height:2px;margin-top:-1px;position:absolute;top:50%;left:-4px;right:-4px}.tp-rslv_b{bottom:0;top:0;position:absolute}.tp-rslv_b::before{background-color:var(--in-fg);content:'';height:2px;margin-top:-1px;position:absolute;top:50%;left:0;right:0}.tp-rslv_k{height:calc(var(--bld-us) - 8px);margin-top:calc((var(--bld-us) - 8px) / -2);position:absolute;top:50%;width:8px}.tp-rslv_k.tp-rslv_k-min{margin-left:-8px}.tp-rslv_k.tp-rslv_k-max{margin-left:0}.tp-rslv.tp-rslv-zero .tp-rslv_k.tp-rslv_k-min{border-bottom-right-radius:0;border-top-right-radius:0}.tp-rslv.tp-rslv-zero .tp-rslv_k.tp-rslv_k-max{border-bottom-left-radius:0;border-top-left-radius:0}.tp-rsltxtv{display:flex}.tp-rsltxtv_s{flex:1}.tp-rsltxtv_t{flex:1;margin-left:4px}.tp-radv_l{display:block;position:relative}.tp-radv_i{left:0;opacity:0;position:absolute;top:0}.tp-radv_b{opacity:0.5}.tp-radv_i:hover+.tp-radv_b{background-color:var(--btn-bg-h)}.tp-radv_i:focus+.tp-radv_b{background-color:var(--btn-bg-f)}.tp-radv_i:active+.tp-radv_b{background-color:var(--btn-bg-a)}.tp-radv_i:checked+.tp-radv_b{opacity:1}.tp-radv_t{bottom:0;color:inherit;left:0;overflow:hidden;position:absolute;right:0;text-align:center;text-overflow:ellipsis;top:0}.tp-radv_i:disabled+.tp-radv_b>.tp-radv_t{opacity:0.5}.tp-radgridv{border-radius:var(--elm-br);display:grid;overflow:hidden;gap:2px}.tp-radgridv.tp-v-disabled{opacity:0.5}.tp-radgridv .tp-radv_b{border-radius:0}",
        accept(params) {
          const p = ParamsParsers;
          const result = parseParams(params, {
            cells: p.required.function,
            size: p.required.array(p.required.number),
            view: p.required.constant("buttongrid"),
            label: p.optional.string
          });
          return result ? {params: result} : null;
        },
        controller(args) {
          return new LabelController(args.document, {
            blade: args.blade,
            props: ValueMap.fromObject({
              label: args.params.label
            }),
            valueController: new ButtonGridController(args.document, {
              cellConfig: args.params.cells,
              size: args.params.size
            })
          });
        },
        api(args) {
          if (!(args.controller instanceof LabelController)) {
            return null;
          }
          if (!(args.controller.valueController instanceof ButtonGridController)) {
            return null;
          }
          return new ButtonGridApi(args.controller);
        }
      };
      class CubicBezierApi extends BladeApi {
        get label() {
          return this.controller_.props.get("label");
        }
        set label(label) {
          this.controller_.props.set("label", label);
        }
        get value() {
          return this.controller_.valueController.value.rawValue;
        }
        set value(value) {
          this.controller_.valueController.value.rawValue = value;
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.controller_.valueController.value.emitter.on(eventName, (ev) => {
            bh(new TpChangeEvent(this, ev.rawValue, void 0, ev.options.last));
          });
          return this;
        }
      }
      function interpolate(x1, x2, t) {
        return x1 * (1 - t) + x2 * t;
      }
      const MAX_ITERATION = 20;
      const X_DELTA = 1e-3;
      const CACHE_RESOLUTION = 100;
      function y(cb, x) {
        let dt = 0.25;
        let t = 0.5;
        let y2 = -1;
        for (let i = 0; i < MAX_ITERATION; i++) {
          const [tx, ty] = cb.curve(t);
          t += dt * (tx < x ? 1 : -1);
          y2 = ty;
          dt *= 0.5;
          if (Math.abs(x - tx) < X_DELTA) {
            break;
          }
        }
        return y2;
      }
      class CubicBezier {
        constructor(x1 = 0, y1 = 0, x2 = 1, y2 = 1) {
          this.cache_ = [];
          this.comps_ = [x1, y1, x2, y2];
        }
        get x1() {
          return this.comps_[0];
        }
        get y1() {
          return this.comps_[1];
        }
        get x2() {
          return this.comps_[2];
        }
        get y2() {
          return this.comps_[3];
        }
        static isObject(obj) {
          if (isEmpty(obj)) {
            return false;
          }
          if (!Array.isArray(obj)) {
            return false;
          }
          return typeof obj[0] === "number" && typeof obj[1] === "number" && typeof obj[2] === "number" && typeof obj[3] === "number";
        }
        static equals(v1, v2) {
          return v1.x1 === v2.x1 && v1.y1 === v2.y1 && v1.x2 === v2.x2 && v1.y2 === v2.y2;
        }
        curve(t) {
          const x01 = interpolate(0, this.x1, t);
          const y01 = interpolate(0, this.y1, t);
          const x12 = interpolate(this.x1, this.x2, t);
          const y12 = interpolate(this.y1, this.y2, t);
          const x23 = interpolate(this.x2, 1, t);
          const y23 = interpolate(this.y2, 1, t);
          const xr0 = interpolate(x01, x12, t);
          const yr0 = interpolate(y01, y12, t);
          const xr1 = interpolate(x12, x23, t);
          const yr1 = interpolate(y12, y23, t);
          return [interpolate(xr0, xr1, t), interpolate(yr0, yr1, t)];
        }
        y(x) {
          if (this.cache_.length === 0) {
            const cache = [];
            for (let i = 0; i < CACHE_RESOLUTION; i++) {
              cache.push(y(this, mapRange(i, 0, CACHE_RESOLUTION - 1, 0, 1)));
            }
            this.cache_ = cache;
          }
          return this.cache_[Math.round(mapRange(constrainRange(x, 0, 1), 0, 1, 0, CACHE_RESOLUTION - 1))];
        }
        toObject() {
          return [this.comps_[0], this.comps_[1], this.comps_[2], this.comps_[3]];
        }
      }
      const CubicBezierAssembly = {
        toComponents: (p) => p.toObject(),
        fromComponents: (comps) => new CubicBezier(...comps)
      };
      function cubicBezierToString(cb) {
        const formatter = createNumberFormatter(2);
        const comps = cb.toObject().map((c) => formatter(c));
        return `cubic-bezier(${comps.join(", ")})`;
      }
      const COMPS_EMPTY = [0, 0.5, 0.5, 1];
      function cubicBezierFromString(text) {
        const m = text.match(/^cubic-bezier\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)$/);
        if (!m) {
          return new CubicBezier(...COMPS_EMPTY);
        }
        const comps = [m[1], m[2], m[3], m[4]].reduce((comps2, comp) => {
          if (!comps2) {
            return null;
          }
          const n = Number(comp);
          if (isNaN(n)) {
            return null;
          }
          return [...comps2, n];
        }, []);
        return new CubicBezier(...comps !== null && comps !== void 0 ? comps : COMPS_EMPTY);
      }
      const className$7 = ClassName("cbz");
      class CubicBezierView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$7());
          config2.viewProps.bindClassModifiers(this.element);
          config2.foldable.bindExpandedClass(this.element, className$7(void 0, "expanded"));
          bindValueMap(config2.foldable, "completed", valueToClassName(this.element, className$7(void 0, "cpl")));
          const headElem = doc.createElement("div");
          headElem.classList.add(className$7("h"));
          this.element.appendChild(headElem);
          const buttonElem = doc.createElement("button");
          buttonElem.classList.add(className$7("b"));
          config2.viewProps.bindDisabled(buttonElem);
          const iconElem = doc.createElementNS(SVG_NS, "svg");
          iconElem.innerHTML = '<path d="M2 13C8 13 8 3 14 3"/>';
          buttonElem.appendChild(iconElem);
          headElem.appendChild(buttonElem);
          this.buttonElement = buttonElem;
          const textElem = doc.createElement("div");
          textElem.classList.add(className$7("t"));
          headElem.appendChild(textElem);
          this.textElement = textElem;
          if (config2.pickerLayout === "inline") {
            const pickerElem = doc.createElement("div");
            pickerElem.classList.add(className$7("p"));
            this.element.appendChild(pickerElem);
            this.pickerElement = pickerElem;
          } else {
            this.pickerElement = null;
          }
        }
      }
      const className$6 = ClassName("cbzp");
      class CubicBezierPickerView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$6());
          config2.viewProps.bindClassModifiers(this.element);
          const graphElem = doc.createElement("div");
          graphElem.classList.add(className$6("g"));
          this.element.appendChild(graphElem);
          this.graphElement = graphElem;
          const textElem = doc.createElement("div");
          textElem.classList.add(className$6("t"));
          this.element.appendChild(textElem);
          this.textElement = textElem;
        }
      }
      function waitToBeAddedToDom(elem, callback) {
        const ob = new MutationObserver((ml) => {
          for (const m of ml) {
            if (m.type !== "childList") {
              continue;
            }
            m.addedNodes.forEach((elem2) => {
              if (!elem2.contains(elem2)) {
                return;
              }
              callback();
              ob.disconnect();
            });
          }
        });
        const doc = elem.ownerDocument;
        ob.observe(doc.body, {
          attributes: true,
          childList: true,
          subtree: true
        });
      }
      const className$5 = ClassName("cbzg");
      function compose(h1, h2) {
        return (input) => h2(h1(input));
      }
      class CubicBezierGraphView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$5());
          config2.viewProps.bindClassModifiers(this.element);
          config2.viewProps.bindTabIndex(this.element);
          const previewElem = doc.createElement("div");
          previewElem.classList.add(className$5("p"));
          this.element.appendChild(previewElem);
          this.previewElement = previewElem;
          const svgElem = doc.createElementNS(SVG_NS, "svg");
          svgElem.classList.add(className$5("g"));
          this.element.appendChild(svgElem);
          this.svgElem_ = svgElem;
          const guideElem = doc.createElementNS(SVG_NS, "path");
          guideElem.classList.add(className$5("u"));
          this.svgElem_.appendChild(guideElem);
          this.guideElem_ = guideElem;
          const lineElem = doc.createElementNS(SVG_NS, "polyline");
          lineElem.classList.add(className$5("l"));
          this.svgElem_.appendChild(lineElem);
          this.lineElem_ = lineElem;
          this.handleElems_ = [doc.createElement("div"), doc.createElement("div")];
          this.handleElems_.forEach((elem) => {
            elem.classList.add(className$5("h"));
            this.element.appendChild(elem);
          });
          this.vectorElems_ = [
            doc.createElementNS(SVG_NS, "line"),
            doc.createElementNS(SVG_NS, "line")
          ];
          this.vectorElems_.forEach((elem) => {
            elem.classList.add(className$5("v"));
            this.svgElem_.appendChild(elem);
          });
          this.value_ = config2.value;
          this.value_.emitter.on("change", this.onValueChange_.bind(this));
          this.sel_ = config2.selection;
          this.handleElems_.forEach((elem, index) => {
            bindValue(this.sel_, compose((selection) => selection === index, valueToClassName(elem, className$5("h", "sel"))));
          });
          waitToBeAddedToDom(this.element, () => {
            this.refresh();
          });
        }
        getVertMargin_(h) {
          return h * 0.25;
        }
        valueToPosition(x, y2) {
          const bounds = this.element.getBoundingClientRect();
          const w = bounds.width;
          const h = bounds.height;
          const vm = this.getVertMargin_(h);
          return {
            x: mapRange(x, 0, 1, 0, w),
            y: mapRange(y2, 0, 1, h - vm, vm)
          };
        }
        positionToValue(x, y2) {
          const bounds = this.element.getBoundingClientRect();
          const w = bounds.width;
          const h = bounds.height;
          const vm = this.getVertMargin_(h);
          return {
            x: constrainRange(mapRange(x, 0, w, 0, 1), 0, 1),
            y: mapRange(y2, h - vm, vm, 0, 1)
          };
        }
        refresh() {
          this.guideElem_.setAttributeNS(null, "d", [0, 1].map((index) => {
            const p1 = this.valueToPosition(0, index);
            const p2 = this.valueToPosition(1, index);
            return [`M ${p1.x},${p1.y}`, `L ${p2.x},${p2.y}`].join(" ");
          }).join(" "));
          const bezier = this.value_.rawValue;
          const points = [];
          let t = 0;
          for (; ; ) {
            const p = this.valueToPosition(...bezier.curve(t));
            points.push([p.x, p.y].join(","));
            if (t >= 1) {
              break;
            }
            t = Math.min(t + 0.05, 1);
          }
          this.lineElem_.setAttributeNS(null, "points", points.join(" "));
          const obj = bezier.toObject();
          [0, 1].forEach((index) => {
            const p1 = this.valueToPosition(index, index);
            const p2 = this.valueToPosition(obj[index * 2], obj[index * 2 + 1]);
            const vElem = this.vectorElems_[index];
            vElem.setAttributeNS(null, "x1", String(p1.x));
            vElem.setAttributeNS(null, "y1", String(p1.y));
            vElem.setAttributeNS(null, "x2", String(p2.x));
            vElem.setAttributeNS(null, "y2", String(p2.y));
            const hElem = this.handleElems_[index];
            hElem.style.left = `${p2.x}px`;
            hElem.style.top = `${p2.y}px`;
          });
        }
        onValueChange_() {
          this.refresh();
        }
      }
      const TICK_COUNT = 24;
      const PREVIEW_DELAY = 400;
      const PREVIEW_DURATION = 1e3;
      const className$4 = ClassName("cbzprv");
      class CubicBezierPreviewView {
        constructor(doc, config2) {
          this.stopped_ = true;
          this.startTime_ = -1;
          this.onDispose_ = this.onDispose_.bind(this);
          this.onTimer_ = this.onTimer_.bind(this);
          this.onValueChange_ = this.onValueChange_.bind(this);
          this.element = doc.createElement("div");
          this.element.classList.add(className$4());
          config2.viewProps.bindClassModifiers(this.element);
          const svgElem = doc.createElementNS(SVG_NS, "svg");
          svgElem.classList.add(className$4("g"));
          this.element.appendChild(svgElem);
          this.svgElem_ = svgElem;
          const ticksElem = doc.createElementNS(SVG_NS, "path");
          ticksElem.classList.add(className$4("t"));
          this.svgElem_.appendChild(ticksElem);
          this.ticksElem_ = ticksElem;
          const markerElem = doc.createElement("div");
          markerElem.classList.add(className$4("m"));
          this.element.appendChild(markerElem);
          this.markerElem_ = markerElem;
          this.value_ = config2.value;
          this.value_.emitter.on("change", this.onValueChange_);
          config2.viewProps.handleDispose(this.onDispose_);
          waitToBeAddedToDom(this.element, () => {
            this.refresh();
          });
        }
        play() {
          this.stop();
          this.updateMarker_(0);
          this.markerElem_.classList.add(className$4("m", "a"));
          this.startTime_ = new Date().getTime() + PREVIEW_DELAY;
          this.stopped_ = false;
          requestAnimationFrame(this.onTimer_);
        }
        stop() {
          this.stopped_ = true;
          this.markerElem_.classList.remove(className$4("m", "a"));
        }
        onDispose_() {
          this.stop();
        }
        updateMarker_(progress) {
          const p = this.value_.rawValue.y(constrainRange(progress, 0, 1));
          this.markerElem_.style.left = `${p * 100}%`;
        }
        refresh() {
          const bounds = this.svgElem_.getBoundingClientRect();
          const w = bounds.width;
          const h = bounds.height;
          const ds = [];
          const bezier = this.value_.rawValue;
          for (let i = 0; i < TICK_COUNT; i++) {
            const px = mapRange(i, 0, TICK_COUNT - 1, 0, 1);
            const x = mapRange(bezier.y(px), 0, 1, 0, w);
            ds.push(`M ${x},0 v${h}`);
          }
          this.ticksElem_.setAttributeNS(null, "d", ds.join(" "));
        }
        onTimer_() {
          if (this.startTime_ === null) {
            return;
          }
          const dt = new Date().getTime() - this.startTime_;
          const p = dt / PREVIEW_DURATION;
          this.updateMarker_(p);
          if (dt > PREVIEW_DURATION + PREVIEW_DELAY) {
            this.stop();
          }
          if (!this.stopped_) {
            requestAnimationFrame(this.onTimer_);
          }
        }
        onValueChange_() {
          this.refresh();
          this.play();
        }
      }
      function getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
      }
      function lockAngle(x1, y1, x2, y2) {
        const d = getDistance(x1, y1, x2, y2);
        const a = Math.atan2(y2 - y1, x2 - x1);
        const la = Math.round(a / (Math.PI / 4)) * Math.PI / 4;
        return {
          x: x1 + Math.cos(la) * d,
          y: y1 + Math.sin(la) * d
        };
      }
      class CubicBezierGraphController {
        constructor(doc, config2) {
          this.onKeyDown_ = this.onKeyDown_.bind(this);
          this.onKeyUp_ = this.onKeyUp_.bind(this);
          this.onPointerDown_ = this.onPointerDown_.bind(this);
          this.onPointerMove_ = this.onPointerMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.baseStep_ = config2.baseStep;
          this.value = config2.value;
          this.sel_ = createValue(0);
          this.viewProps = config2.viewProps;
          this.view = new CubicBezierGraphView(doc, {
            selection: this.sel_,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.element.addEventListener("keydown", this.onKeyDown_);
          this.view.element.addEventListener("keyup", this.onKeyUp_);
          this.prevView_ = new CubicBezierPreviewView(doc, {
            value: this.value,
            viewProps: this.viewProps
          });
          this.prevView_.element.addEventListener("mousedown", (ev) => {
            ev.stopImmediatePropagation();
            ev.preventDefault();
            this.prevView_.play();
          });
          this.view.previewElement.appendChild(this.prevView_.element);
          const ptHandler = new PointerHandler(this.view.element);
          ptHandler.emitter.on("down", this.onPointerDown_);
          ptHandler.emitter.on("move", this.onPointerMove_);
          ptHandler.emitter.on("up", this.onPointerUp_);
        }
        refresh() {
          this.view.refresh();
          this.prevView_.refresh();
          this.prevView_.play();
        }
        updateValue_(point, locksAngle, opts) {
          const index = this.sel_.rawValue;
          const comps = this.value.rawValue.toObject();
          const vp = this.view.positionToValue(point.x, point.y);
          const v = locksAngle ? lockAngle(index, index, vp.x, vp.y) : vp;
          comps[index * 2] = v.x;
          comps[index * 2 + 1] = v.y;
          this.value.setRawValue(new CubicBezier(...comps), opts);
        }
        onPointerDown_(ev) {
          const data = ev.data;
          if (!data.point) {
            return;
          }
          const bezier = this.value.rawValue;
          const p1 = this.view.valueToPosition(bezier.x1, bezier.y1);
          const d1 = getDistance(data.point.x, data.point.y, p1.x, p1.y);
          const p2 = this.view.valueToPosition(bezier.x2, bezier.y2);
          const d2 = getDistance(data.point.x, data.point.y, p2.x, p2.y);
          this.sel_.rawValue = d1 <= d2 ? 0 : 1;
          this.updateValue_(data.point, ev.shiftKey, {
            forceEmit: false,
            last: false
          });
        }
        onPointerMove_(ev) {
          const data = ev.data;
          if (!data.point) {
            return;
          }
          this.updateValue_(data.point, ev.shiftKey, {
            forceEmit: false,
            last: false
          });
        }
        onPointerUp_(ev) {
          const data = ev.data;
          if (!data.point) {
            return;
          }
          this.updateValue_(data.point, ev.shiftKey, {
            forceEmit: true,
            last: true
          });
        }
        onKeyDown_(ev) {
          if (isArrowKey(ev.key)) {
            ev.preventDefault();
          }
          const index = this.sel_.rawValue;
          const comps = this.value.rawValue.toObject();
          comps[index * 2] += getStepForKey(this.baseStep_, getHorizontalStepKeys(ev));
          comps[index * 2 + 1] += getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
          this.value.setRawValue(new CubicBezier(...comps), {
            forceEmit: false,
            last: false
          });
        }
        onKeyUp_(ev) {
          if (isArrowKey(ev.key)) {
            ev.preventDefault();
          }
          const xStep = getStepForKey(this.baseStep_, getHorizontalStepKeys(ev));
          const yStep = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
          if (xStep === 0 && yStep === 0) {
            return;
          }
          this.value.setRawValue(this.value.rawValue, {
            forceEmit: true,
            last: true
          });
        }
      }
      class CubicBezierPickerController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new CubicBezierPickerView(doc, {
            viewProps: this.viewProps
          });
          this.gc_ = new CubicBezierGraphController(doc, {
            baseStep: config2.axis.baseStep,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.graphElement.appendChild(this.gc_.view.element);
          const xAxis = Object.assign(Object.assign({}, config2.axis), {constraint: new RangeConstraint({max: 1, min: 0})});
          const yAxis = Object.assign(Object.assign({}, config2.axis), {constraint: void 0});
          this.tc_ = new PointNdTextController(doc, {
            assembly: CubicBezierAssembly,
            axes: [xAxis, yAxis, xAxis, yAxis],
            parser: parseNumber,
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.textElement.appendChild(this.tc_.view.element);
        }
        get allFocusableElements() {
          return [
            this.gc_.view.element,
            ...this.tc_.view.textViews.map((v) => v.inputElement)
          ];
        }
        refresh() {
          this.gc_.refresh();
        }
      }
      class CubicBezierController {
        constructor(doc, config2) {
          this.onButtonBlur_ = this.onButtonBlur_.bind(this);
          this.onButtonClick_ = this.onButtonClick_.bind(this);
          this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this);
          this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this);
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.foldable_ = createFoldable(config2.expanded);
          this.view = new CubicBezierView(doc, {
            foldable: this.foldable_,
            pickerLayout: config2.pickerLayout,
            viewProps: this.viewProps
          });
          this.view.buttonElement.addEventListener("blur", this.onButtonBlur_);
          this.view.buttonElement.addEventListener("click", this.onButtonClick_);
          this.tc_ = new TextController(doc, {
            parser: cubicBezierFromString,
            props: ValueMap.fromObject({
              formatter: cubicBezierToString
            }),
            value: this.value,
            viewProps: this.viewProps
          });
          this.view.textElement.appendChild(this.tc_.view.element);
          this.popC_ = config2.pickerLayout === "popup" ? new PopupController(doc, {
            viewProps: this.viewProps
          }) : null;
          const pickerC = new CubicBezierPickerController(doc, {
            axis: config2.axis,
            value: this.value,
            viewProps: this.viewProps
          });
          pickerC.allFocusableElements.forEach((elem) => {
            elem.addEventListener("blur", this.onPopupChildBlur_);
            elem.addEventListener("keydown", this.onPopupChildKeydown_);
          });
          this.pickerC_ = pickerC;
          if (this.popC_) {
            this.view.element.appendChild(this.popC_.view.element);
            this.popC_.view.element.appendChild(this.pickerC_.view.element);
            bindValue(this.popC_.shows, (shows) => {
              if (shows) {
                pickerC.refresh();
              }
            });
            connectValues({
              primary: this.foldable_.value("expanded"),
              secondary: this.popC_.shows,
              forward: (p) => p.rawValue,
              backward: (_, s) => s.rawValue
            });
          } else if (this.view.pickerElement) {
            this.view.pickerElement.appendChild(this.pickerC_.view.element);
            bindFoldable(this.foldable_, this.view.pickerElement);
          }
        }
        onButtonBlur_(ev) {
          if (!this.popC_) {
            return;
          }
          const nextTarget = forceCast(ev.relatedTarget);
          if (!nextTarget || !this.popC_.view.element.contains(nextTarget)) {
            this.popC_.shows.rawValue = false;
          }
        }
        onButtonClick_() {
          this.foldable_.set("expanded", !this.foldable_.get("expanded"));
          if (this.foldable_.get("expanded")) {
            this.pickerC_.allFocusableElements[0].focus();
          }
        }
        onPopupChildBlur_(ev) {
          if (!this.popC_) {
            return;
          }
          const elem = this.popC_.view.element;
          const nextTarget = findNextTarget(ev);
          if (nextTarget && elem.contains(nextTarget)) {
            return;
          }
          if (nextTarget && nextTarget === this.view.buttonElement && !supportsTouch(elem.ownerDocument)) {
            return;
          }
          this.popC_.shows.rawValue = false;
        }
        onPopupChildKeydown_(ev) {
          if (!this.popC_) {
            return;
          }
          if (ev.key === "Escape") {
            this.popC_.shows.rawValue = false;
          }
        }
      }
      function createConstraint$1() {
        return new PointNdConstraint({
          assembly: CubicBezierAssembly,
          components: [0, 1, 2, 3].map((index) => index % 2 === 0 ? new RangeConstraint({
            min: 0,
            max: 1
          }) : void 0)
        });
      }
      const CubicBezierBladePlugin = {
        id: "cubic-bezier",
        type: "blade",
        css: ".tp-cbzv_b,.tp-rslv_k,.tp-radv_b,.tp-cbzgv{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-cbzv_b,.tp-rslv_k,.tp-radv_b{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-cbzv_b:hover,.tp-rslv_k:hover,.tp-radv_b:hover{background-color:var(--btn-bg-h)}.tp-cbzv_b:focus,.tp-rslv_k:focus,.tp-radv_b:focus{background-color:var(--btn-bg-f)}.tp-cbzv_b:active,.tp-rslv_k:active,.tp-radv_b:active{background-color:var(--btn-bg-a)}.tp-cbzv_b:disabled,.tp-rslv_k:disabled,.tp-radv_b:disabled{opacity:0.5}.tp-cbzgv{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-cbzgv:hover{background-color:var(--in-bg-h)}.tp-cbzgv:focus{background-color:var(--in-bg-f)}.tp-cbzgv:active{background-color:var(--in-bg-a)}.tp-cbzgv:disabled{opacity:0.5}.tp-btngridv{border-radius:var(--elm-br);display:grid;overflow:hidden;gap:2px}.tp-btngridv.tp-v-disabled{opacity:0.5}.tp-btngridv .tp-btnv_b:disabled{opacity:1}.tp-btngridv .tp-btnv_b:disabled .tp-btnv_t{opacity:0.5}.tp-btngridv .tp-btnv_b{border-radius:0}.tp-cbzv{position:relative}.tp-cbzv_h{display:flex}.tp-cbzv_b{margin-right:4px;position:relative;width:var(--bld-us)}.tp-cbzv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-cbzv_b svg path{stroke:var(--bs-bg);stroke-width:2}.tp-cbzv_t{flex:1}.tp-cbzv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-cbzv.tp-cbzv-expanded .tp-cbzv_p{margin-top:var(--bld-s);opacity:1}.tp-cbzv.tp-cbzv-cpl .tp-cbzv_p{overflow:visible}.tp-cbzv .tp-popv{left:calc(-1 * var(--cnt-h-p));position:absolute;right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-cbzpv_t{margin-top:var(--bld-s)}.tp-cbzgv{height:auto;overflow:hidden;position:relative}.tp-cbzgv.tp-v-disabled{opacity:0.5}.tp-cbzgv_p{left:16px;position:absolute;right:16px;top:0}.tp-cbzgv_g{cursor:pointer;display:block;height:calc(var(--bld-us) * 5);width:100%}.tp-cbzgv_u{opacity:0.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-cbzgv_l{fill:transparent;stroke:var(--in-fg)}.tp-cbzgv_v{opacity:0.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-cbzgv_h{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;pointer-events:none;position:absolute;width:4px}.tp-cbzgv:focus .tp-cbzgv_h-sel{background-color:var(--in-fg);border-width:0}.tp-cbzprvv{cursor:pointer;height:4px;padding:4px 0;position:relative}.tp-cbzprvv_g{display:block;height:100%;overflow:visible;width:100%}.tp-cbzprvv_t{opacity:0.5;stroke:var(--mo-fg)}.tp-cbzprvv_m{background-color:var(--mo-fg);border-radius:50%;height:4px;margin-left:-2px;margin-top:-2px;opacity:0;position:absolute;top:50%;transition:opacity 0.2s ease-out;width:4px}.tp-cbzprvv_m.tp-cbzprvv_m-a{opacity:1}.tp-fpsv{position:relative}.tp-fpsv_l{bottom:4px;color:var(--mo-fg);line-height:1;right:4px;pointer-events:none;position:absolute}.tp-fpsv_u{margin-left:0.2em;opacity:0.7}.tp-rslv{cursor:pointer;padding-left:8px;padding-right:8px}.tp-rslv.tp-v-disabled{opacity:0.5}.tp-rslv_t{height:calc(var(--bld-us));position:relative}.tp-rslv_t::before{background-color:var(--in-bg);border-radius:1px;content:'';height:2px;margin-top:-1px;position:absolute;top:50%;left:-4px;right:-4px}.tp-rslv_b{bottom:0;top:0;position:absolute}.tp-rslv_b::before{background-color:var(--in-fg);content:'';height:2px;margin-top:-1px;position:absolute;top:50%;left:0;right:0}.tp-rslv_k{height:calc(var(--bld-us) - 8px);margin-top:calc((var(--bld-us) - 8px) / -2);position:absolute;top:50%;width:8px}.tp-rslv_k.tp-rslv_k-min{margin-left:-8px}.tp-rslv_k.tp-rslv_k-max{margin-left:0}.tp-rslv.tp-rslv-zero .tp-rslv_k.tp-rslv_k-min{border-bottom-right-radius:0;border-top-right-radius:0}.tp-rslv.tp-rslv-zero .tp-rslv_k.tp-rslv_k-max{border-bottom-left-radius:0;border-top-left-radius:0}.tp-rsltxtv{display:flex}.tp-rsltxtv_s{flex:1}.tp-rsltxtv_t{flex:1;margin-left:4px}.tp-radv_l{display:block;position:relative}.tp-radv_i{left:0;opacity:0;position:absolute;top:0}.tp-radv_b{opacity:0.5}.tp-radv_i:hover+.tp-radv_b{background-color:var(--btn-bg-h)}.tp-radv_i:focus+.tp-radv_b{background-color:var(--btn-bg-f)}.tp-radv_i:active+.tp-radv_b{background-color:var(--btn-bg-a)}.tp-radv_i:checked+.tp-radv_b{opacity:1}.tp-radv_t{bottom:0;color:inherit;left:0;overflow:hidden;position:absolute;right:0;text-align:center;text-overflow:ellipsis;top:0}.tp-radv_i:disabled+.tp-radv_b>.tp-radv_t{opacity:0.5}.tp-radgridv{border-radius:var(--elm-br);display:grid;overflow:hidden;gap:2px}.tp-radgridv.tp-v-disabled{opacity:0.5}.tp-radgridv .tp-radv_b{border-radius:0}",
        accept(params) {
          const p = ParamsParsers;
          const result = parseParams(params, {
            value: p.required.array(p.required.number),
            view: p.required.constant("cubicbezier"),
            expanded: p.optional.boolean,
            label: p.optional.string,
            picker: p.optional.custom((v) => {
              return v === "inline" || v === "popup" ? v : void 0;
            })
          });
          return result ? {params: result} : null;
        },
        controller(args) {
          var _a, _b;
          const rv = new CubicBezier(...args.params.value);
          const v = createValue(rv, {
            constraint: createConstraint$1(),
            equals: CubicBezier.equals
          });
          const vc = new CubicBezierController(args.document, {
            axis: {
              baseStep: 0.1,
              textProps: ValueMap.fromObject({
                draggingScale: 0.01,
                formatter: createNumberFormatter(2)
              })
            },
            expanded: (_a = args.params.expanded) !== null && _a !== void 0 ? _a : false,
            pickerLayout: (_b = args.params.picker) !== null && _b !== void 0 ? _b : "popup",
            value: v,
            viewProps: args.viewProps
          });
          return new LabeledValueController(args.document, {
            blade: args.blade,
            props: ValueMap.fromObject({
              label: args.params.label
            }),
            valueController: vc
          });
        },
        api(args) {
          if (!(args.controller instanceof LabeledValueController)) {
            return null;
          }
          if (!(args.controller.valueController instanceof CubicBezierController)) {
            return null;
          }
          return new CubicBezierApi(args.controller);
        }
      };
      class FpsGraphBladeApi extends BladeApi {
        begin() {
          this.controller_.valueController.begin();
        }
        end() {
          this.controller_.valueController.end();
        }
      }
      const MAX_TIMESTAMPS = 20;
      class Fpswatch {
        constructor() {
          this.start_ = null;
          this.duration_ = 0;
          this.fps_ = null;
          this.frameCount_ = 0;
          this.timestamps_ = [];
        }
        get duration() {
          return this.duration_;
        }
        get fps() {
          return this.fps_;
        }
        begin(now) {
          this.start_ = now.getTime();
        }
        calculateFps_(nowTime) {
          if (this.timestamps_.length === 0) {
            return null;
          }
          const ts = this.timestamps_[0];
          return 1e3 * (this.frameCount_ - ts.frameCount) / (nowTime - ts.time);
        }
        compactTimestamps_() {
          if (this.timestamps_.length <= MAX_TIMESTAMPS) {
            return;
          }
          const len = this.timestamps_.length - MAX_TIMESTAMPS;
          this.timestamps_.splice(0, len);
          const df = this.timestamps_[0].frameCount;
          this.timestamps_.forEach((ts) => {
            ts.frameCount -= df;
          });
          this.frameCount_ -= df;
        }
        end(now) {
          if (this.start_ === null) {
            return;
          }
          const t = now.getTime();
          this.duration_ = t - this.start_;
          this.start_ = null;
          this.fps_ = this.calculateFps_(t);
          this.timestamps_.push({
            frameCount: this.frameCount_,
            time: t
          });
          ++this.frameCount_;
          this.compactTimestamps_();
        }
      }
      const className$3 = ClassName("fps");
      class FpsView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className$3());
          config2.viewProps.bindClassModifiers(this.element);
          this.graphElement = doc.createElement("div");
          this.graphElement.classList.add(className$3("g"));
          this.element.appendChild(this.graphElement);
          const labelElement = doc.createElement("div");
          labelElement.classList.add(className$3("l"));
          this.element.appendChild(labelElement);
          const valueElement = doc.createElement("span");
          valueElement.classList.add(className$3("v"));
          valueElement.textContent = "--";
          labelElement.appendChild(valueElement);
          this.valueElement = valueElement;
          const unitElement = doc.createElement("span");
          unitElement.classList.add(className$3("u"));
          unitElement.textContent = "FPS";
          labelElement.appendChild(unitElement);
        }
      }
      class FpsGraphController {
        constructor(doc, config2) {
          this.stopwatch_ = new Fpswatch();
          this.onTick_ = this.onTick_.bind(this);
          this.ticker_ = config2.ticker;
          this.ticker_.emitter.on("tick", this.onTick_);
          this.value_ = config2.value;
          this.viewProps = config2.viewProps;
          this.view = new FpsView(doc, {
            viewProps: this.viewProps
          });
          this.graphC_ = new GraphLogController(doc, {
            formatter: createNumberFormatter(0),
            lineCount: config2.lineCount,
            maxValue: config2.maxValue,
            minValue: config2.minValue,
            value: this.value_,
            viewProps: this.viewProps
          });
          this.view.graphElement.appendChild(this.graphC_.view.element);
          this.viewProps.handleDispose(() => {
            this.graphC_.viewProps.set("disposed", true);
            this.ticker_.dispose();
          });
        }
        begin() {
          this.stopwatch_.begin(new Date());
        }
        end() {
          this.stopwatch_.end(new Date());
        }
        onTick_() {
          const fps = this.stopwatch_.fps;
          if (fps !== null) {
            const buffer = this.value_.rawValue;
            this.value_.rawValue = createPushedBuffer(buffer, fps);
            this.view.valueElement.textContent = fps.toFixed(0);
          }
        }
      }
      function createTicker(document2, interval) {
        return interval === 0 ? new ManualTicker() : new IntervalTicker(document2, interval !== null && interval !== void 0 ? interval : Constants.monitor.defaultInterval);
      }
      const FpsGraphBladePlugin = {
        id: "fpsgraph",
        type: "blade",
        accept(params) {
          const p = ParamsParsers;
          const result = parseParams(params, {
            view: p.required.constant("fpsgraph"),
            interval: p.optional.number,
            label: p.optional.string,
            lineCount: p.optional.number,
            max: p.optional.number,
            min: p.optional.number
          });
          return result ? {params: result} : null;
        },
        controller(args) {
          var _a, _b, _c, _d;
          const interval = (_a = args.params.interval) !== null && _a !== void 0 ? _a : 500;
          return new LabelController(args.document, {
            blade: args.blade,
            props: ValueMap.fromObject({
              label: args.params.label
            }),
            valueController: new FpsGraphController(args.document, {
              lineCount: (_b = args.params.lineCount) !== null && _b !== void 0 ? _b : 2,
              maxValue: (_c = args.params.max) !== null && _c !== void 0 ? _c : 90,
              minValue: (_d = args.params.min) !== null && _d !== void 0 ? _d : 0,
              ticker: createTicker(args.document, interval),
              value: initializeBuffer(80),
              viewProps: args.viewProps
            })
          });
        },
        api(args) {
          if (!(args.controller instanceof LabelController)) {
            return null;
          }
          if (!(args.controller.valueController instanceof FpsGraphController)) {
            return null;
          }
          return new FpsGraphBladeApi(args.controller);
        }
      };
      class Interval {
        constructor(min, max) {
          this.min = min;
          this.max = max;
        }
        static isObject(obj) {
          if (typeof obj !== "object" || obj === null) {
            return false;
          }
          const min = obj.min;
          const max = obj.max;
          if (typeof min !== "number" || typeof max !== "number") {
            return false;
          }
          return true;
        }
        static equals(v1, v2) {
          return v1.min === v2.min && v1.max === v2.max;
        }
        get length() {
          return this.max - this.min;
        }
        toObject() {
          return {
            min: this.min,
            max: this.max
          };
        }
      }
      const IntervalAssembly = {
        fromComponents: (comps) => new Interval(comps[0], comps[1]),
        toComponents: (p) => [p.min, p.max]
      };
      class IntervalConstraint {
        constructor(edge) {
          this.edge = edge;
        }
        constrain(value) {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          if (value.min <= value.max) {
            return new Interval((_b = (_a = this.edge) === null || _a === void 0 ? void 0 : _a.constrain(value.min)) !== null && _b !== void 0 ? _b : value.min, (_d = (_c = this.edge) === null || _c === void 0 ? void 0 : _c.constrain(value.max)) !== null && _d !== void 0 ? _d : value.max);
          }
          const c = (value.min + value.max) / 2;
          return new Interval((_f = (_e = this.edge) === null || _e === void 0 ? void 0 : _e.constrain(c)) !== null && _f !== void 0 ? _f : c, (_h = (_g = this.edge) === null || _g === void 0 ? void 0 : _g.constrain(c)) !== null && _h !== void 0 ? _h : c);
        }
      }
      const className$2 = ClassName("rsltxt");
      class RangeSliderTextView {
        constructor(doc, config2) {
          this.sliderView_ = config2.sliderView;
          this.textView_ = config2.textView;
          this.element = doc.createElement("div");
          this.element.classList.add(className$2());
          const sliderElem = doc.createElement("div");
          sliderElem.classList.add(className$2("s"));
          sliderElem.appendChild(this.sliderView_.element);
          this.element.appendChild(sliderElem);
          const textElem = doc.createElement("div");
          textElem.classList.add(className$2("t"));
          textElem.appendChild(this.textView_.element);
          this.element.appendChild(textElem);
        }
      }
      const className$1 = ClassName("rsl");
      class RangeSliderView {
        constructor(doc, config2) {
          this.maxValue_ = config2.maxValue;
          this.minValue_ = config2.minValue;
          this.element = doc.createElement("div");
          this.element.classList.add(className$1());
          config2.viewProps.bindClassModifiers(this.element);
          this.value_ = config2.value;
          this.value_.emitter.on("change", this.onValueChange_.bind(this));
          const trackElem = doc.createElement("div");
          trackElem.classList.add(className$1("t"));
          this.element.appendChild(trackElem);
          this.trackElement = trackElem;
          const barElem = doc.createElement("div");
          barElem.classList.add(className$1("b"));
          trackElem.appendChild(barElem);
          this.barElement = barElem;
          const knobElems = ["min", "max"].map((modifier) => {
            const elem = doc.createElement("div");
            elem.classList.add(className$1("k"), className$1("k", modifier));
            trackElem.appendChild(elem);
            return elem;
          });
          this.knobElements = [knobElems[0], knobElems[1]];
          this.update();
        }
        valueToX_(value) {
          return constrainRange(mapRange(value, this.minValue_, this.maxValue_, 0, 1), 0, 1) * 100;
        }
        update() {
          const v = this.value_.rawValue;
          if (v.length === 0) {
            this.element.classList.add(className$1(void 0, "zero"));
          } else {
            this.element.classList.remove(className$1(void 0, "zero"));
          }
          const xs = [this.valueToX_(v.min), this.valueToX_(v.max)];
          this.barElement.style.left = `${xs[0]}%`;
          this.barElement.style.right = `${100 - xs[1]}%`;
          this.knobElements.forEach((elem, index) => {
            elem.style.left = `${xs[index]}%`;
          });
        }
        onValueChange_() {
          this.update();
        }
      }
      class RangeSliderController {
        constructor(doc, config2) {
          this.grabbing_ = null;
          this.grabOffset_ = 0;
          this.onPointerDown_ = this.onPointerDown_.bind(this);
          this.onPointerMove_ = this.onPointerMove_.bind(this);
          this.onPointerUp_ = this.onPointerUp_.bind(this);
          this.maxValue_ = config2.maxValue;
          this.minValue_ = config2.minValue;
          this.viewProps = config2.viewProps;
          this.value = config2.value;
          this.view = new RangeSliderView(doc, {
            maxValue: config2.maxValue,
            minValue: config2.minValue,
            value: this.value,
            viewProps: config2.viewProps
          });
          const ptHandler = new PointerHandler(this.view.trackElement);
          ptHandler.emitter.on("down", this.onPointerDown_);
          ptHandler.emitter.on("move", this.onPointerMove_);
          ptHandler.emitter.on("up", this.onPointerUp_);
        }
        ofs_() {
          if (this.grabbing_ === "min") {
            return this.view.knobElements[0].getBoundingClientRect().width / 2;
          }
          if (this.grabbing_ === "max") {
            return -this.view.knobElements[1].getBoundingClientRect().width / 2;
          }
          return 0;
        }
        valueFromData_(data) {
          if (!data.point) {
            return null;
          }
          const p = (data.point.x + this.ofs_()) / data.bounds.width;
          return mapRange(p, 0, 1, this.minValue_, this.maxValue_);
        }
        onPointerDown_(ev) {
          if (!ev.data.point) {
            return;
          }
          const p = ev.data.point.x / ev.data.bounds.width;
          const v = this.value.rawValue;
          const pmin = mapRange(v.min, this.minValue_, this.maxValue_, 0, 1);
          const pmax = mapRange(v.max, this.minValue_, this.maxValue_, 0, 1);
          if (Math.abs(pmax - p) <= 0.025) {
            this.grabbing_ = "max";
          } else if (Math.abs(pmin - p) <= 0.025) {
            this.grabbing_ = "min";
          } else if (p >= pmin && p <= pmax) {
            this.grabbing_ = "length";
            this.grabOffset_ = mapRange(p - pmin, 0, 1, 0, this.maxValue_ - this.minValue_);
          } else if (p < pmin) {
            this.grabbing_ = "min";
            this.onPointerMove_(ev);
          } else if (p > pmax) {
            this.grabbing_ = "max";
            this.onPointerMove_(ev);
          }
        }
        applyPointToValue_(data, opts) {
          const v = this.valueFromData_(data);
          if (v === null) {
            return;
          }
          if (this.grabbing_ === "min") {
            this.value.setRawValue(new Interval(v, this.value.rawValue.max), opts);
          } else if (this.grabbing_ === "max") {
            this.value.setRawValue(new Interval(this.value.rawValue.min, v), opts);
          } else if (this.grabbing_ === "length") {
            const len = this.value.rawValue.length;
            let min = v - this.grabOffset_;
            let max = min + len;
            if (min < this.minValue_) {
              min = this.minValue_;
              max = this.minValue_ + len;
            } else if (max > this.maxValue_) {
              min = this.maxValue_ - len;
              max = this.maxValue_;
            }
            this.value.setRawValue(new Interval(min, max), opts);
          }
        }
        onPointerMove_(ev) {
          this.applyPointToValue_(ev.data, {
            forceEmit: false,
            last: false
          });
        }
        onPointerUp_(ev) {
          this.applyPointToValue_(ev.data, {
            forceEmit: true,
            last: true
          });
          this.grabbing_ = null;
        }
      }
      class RangeSliderTextController {
        constructor(doc, config2) {
          this.value = config2.value;
          this.viewProps = config2.viewProps;
          this.sc_ = new RangeSliderController(doc, config2);
          const axis = {
            baseStep: config2.baseStep,
            constraint: config2.constraint,
            textProps: ValueMap.fromObject({
              draggingScale: config2.draggingScale,
              formatter: config2.formatter
            })
          };
          this.tc_ = new PointNdTextController(doc, {
            assembly: IntervalAssembly,
            axes: [axis, axis],
            parser: config2.parser,
            value: this.value,
            viewProps: config2.viewProps
          });
          this.view = new RangeSliderTextView(doc, {
            sliderView: this.sc_.view,
            textView: this.tc_.view
          });
        }
        get textController() {
          return this.tc_;
        }
      }
      function intervalFromUnknown(value) {
        return Interval.isObject(value) ? new Interval(value.min, value.max) : new Interval(0, 0);
      }
      function writeInterval(target, value) {
        target.writeProperty("max", value.max);
        target.writeProperty("min", value.min);
      }
      function createConstraint(params) {
        const constraints = [];
        const rc = createRangeConstraint(params);
        if (rc) {
          constraints.push(rc);
        }
        const sc = createStepConstraint(params);
        if (sc) {
          constraints.push(sc);
        }
        return new IntervalConstraint(new CompositeConstraint(constraints));
      }
      const IntervalInputPlugin = {
        id: "input-interval",
        type: "input",
        css: ".tp-cbzv_b,.tp-rslv_k,.tp-radv_b,.tp-cbzgv{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-cbzv_b,.tp-rslv_k,.tp-radv_b{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-cbzv_b:hover,.tp-rslv_k:hover,.tp-radv_b:hover{background-color:var(--btn-bg-h)}.tp-cbzv_b:focus,.tp-rslv_k:focus,.tp-radv_b:focus{background-color:var(--btn-bg-f)}.tp-cbzv_b:active,.tp-rslv_k:active,.tp-radv_b:active{background-color:var(--btn-bg-a)}.tp-cbzv_b:disabled,.tp-rslv_k:disabled,.tp-radv_b:disabled{opacity:0.5}.tp-cbzgv{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-cbzgv:hover{background-color:var(--in-bg-h)}.tp-cbzgv:focus{background-color:var(--in-bg-f)}.tp-cbzgv:active{background-color:var(--in-bg-a)}.tp-cbzgv:disabled{opacity:0.5}.tp-btngridv{border-radius:var(--elm-br);display:grid;overflow:hidden;gap:2px}.tp-btngridv.tp-v-disabled{opacity:0.5}.tp-btngridv .tp-btnv_b:disabled{opacity:1}.tp-btngridv .tp-btnv_b:disabled .tp-btnv_t{opacity:0.5}.tp-btngridv .tp-btnv_b{border-radius:0}.tp-cbzv{position:relative}.tp-cbzv_h{display:flex}.tp-cbzv_b{margin-right:4px;position:relative;width:var(--bld-us)}.tp-cbzv_b svg{display:block;height:16px;left:50%;margin-left:-8px;margin-top:-8px;position:absolute;top:50%;width:16px}.tp-cbzv_b svg path{stroke:var(--bs-bg);stroke-width:2}.tp-cbzv_t{flex:1}.tp-cbzv_p{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-cbzv.tp-cbzv-expanded .tp-cbzv_p{margin-top:var(--bld-s);opacity:1}.tp-cbzv.tp-cbzv-cpl .tp-cbzv_p{overflow:visible}.tp-cbzv .tp-popv{left:calc(-1 * var(--cnt-h-p));position:absolute;right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-cbzpv_t{margin-top:var(--bld-s)}.tp-cbzgv{height:auto;overflow:hidden;position:relative}.tp-cbzgv.tp-v-disabled{opacity:0.5}.tp-cbzgv_p{left:16px;position:absolute;right:16px;top:0}.tp-cbzgv_g{cursor:pointer;display:block;height:calc(var(--bld-us) * 5);width:100%}.tp-cbzgv_u{opacity:0.1;stroke:var(--in-fg);stroke-dasharray:1}.tp-cbzgv_l{fill:transparent;stroke:var(--in-fg)}.tp-cbzgv_v{opacity:0.5;stroke:var(--in-fg);stroke-dasharray:1}.tp-cbzgv_h{border:var(--in-fg) solid 1px;border-radius:50%;box-sizing:border-box;height:4px;margin-left:-2px;margin-top:-2px;pointer-events:none;position:absolute;width:4px}.tp-cbzgv:focus .tp-cbzgv_h-sel{background-color:var(--in-fg);border-width:0}.tp-cbzprvv{cursor:pointer;height:4px;padding:4px 0;position:relative}.tp-cbzprvv_g{display:block;height:100%;overflow:visible;width:100%}.tp-cbzprvv_t{opacity:0.5;stroke:var(--mo-fg)}.tp-cbzprvv_m{background-color:var(--mo-fg);border-radius:50%;height:4px;margin-left:-2px;margin-top:-2px;opacity:0;position:absolute;top:50%;transition:opacity 0.2s ease-out;width:4px}.tp-cbzprvv_m.tp-cbzprvv_m-a{opacity:1}.tp-fpsv{position:relative}.tp-fpsv_l{bottom:4px;color:var(--mo-fg);line-height:1;right:4px;pointer-events:none;position:absolute}.tp-fpsv_u{margin-left:0.2em;opacity:0.7}.tp-rslv{cursor:pointer;padding-left:8px;padding-right:8px}.tp-rslv.tp-v-disabled{opacity:0.5}.tp-rslv_t{height:calc(var(--bld-us));position:relative}.tp-rslv_t::before{background-color:var(--in-bg);border-radius:1px;content:'';height:2px;margin-top:-1px;position:absolute;top:50%;left:-4px;right:-4px}.tp-rslv_b{bottom:0;top:0;position:absolute}.tp-rslv_b::before{background-color:var(--in-fg);content:'';height:2px;margin-top:-1px;position:absolute;top:50%;left:0;right:0}.tp-rslv_k{height:calc(var(--bld-us) - 8px);margin-top:calc((var(--bld-us) - 8px) / -2);position:absolute;top:50%;width:8px}.tp-rslv_k.tp-rslv_k-min{margin-left:-8px}.tp-rslv_k.tp-rslv_k-max{margin-left:0}.tp-rslv.tp-rslv-zero .tp-rslv_k.tp-rslv_k-min{border-bottom-right-radius:0;border-top-right-radius:0}.tp-rslv.tp-rslv-zero .tp-rslv_k.tp-rslv_k-max{border-bottom-left-radius:0;border-top-left-radius:0}.tp-rsltxtv{display:flex}.tp-rsltxtv_s{flex:1}.tp-rsltxtv_t{flex:1;margin-left:4px}.tp-radv_l{display:block;position:relative}.tp-radv_i{left:0;opacity:0;position:absolute;top:0}.tp-radv_b{opacity:0.5}.tp-radv_i:hover+.tp-radv_b{background-color:var(--btn-bg-h)}.tp-radv_i:focus+.tp-radv_b{background-color:var(--btn-bg-f)}.tp-radv_i:active+.tp-radv_b{background-color:var(--btn-bg-a)}.tp-radv_i:checked+.tp-radv_b{opacity:1}.tp-radv_t{bottom:0;color:inherit;left:0;overflow:hidden;position:absolute;right:0;text-align:center;text-overflow:ellipsis;top:0}.tp-radv_i:disabled+.tp-radv_b>.tp-radv_t{opacity:0.5}.tp-radgridv{border-radius:var(--elm-br);display:grid;overflow:hidden;gap:2px}.tp-radgridv.tp-v-disabled{opacity:0.5}.tp-radgridv .tp-radv_b{border-radius:0}",
        accept: (exValue, params) => {
          if (!Interval.isObject(exValue)) {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            format: p.optional.function,
            max: p.optional.number,
            min: p.optional.number,
            step: p.optional.number
          });
          return result ? {
            initialValue: new Interval(exValue.min, exValue.max),
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => intervalFromUnknown,
          constraint: (args) => createConstraint(args.params),
          equals: Interval.equals,
          writer: (_args) => writeInterval
        },
        controller(args) {
          var _a;
          const v = args.value;
          const c = args.constraint;
          if (!(c instanceof IntervalConstraint)) {
            throw TpError.shouldNeverHappen();
          }
          const midValue = (v.rawValue.min + v.rawValue.max) / 2;
          const formatter = (_a = args.params.format) !== null && _a !== void 0 ? _a : createNumberFormatter(getSuitableDecimalDigits(c.edge, midValue));
          const rc = c.edge && findConstraint(c.edge, RangeConstraint);
          if ((rc === null || rc === void 0 ? void 0 : rc.minValue) !== void 0 && (rc === null || rc === void 0 ? void 0 : rc.maxValue) !== void 0) {
            return new RangeSliderTextController(args.document, {
              baseStep: getBaseStep(c.edge),
              constraint: c.edge,
              draggingScale: getSuitableDraggingScale(rc, midValue),
              formatter,
              maxValue: rc.maxValue,
              minValue: rc.minValue,
              parser: parseNumber,
              value: v,
              viewProps: args.viewProps
            });
          }
          const axis = {
            baseStep: getBaseStep(c.edge),
            constraint: c.edge,
            textProps: ValueMap.fromObject({
              draggingScale: midValue,
              formatter
            })
          };
          return new PointNdTextController(args.document, {
            assembly: IntervalAssembly,
            axes: [axis, axis],
            parser: parseNumber,
            value: v,
            viewProps: args.viewProps
          });
        }
      };
      class RadioCellApi {
        constructor(controller) {
          this.controller_ = controller;
        }
        get disabled() {
          return this.controller_.viewProps.get("disabled");
        }
        set disabled(disabled) {
          this.controller_.viewProps.set("disabled", disabled);
        }
        get title() {
          var _a;
          return (_a = this.controller_.props.get("title")) !== null && _a !== void 0 ? _a : "";
        }
        set title(title) {
          this.controller_.props.set("title", title);
        }
      }
      class TpRadioGridChangeEvent extends TpChangeEvent {
        constructor(target, cell, index, value, presetKey) {
          super(target, value, presetKey);
          this.cell = cell;
          this.index = index;
        }
      }
      class RadioGridApi extends BladeApi {
        constructor(controller) {
          super(controller);
          this.cellToApiMap_ = new Map();
          const gc = this.controller_.valueController;
          gc.cellControllers.forEach((cc) => {
            const api = new RadioCellApi(cc);
            this.cellToApiMap_.set(cc, api);
          });
        }
        get value() {
          return this.controller_.value;
        }
        cell(x, y2) {
          const gc = this.controller_.valueController;
          const cc = gc.cellControllers[y2 * gc.size[0] + x];
          return this.cellToApiMap_.get(cc);
        }
        on(eventName, handler) {
          const bh = handler.bind(this);
          this.controller_.value.emitter.on(eventName, (ev) => {
            const gc = this.controller_.valueController;
            const cc = gc.findCellByValue(ev.rawValue);
            if (!cc) {
              return;
            }
            const capi = this.cellToApiMap_.get(cc);
            if (!capi) {
              return;
            }
            const i = gc.cellControllers.indexOf(cc);
            bh(new TpRadioGridChangeEvent(this, capi, [i % gc.size[0], Math.floor(i / gc.size[0])], ev.rawValue, void 0));
          });
        }
      }
      const className = ClassName("rad");
      class RadioView {
        constructor(doc, config2) {
          this.element = doc.createElement("div");
          this.element.classList.add(className());
          config2.viewProps.bindClassModifiers(this.element);
          const labelElem = doc.createElement("label");
          labelElem.classList.add(className("l"));
          this.element.appendChild(labelElem);
          const inputElem = doc.createElement("input");
          inputElem.classList.add(className("i"));
          inputElem.name = config2.name;
          inputElem.type = "radio";
          config2.viewProps.bindDisabled(inputElem);
          labelElem.appendChild(inputElem);
          this.inputElement = inputElem;
          const bodyElem = doc.createElement("div");
          bodyElem.classList.add(className("b"));
          labelElem.appendChild(bodyElem);
          const titleElem = doc.createElement("div");
          titleElem.classList.add(className("t"));
          bodyElem.appendChild(titleElem);
          bindValueMap(config2.props, "title", (title) => {
            titleElem.textContent = title;
          });
        }
      }
      class RadioController {
        constructor(doc, config2) {
          this.props = config2.props;
          this.viewProps = config2.viewProps;
          this.view = new RadioView(doc, {
            name: config2.name,
            props: this.props,
            viewProps: this.viewProps
          });
        }
      }
      class RadioGridController {
        constructor(doc, config2) {
          this.cellCs_ = [];
          this.cellValues_ = [];
          this.onCellInputChange_ = this.onCellInputChange_.bind(this);
          this.size = config2.size;
          const [w, h] = this.size;
          for (let y2 = 0; y2 < h; y2++) {
            for (let x = 0; x < w; x++) {
              const bc = new RadioController(doc, {
                name: config2.groupName,
                props: ValueMap.fromObject(Object.assign({}, config2.cellConfig(x, y2))),
                viewProps: ViewProps.create()
              });
              this.cellCs_.push(bc);
              this.cellValues_.push(config2.cellConfig(x, y2).value);
            }
          }
          this.value = config2.value;
          bindValue(this.value, (value) => {
            const cc = this.findCellByValue(value);
            if (!cc) {
              return;
            }
            cc.view.inputElement.checked = true;
          });
          this.viewProps = ViewProps.create();
          this.view = new PlainView(doc, {
            viewProps: this.viewProps,
            viewName: "radgrid"
          });
          this.view.element.style.gridTemplateColumns = `repeat(${w}, 1fr)`;
          this.cellCs_.forEach((bc) => {
            bc.view.inputElement.addEventListener("change", this.onCellInputChange_);
            this.view.element.appendChild(bc.view.element);
          });
        }
        get cellControllers() {
          return this.cellCs_;
        }
        findCellByValue(value) {
          const index = this.cellValues_.findIndex((v) => v === value);
          if (index < 0) {
            return null;
          }
          return this.cellCs_[index];
        }
        onCellInputChange_(ev) {
          const inputElem = ev.currentTarget;
          const index = this.cellCs_.findIndex((c) => c.view.inputElement === inputElem);
          if (index < 0) {
            return;
          }
          this.value.rawValue = this.cellValues_[index];
        }
      }
      const RadioGridBladePlugin = function() {
        return {
          id: "radiogrid",
          type: "blade",
          accept(params) {
            const p = ParamsParsers;
            const result = parseParams(params, {
              cells: p.required.function,
              groupName: p.required.string,
              size: p.required.array(p.required.number),
              value: p.required.raw,
              view: p.required.constant("radiogrid"),
              label: p.optional.string
            });
            return result ? {params: result} : null;
          },
          controller(args) {
            return new LabeledValueController(args.document, {
              blade: args.blade,
              props: ValueMap.fromObject({
                label: args.params.label
              }),
              valueController: new RadioGridController(args.document, {
                groupName: args.params.groupName,
                cellConfig: args.params.cells,
                size: args.params.size,
                value: createValue(args.params.value)
              })
            });
          },
          api(args) {
            if (!(args.controller instanceof LabeledValueController)) {
              return null;
            }
            if (!(args.controller.valueController instanceof RadioGridController)) {
              return null;
            }
            return new RadioGridApi(args.controller);
          }
        };
      }();
      const RadioGridNumberInputPlugin = {
        id: "input-radiogrid",
        type: "input",
        accept(value, params) {
          if (typeof value !== "number") {
            return null;
          }
          const p = ParamsParsers;
          const result = parseParams(params, {
            cells: p.required.function,
            groupName: p.required.string,
            size: p.required.array(p.required.number),
            view: p.required.constant("radiogrid")
          });
          return result ? {
            initialValue: value,
            params: result
          } : null;
        },
        binding: {
          reader: (_args) => numberFromUnknown,
          writer: (_args) => writePrimitive
        },
        controller: (args) => {
          return new RadioGridController(args.document, {
            cellConfig: args.params.cells,
            groupName: args.params.groupName,
            size: args.params.size,
            value: args.value
          });
        }
      };
      const plugins = [
        ButtonGridBladePlugin,
        CubicBezierBladePlugin,
        FpsGraphBladePlugin,
        IntervalInputPlugin,
        RadioGridBladePlugin,
        RadioGridNumberInputPlugin
      ];
      exports2.CubicBezier = CubicBezier;
      exports2.plugins = plugins;
      Object.defineProperty(exports2, "__esModule", {value: true});
    });
  });

  // node_modules/webm-writer/WebMWriter.js
  var require_WebMWriter = __commonJS((exports, module) => {
    "use strict";
    (function() {
      function extend(base, top) {
        let target = {};
        [base, top].forEach(function(obj) {
          for (let prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
              target[prop] = obj[prop];
            }
          }
        });
        return target;
      }
      function decodeBase64WebPDataURL(url) {
        if (typeof url !== "string" || !url.match(/^data:image\/webp;base64,/i)) {
          throw new Error("Failed to decode WebP Base64 URL");
        }
        return window.atob(url.substring("data:image/webp;base64,".length));
      }
      function renderAsWebP(canvas, quality) {
        let frame = typeof canvas === "string" && /^data:image\/webp/.test(canvas) ? canvas : canvas.toDataURL("image/webp", quality);
        return decodeBase64WebPDataURL(frame);
      }
      function byteStringToUint32LE(string) {
        let a = string.charCodeAt(0), b = string.charCodeAt(1), c = string.charCodeAt(2), d = string.charCodeAt(3);
        return (a | b << 8 | c << 16 | d << 24) >>> 0;
      }
      function extractKeyframeFromWebP(webP) {
        let cursor = webP.indexOf("VP8", 12);
        if (cursor === -1) {
          throw new Error("Bad image format, does this browser support WebP?");
        }
        let hasAlpha = false;
        while (cursor < webP.length - 8) {
          let chunkLength, fourCC;
          fourCC = webP.substring(cursor, cursor + 4);
          cursor += 4;
          chunkLength = byteStringToUint32LE(webP.substring(cursor, cursor + 4));
          cursor += 4;
          switch (fourCC) {
            case "VP8 ":
              return {
                frame: webP.substring(cursor, cursor + chunkLength),
                hasAlpha
              };
            case "ALPH":
              hasAlpha = true;
              break;
          }
          cursor += chunkLength;
          if ((chunkLength & 1) !== 0) {
            cursor++;
          }
        }
        throw new Error("Failed to find VP8 keyframe in WebP image, is this image mistakenly encoded in the Lossless WebP format?");
      }
      const EBML_SIZE_UNKNOWN = -1, EBML_SIZE_UNKNOWN_5_BYTES = -2;
      function EBMLFloat32(value) {
        this.value = value;
      }
      function EBMLFloat64(value) {
        this.value = value;
      }
      function writeEBML(buffer, bufferFileOffset, ebml) {
        if (Array.isArray(ebml)) {
          for (let i = 0; i < ebml.length; i++) {
            writeEBML(buffer, bufferFileOffset, ebml[i]);
          }
        } else if (typeof ebml === "string") {
          buffer.writeString(ebml);
        } else if (ebml instanceof Uint8Array) {
          buffer.writeBytes(ebml);
        } else if (ebml.id) {
          ebml.offset = buffer.pos + bufferFileOffset;
          buffer.writeUnsignedIntBE(ebml.id);
          if (Array.isArray(ebml.data)) {
            let sizePos, dataBegin, dataEnd;
            if (ebml.size === EBML_SIZE_UNKNOWN) {
              buffer.writeByte(255);
            } else if (ebml.size === EBML_SIZE_UNKNOWN_5_BYTES) {
              sizePos = buffer.pos;
              buffer.writeBytes([15, 255, 255, 255, 255]);
            } else {
              sizePos = buffer.pos;
              buffer.writeBytes([0, 0, 0, 0]);
            }
            dataBegin = buffer.pos;
            ebml.dataOffset = dataBegin + bufferFileOffset;
            writeEBML(buffer, bufferFileOffset, ebml.data);
            if (ebml.size !== EBML_SIZE_UNKNOWN && ebml.size !== EBML_SIZE_UNKNOWN_5_BYTES) {
              dataEnd = buffer.pos;
              ebml.size = dataEnd - dataBegin;
              buffer.seek(sizePos);
              buffer.writeEBMLVarIntWidth(ebml.size, 4);
              buffer.seek(dataEnd);
            }
          } else if (typeof ebml.data === "string") {
            buffer.writeEBMLVarInt(ebml.data.length);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeString(ebml.data);
          } else if (typeof ebml.data === "number") {
            if (!ebml.size) {
              ebml.size = buffer.measureUnsignedInt(ebml.data);
            }
            buffer.writeEBMLVarInt(ebml.size);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeUnsignedIntBE(ebml.data, ebml.size);
          } else if (ebml.data instanceof EBMLFloat64) {
            buffer.writeEBMLVarInt(8);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeDoubleBE(ebml.data.value);
          } else if (ebml.data instanceof EBMLFloat32) {
            buffer.writeEBMLVarInt(4);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeFloatBE(ebml.data.value);
          } else if (ebml.data instanceof Uint8Array) {
            buffer.writeEBMLVarInt(ebml.data.byteLength);
            ebml.dataOffset = buffer.pos + bufferFileOffset;
            buffer.writeBytes(ebml.data);
          } else {
            throw new Error("Bad EBML datatype " + typeof ebml.data);
          }
        } else {
          throw new Error("Bad EBML datatype " + typeof ebml.data);
        }
      }
      let WebMWriter2 = function(ArrayBufferDataStream, BlobBuffer) {
        return function(options) {
          let MAX_CLUSTER_DURATION_MSEC = 5e3, DEFAULT_TRACK_NUMBER = 1, writtenHeader = false, videoWidth = 0, videoHeight = 0, alphaBuffer = null, alphaBufferContext = null, alphaBufferData = null, clusterFrameBuffer = [], clusterStartTime = 0, clusterDuration = 0, optionDefaults = {
            quality: 0.95,
            transparent: false,
            alphaQuality: void 0,
            fileWriter: null,
            fd: null,
            frameDuration: null,
            frameRate: null
          }, seekPoints = {
            Cues: {id: new Uint8Array([28, 83, 187, 107]), positionEBML: null},
            SegmentInfo: {id: new Uint8Array([21, 73, 169, 102]), positionEBML: null},
            Tracks: {id: new Uint8Array([22, 84, 174, 107]), positionEBML: null}
          }, ebmlSegment, segmentDuration = {
            id: 17545,
            data: new EBMLFloat64(0)
          }, seekHead, cues = [], blobBuffer = new BlobBuffer(options.fileWriter || options.fd);
          function fileOffsetToSegmentRelative(fileOffset) {
            return fileOffset - ebmlSegment.dataOffset;
          }
          function convertAlphaToGrayscaleImage(source) {
            if (alphaBuffer === null || alphaBuffer.width !== source.width || alphaBuffer.height !== source.height) {
              alphaBuffer = document.createElement("canvas");
              alphaBuffer.width = source.width;
              alphaBuffer.height = source.height;
              alphaBufferContext = alphaBuffer.getContext("2d");
              alphaBufferData = alphaBufferContext.createImageData(alphaBuffer.width, alphaBuffer.height);
            }
            let sourceContext = source.getContext("2d"), sourceData = sourceContext.getImageData(0, 0, source.width, source.height).data, destData = alphaBufferData.data, dstCursor = 0, srcEnd = source.width * source.height * 4;
            for (let srcCursor = 3; srcCursor < srcEnd; srcCursor += 4) {
              let alpha = sourceData[srcCursor];
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = alpha;
              destData[dstCursor++] = 255;
            }
            alphaBufferContext.putImageData(alphaBufferData, 0, 0);
            return alphaBuffer;
          }
          function createSeekHead() {
            let seekPositionEBMLTemplate = {
              id: 21420,
              size: 5,
              data: 0
            }, result = {
              id: 290298740,
              data: []
            };
            for (let name in seekPoints) {
              let seekPoint = seekPoints[name];
              seekPoint.positionEBML = Object.create(seekPositionEBMLTemplate);
              result.data.push({
                id: 19899,
                data: [
                  {
                    id: 21419,
                    data: seekPoint.id
                  },
                  seekPoint.positionEBML
                ]
              });
            }
            return result;
          }
          function writeHeader() {
            seekHead = createSeekHead();
            let ebmlHeader = {
              id: 440786851,
              data: [
                {
                  id: 17030,
                  data: 1
                },
                {
                  id: 17143,
                  data: 1
                },
                {
                  id: 17138,
                  data: 4
                },
                {
                  id: 17139,
                  data: 8
                },
                {
                  id: 17026,
                  data: "webm"
                },
                {
                  id: 17031,
                  data: 2
                },
                {
                  id: 17029,
                  data: 2
                }
              ]
            }, segmentInfo = {
              id: 357149030,
              data: [
                {
                  id: 2807729,
                  data: 1e6
                },
                {
                  id: 19840,
                  data: "webm-writer-js"
                },
                {
                  id: 22337,
                  data: "webm-writer-js"
                },
                segmentDuration
              ]
            }, videoProperties = [
              {
                id: 176,
                data: videoWidth
              },
              {
                id: 186,
                data: videoHeight
              }
            ];
            if (options.transparent) {
              videoProperties.push({
                id: 21440,
                data: 1
              });
            }
            let tracks = {
              id: 374648427,
              data: [
                {
                  id: 174,
                  data: [
                    {
                      id: 215,
                      data: DEFAULT_TRACK_NUMBER
                    },
                    {
                      id: 29637,
                      data: DEFAULT_TRACK_NUMBER
                    },
                    {
                      id: 156,
                      data: 0
                    },
                    {
                      id: 2274716,
                      data: "und"
                    },
                    {
                      id: 134,
                      data: "V_VP8"
                    },
                    {
                      id: 2459272,
                      data: "VP8"
                    },
                    {
                      id: 131,
                      data: 1
                    },
                    {
                      id: 224,
                      data: videoProperties
                    }
                  ]
                }
              ]
            };
            ebmlSegment = {
              id: 408125543,
              size: EBML_SIZE_UNKNOWN_5_BYTES,
              data: [
                seekHead,
                segmentInfo,
                tracks
              ]
            };
            let bufferStream = new ArrayBufferDataStream(256);
            writeEBML(bufferStream, blobBuffer.pos, [ebmlHeader, ebmlSegment]);
            blobBuffer.write(bufferStream.getAsDataArray());
            seekPoints.SegmentInfo.positionEBML.data = fileOffsetToSegmentRelative(segmentInfo.offset);
            seekPoints.Tracks.positionEBML.data = fileOffsetToSegmentRelative(tracks.offset);
            writtenHeader = true;
          }
          function createBlockGroupForTransparentKeyframe(keyframe) {
            let block, blockAdditions, bufferStream = new ArrayBufferDataStream(1 + 2 + 1);
            if (!(keyframe.trackNumber > 0 && keyframe.trackNumber < 127)) {
              throw new Error("TrackNumber must be > 0 and < 127");
            }
            bufferStream.writeEBMLVarInt(keyframe.trackNumber);
            bufferStream.writeU16BE(keyframe.timecode);
            bufferStream.writeByte(0);
            block = {
              id: 161,
              data: [
                bufferStream.getAsDataArray(),
                keyframe.frame
              ]
            };
            blockAdditions = {
              id: 30113,
              data: [
                {
                  id: 166,
                  data: [
                    {
                      id: 238,
                      data: 1
                    },
                    {
                      id: 165,
                      data: keyframe.alpha
                    }
                  ]
                }
              ]
            };
            return {
              id: 160,
              data: [
                block,
                blockAdditions
              ]
            };
          }
          function createSimpleBlockForKeyframe(keyframe) {
            let bufferStream = new ArrayBufferDataStream(1 + 2 + 1);
            if (!(keyframe.trackNumber > 0 && keyframe.trackNumber < 127)) {
              throw new Error("TrackNumber must be > 0 and < 127");
            }
            bufferStream.writeEBMLVarInt(keyframe.trackNumber);
            bufferStream.writeU16BE(keyframe.timecode);
            bufferStream.writeByte(1 << 7);
            return {
              id: 163,
              data: [
                bufferStream.getAsDataArray(),
                keyframe.frame
              ]
            };
          }
          function createContainerForKeyframe(keyframe) {
            if (keyframe.alpha) {
              return createBlockGroupForTransparentKeyframe(keyframe);
            }
            return createSimpleBlockForKeyframe(keyframe);
          }
          function createCluster(cluster) {
            return {
              id: 524531317,
              data: [
                {
                  id: 231,
                  data: Math.round(cluster.timecode)
                }
              ]
            };
          }
          function addCuePoint(trackIndex, clusterTime, clusterFileOffset) {
            cues.push({
              id: 187,
              data: [
                {
                  id: 179,
                  data: clusterTime
                },
                {
                  id: 183,
                  data: [
                    {
                      id: 247,
                      data: trackIndex
                    },
                    {
                      id: 241,
                      data: fileOffsetToSegmentRelative(clusterFileOffset)
                    }
                  ]
                }
              ]
            });
          }
          function writeCues() {
            let ebml = {
              id: 475249515,
              data: cues
            }, cuesBuffer = new ArrayBufferDataStream(16 + cues.length * 32);
            writeEBML(cuesBuffer, blobBuffer.pos, ebml);
            blobBuffer.write(cuesBuffer.getAsDataArray());
            seekPoints.Cues.positionEBML.data = fileOffsetToSegmentRelative(ebml.offset);
          }
          function flushClusterFrameBuffer() {
            if (clusterFrameBuffer.length === 0) {
              return;
            }
            let rawImageSize = 0;
            for (let i = 0; i < clusterFrameBuffer.length; i++) {
              rawImageSize += clusterFrameBuffer[i].frame.length + (clusterFrameBuffer[i].alpha ? clusterFrameBuffer[i].alpha.length : 0);
            }
            let buffer = new ArrayBufferDataStream(rawImageSize + clusterFrameBuffer.length * 64), cluster = createCluster({
              timecode: Math.round(clusterStartTime)
            });
            for (let i = 0; i < clusterFrameBuffer.length; i++) {
              cluster.data.push(createContainerForKeyframe(clusterFrameBuffer[i]));
            }
            writeEBML(buffer, blobBuffer.pos, cluster);
            blobBuffer.write(buffer.getAsDataArray());
            addCuePoint(DEFAULT_TRACK_NUMBER, Math.round(clusterStartTime), cluster.offset);
            clusterFrameBuffer = [];
            clusterStartTime += clusterDuration;
            clusterDuration = 0;
          }
          function validateOptions() {
            if (!options.frameDuration) {
              if (options.frameRate) {
                options.frameDuration = 1e3 / options.frameRate;
              } else {
                throw new Error("Missing required frameDuration or frameRate setting");
              }
            }
            options.quality = Math.max(Math.min(options.quality, 0.99999), 0);
            if (options.alphaQuality === void 0) {
              options.alphaQuality = options.quality;
            } else {
              options.alphaQuality = Math.max(Math.min(options.alphaQuality, 0.99999), 0);
            }
          }
          function addFrameToCluster(frame) {
            frame.trackNumber = DEFAULT_TRACK_NUMBER;
            frame.timecode = Math.round(clusterDuration);
            clusterFrameBuffer.push(frame);
            clusterDuration += frame.duration;
            if (clusterDuration >= MAX_CLUSTER_DURATION_MSEC) {
              flushClusterFrameBuffer();
            }
          }
          function rewriteSeekHead() {
            let seekHeadBuffer = new ArrayBufferDataStream(seekHead.size), oldPos = blobBuffer.pos;
            writeEBML(seekHeadBuffer, seekHead.dataOffset, seekHead.data);
            blobBuffer.seek(seekHead.dataOffset);
            blobBuffer.write(seekHeadBuffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          function rewriteDuration() {
            let buffer = new ArrayBufferDataStream(8), oldPos = blobBuffer.pos;
            buffer.writeDoubleBE(clusterStartTime);
            blobBuffer.seek(segmentDuration.dataOffset);
            blobBuffer.write(buffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          function rewriteSegmentLength() {
            let buffer = new ArrayBufferDataStream(10), oldPos = blobBuffer.pos;
            buffer.writeUnsignedIntBE(ebmlSegment.id);
            buffer.writeEBMLVarIntWidth(blobBuffer.pos - ebmlSegment.dataOffset, 5);
            blobBuffer.seek(ebmlSegment.offset);
            blobBuffer.write(buffer.getAsDataArray());
            blobBuffer.seek(oldPos);
          }
          this.addFrame = function(frame, alpha, overrideFrameDuration) {
            if (!writtenHeader) {
              videoWidth = frame.width || 0;
              videoHeight = frame.height || 0;
              writeHeader();
            }
            let keyframe = extractKeyframeFromWebP(renderAsWebP(frame, options.quality)), frameDuration, frameAlpha = null;
            if (overrideFrameDuration) {
              frameDuration = overrideFrameDuration;
            } else if (typeof alpha == "number") {
              frameDuration = alpha;
            } else {
              frameDuration = options.frameDuration;
            }
            if (options.transparent) {
              if (alpha instanceof HTMLCanvasElement || typeof alpha === "string") {
                frameAlpha = alpha;
              } else if (keyframe.hasAlpha) {
                frameAlpha = convertAlphaToGrayscaleImage(frame);
              }
            }
            addFrameToCluster({
              frame: keyframe.frame,
              duration: frameDuration,
              alpha: frameAlpha ? extractKeyframeFromWebP(renderAsWebP(frameAlpha, options.alphaQuality)).frame : null
            });
          };
          this.complete = function() {
            if (!writtenHeader) {
              writeHeader();
            }
            flushClusterFrameBuffer();
            writeCues();
            rewriteSeekHead();
            rewriteDuration();
            rewriteSegmentLength();
            return blobBuffer.complete("video/webm");
          };
          this.getWrittenSize = function() {
            return blobBuffer.length;
          };
          options = extend(optionDefaults, options || {});
          validateOptions();
        };
      };
      if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = WebMWriter2;
      } else {
        window.WebMWriter = WebMWriter2(window.ArrayBufferDataStream, window.BlobBuffer);
      }
    })();
  });

  // node_modules/webm-writer/ArrayBufferDataStream.js
  var require_ArrayBufferDataStream = __commonJS((exports, module) => {
    "use strict";
    (function() {
      let ArrayBufferDataStream = function(length) {
        this.data = new Uint8Array(length);
        this.pos = 0;
      };
      ArrayBufferDataStream.prototype.seek = function(toOffset) {
        this.pos = toOffset;
      };
      ArrayBufferDataStream.prototype.writeBytes = function(arr) {
        for (let i = 0; i < arr.length; i++) {
          this.data[this.pos++] = arr[i];
        }
      };
      ArrayBufferDataStream.prototype.writeByte = function(b) {
        this.data[this.pos++] = b;
      };
      ArrayBufferDataStream.prototype.writeU8 = ArrayBufferDataStream.prototype.writeByte;
      ArrayBufferDataStream.prototype.writeU16BE = function(u) {
        this.data[this.pos++] = u >> 8;
        this.data[this.pos++] = u;
      };
      ArrayBufferDataStream.prototype.writeDoubleBE = function(d) {
        let bytes = new Uint8Array(new Float64Array([d]).buffer);
        for (let i = bytes.length - 1; i >= 0; i--) {
          this.writeByte(bytes[i]);
        }
      };
      ArrayBufferDataStream.prototype.writeFloatBE = function(d) {
        let bytes = new Uint8Array(new Float32Array([d]).buffer);
        for (let i = bytes.length - 1; i >= 0; i--) {
          this.writeByte(bytes[i]);
        }
      };
      ArrayBufferDataStream.prototype.writeString = function(s) {
        for (let i = 0; i < s.length; i++) {
          this.data[this.pos++] = s.charCodeAt(i);
        }
      };
      ArrayBufferDataStream.prototype.writeEBMLVarIntWidth = function(i, width) {
        switch (width) {
          case 1:
            this.writeU8(1 << 7 | i);
            break;
          case 2:
            this.writeU8(1 << 6 | i >> 8);
            this.writeU8(i);
            break;
          case 3:
            this.writeU8(1 << 5 | i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          case 4:
            this.writeU8(1 << 4 | i >> 24);
            this.writeU8(i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          case 5:
            this.writeU8(1 << 3 | i / 4294967296 & 7);
            this.writeU8(i >> 24);
            this.writeU8(i >> 16);
            this.writeU8(i >> 8);
            this.writeU8(i);
            break;
          default:
            throw new Error("Bad EBML VINT size " + width);
        }
      };
      ArrayBufferDataStream.prototype.measureEBMLVarInt = function(val) {
        if (val < (1 << 7) - 1) {
          return 1;
        } else if (val < (1 << 14) - 1) {
          return 2;
        } else if (val < (1 << 21) - 1) {
          return 3;
        } else if (val < (1 << 28) - 1) {
          return 4;
        } else if (val < 34359738367) {
          return 5;
        } else {
          throw new Error("EBML VINT size not supported " + val);
        }
      };
      ArrayBufferDataStream.prototype.writeEBMLVarInt = function(i) {
        this.writeEBMLVarIntWidth(i, this.measureEBMLVarInt(i));
      };
      ArrayBufferDataStream.prototype.writeUnsignedIntBE = function(u, width) {
        if (width === void 0) {
          width = this.measureUnsignedInt(u);
        }
        switch (width) {
          case 5:
            this.writeU8(Math.floor(u / 4294967296));
          case 4:
            this.writeU8(u >> 24);
          case 3:
            this.writeU8(u >> 16);
          case 2:
            this.writeU8(u >> 8);
          case 1:
            this.writeU8(u);
            break;
          default:
            throw new Error("Bad UINT size " + width);
        }
      };
      ArrayBufferDataStream.prototype.measureUnsignedInt = function(val) {
        if (val < 1 << 8) {
          return 1;
        } else if (val < 1 << 16) {
          return 2;
        } else if (val < 1 << 24) {
          return 3;
        } else if (val < 4294967296) {
          return 4;
        } else {
          return 5;
        }
      };
      ArrayBufferDataStream.prototype.getAsDataArray = function() {
        if (this.pos < this.data.byteLength) {
          return this.data.subarray(0, this.pos);
        } else if (this.pos == this.data.byteLength) {
          return this.data;
        } else {
          throw new Error("ArrayBufferDataStream's pos lies beyond end of buffer");
        }
      };
      if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = ArrayBufferDataStream;
      } else {
        window.ArrayBufferDataStream = ArrayBufferDataStream;
      }
    })();
  });

  // node_modules/webm-writer/BlobBuffer.js
  var require_BlobBuffer = __commonJS((exports, module) => {
    "use strict";
    (function() {
      let BlobBuffer = function(fs) {
        return function(destination) {
          let buffer = [], writePromise = Promise.resolve(), fileWriter = null, fd = null;
          if (destination && destination.constructor.name === "FileWriter") {
            fileWriter = destination;
          } else if (fs && destination) {
            fd = destination;
          }
          this.pos = 0;
          this.length = 0;
          function readBlobAsBuffer(blob) {
            return new Promise(function(resolve, reject) {
              let reader = new FileReader();
              reader.addEventListener("loadend", function() {
                resolve(reader.result);
              });
              reader.readAsArrayBuffer(blob);
            });
          }
          function convertToUint8Array(thing) {
            return new Promise(function(resolve, reject) {
              if (thing instanceof Uint8Array) {
                resolve(thing);
              } else if (thing instanceof ArrayBuffer || ArrayBuffer.isView(thing)) {
                resolve(new Uint8Array(thing));
              } else if (thing instanceof Blob) {
                resolve(readBlobAsBuffer(thing).then(function(buffer2) {
                  return new Uint8Array(buffer2);
                }));
              } else {
                resolve(readBlobAsBuffer(new Blob([thing])).then(function(buffer2) {
                  return new Uint8Array(buffer2);
                }));
              }
            });
          }
          function measureData(data) {
            let result = data.byteLength || data.length || data.size;
            if (!Number.isInteger(result)) {
              throw new Error("Failed to determine size of element");
            }
            return result;
          }
          this.seek = function(offset) {
            if (offset < 0) {
              throw new Error("Offset may not be negative");
            }
            if (isNaN(offset)) {
              throw new Error("Offset may not be NaN");
            }
            if (offset > this.length) {
              throw new Error("Seeking beyond the end of file is not allowed");
            }
            this.pos = offset;
          };
          this.write = function(data) {
            let newEntry = {
              offset: this.pos,
              data,
              length: measureData(data)
            }, isAppend = newEntry.offset >= this.length;
            this.pos += newEntry.length;
            this.length = Math.max(this.length, this.pos);
            writePromise = writePromise.then(function() {
              if (fd) {
                return new Promise(function(resolve, reject) {
                  convertToUint8Array(newEntry.data).then(function(dataArray) {
                    let totalWritten = 0, buffer2 = Buffer.from(dataArray.buffer), handleWriteComplete = function(err, written, buffer3) {
                      totalWritten += written;
                      if (totalWritten >= buffer3.length) {
                        resolve();
                      } else {
                        fs.write(fd, buffer3, totalWritten, buffer3.length - totalWritten, newEntry.offset + totalWritten, handleWriteComplete);
                      }
                    };
                    fs.write(fd, buffer2, 0, buffer2.length, newEntry.offset, handleWriteComplete);
                  });
                });
              } else if (fileWriter) {
                return new Promise(function(resolve, reject) {
                  fileWriter.onwriteend = resolve;
                  fileWriter.seek(newEntry.offset);
                  fileWriter.write(new Blob([newEntry.data]));
                });
              } else if (!isAppend) {
                for (let i = 0; i < buffer.length; i++) {
                  let entry = buffer[i];
                  if (!(newEntry.offset + newEntry.length <= entry.offset || newEntry.offset >= entry.offset + entry.length)) {
                    if (newEntry.offset < entry.offset || newEntry.offset + newEntry.length > entry.offset + entry.length) {
                      throw new Error("Overwrite crosses blob boundaries");
                    }
                    if (newEntry.offset == entry.offset && newEntry.length == entry.length) {
                      entry.data = newEntry.data;
                      return;
                    } else {
                      return convertToUint8Array(entry.data).then(function(entryArray) {
                        entry.data = entryArray;
                        return convertToUint8Array(newEntry.data);
                      }).then(function(newEntryArray) {
                        newEntry.data = newEntryArray;
                        entry.data.set(newEntry.data, newEntry.offset - entry.offset);
                      });
                    }
                  }
                }
              }
              buffer.push(newEntry);
            });
          };
          this.complete = function(mimeType) {
            if (fd || fileWriter) {
              writePromise = writePromise.then(function() {
                return null;
              });
            } else {
              writePromise = writePromise.then(function() {
                let result = [];
                for (let i = 0; i < buffer.length; i++) {
                  result.push(buffer[i].data);
                }
                return new Blob(result, {type: mimeType});
              });
            }
            return writePromise;
          };
        };
      };
      if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
        module.exports = BlobBuffer;
      } else {
        window.BlobBuffer = BlobBuffer(null);
      }
    })();
  });

  // node_modules/webm-writer/browser.js
  var require_browser = __commonJS((exports, module) => {
    module.exports = require_WebMWriter()(require_ArrayBufferDataStream(), require_BlobBuffer()(null));
  });

  // src/mandala.ts
  class Mandala {
    constructor(stage2) {
      this.matrix = new DOMMatrix();
      this.scale = 1;
      this.rotation = 0;
    }
    setScale(scale) {
      this.scale = scale;
      this.update();
    }
    setRotation(angle) {
      this.rotation = angle;
      this.update();
    }
    setPattern(pattern) {
      this.pattern = pattern;
      this.update();
    }
    update() {
      if (!this.pattern) {
        return;
      }
      try {
        this.pattern.setTransform(this.matrix.scale(this.scale).rotate(this.rotation));
      } catch (e) {
        this.matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
        this.pattern.setTransform(this.matrix.scale(this.scale).rotate(this.rotation));
      }
    }
    render(ctx, params) {
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const halfwidth = width / 2;
      const halfheight = height / 2;
      const diagonal = Math.sqrt(width * width + height * height);
      const halfdiag = diagonal / 2;
      ctx.save();
      ctx.fillStyle = params.backgroundColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      let angleIncrease = Math.PI / params.symmetries;
      ctx.translate(halfwidth, halfheight);
      ctx.rotate(params.angle / 180 * Math.PI);
      for (let s = 0; s < params.symmetries; s++) {
        ctx.rotate(angleIncrease * 2);
        this.drawSlice(ctx, halfdiag, 1, angleIncrease, params.offset.x * width, params.offset.y * height);
        ctx.scale(1, -1);
        this.drawSlice(ctx, halfdiag, 1, angleIncrease, params.offset.x * width, params.offset.y * height);
        ctx.scale(1, -1);
      }
      ctx.restore();
    }
    drawSlice(ctx, radius, scale, sliceAngle, xOffset, yOffset) {
      ctx.save();
      xOffset = (xOffset || 0) * scale;
      yOffset = (yOffset || 0) * scale;
      ctx.translate(xOffset, yOffset);
      ctx.fillStyle = this.pattern;
      ctx.beginPath();
      ctx.moveTo(-xOffset, -yOffset);
      ctx.lineTo(radius - xOffset, -yOffset);
      ctx.lineTo(radius - xOffset, Math.tan(sliceAngle) * radius - yOffset);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  var mandala_default = Mandala;

  // src/stage.ts
  class Stage {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.ctx = canvas.getContext("2d");
    }
    clear(color) {
      if (color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
      } else {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    }
    drawText(text, font = "bold 48px sans-serif") {
      this.ctx.font = font;
      const textWidth = this.ctx.measureText(text).width;
      this.ctx.fillText(text, this.width / 2 - textWidth / 2, this.height / 2);
    }
    setScale(scale) {
      this.scale = scale;
      this.resize();
    }
    setWidth(width) {
      this.width = width;
      this.resize();
    }
    setHeight(height) {
      this.height = height;
      this.resize();
    }
    resize() {
      this.canvas.width = this.width;
      this.canvas.style.width = `${this.width / this.scale}px`;
      this.canvas.height = this.height;
      this.canvas.style.height = `${this.height / this.scale}px`;
    }
  }
  var stage_default = Stage;

  // src/easing.ts
  const Easing = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => --t * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - --t * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    easeInQuint: (t) => t * t * t * t * t,
    easeOutQuint: (t) => 1 + --t * t * t * t * t,
    easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
  };
  var easing_default = Easing;

  // src/events.ts
  class Events {
    constructor() {
      this.listeners = {};
    }
    addEventListener(eventName, eventCallback) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName].push(eventCallback);
    }
    removeEventListener(eventName, eventCallback) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName] = this.listeners[eventName].filter((callback) => callback !== eventCallback);
    }
    trigger(type, name, value) {
      this.listeners[type] && this.listeners[type].forEach((callback) => callback({type, name, value}));
    }
  }
  var events_default = Events;

  // src/gui.ts
  const tweakpane = __toModule(require_tweakpane());
  const EssentialsPlugin = __toModule(require_tweakpane_plugin_essentials());
  class Gui extends events_default {
    constructor(params) {
      super();
      this.listeners = {};
      this.config = params;
      this.gui = new tweakpane.Pane({load: JSON});
      this.gui.registerPlugin(EssentialsPlugin);
      const handle = (name) => (value) => {
        this.triggerChange(name, value);
      };
      const guiCanvas = this.gui.addFolder({
        title: "Canvas",
        expanded: true
      });
      guiCanvas.addInput(params, "backgroundColor", {
        label: "Background color"
      }).on("change", handle("backgroundColor"));
      guiCanvas.addInput(params, "width", {
        min: 10,
        max: 4096,
        step: 1
      }).on("change", handle("width"));
      guiCanvas.addInput(params, "height", {
        min: 10,
        max: 4096,
        step: 1
      }).on("change", handle("height"));
      guiCanvas.addInput(params, "scale", {
        min: 1,
        max: 4,
        step: 1
      }).on("change", handle("scale"));
      guiCanvas.addInput(params, "angle", {
        min: -360,
        max: 360
      }).on("change", handle("angle"));
      const guiPattern = this.gui.addFolder({
        title: "Pattern",
        expanded: true
      });
      guiPattern.addInput(params, "symmetries", {
        min: 4,
        max: 32,
        step: 1
      }).on("change", handle("symmetries"));
      guiPattern.addInput(params, "patternScale", {
        label: "scale",
        min: 0.05,
        max: 4,
        step: 0.05
      }).on("change", handle("patternScale"));
      guiPattern.addInput(params, "patternAngle", {
        label: "angle",
        min: -360,
        max: 360,
        step: 1
      }).on("change", handle("patternAngle"));
      guiPattern.addInput(params, "offset", {
        x: {
          min: -1,
          max: 1,
          step: 0.01
        },
        y: {
          min: -1,
          max: 1,
          step: 0.01
        }
      }).on("change", handle("offset"));
      guiPattern.addButton({title: "Load pattern..."}).on("click", () => {
        document.getElementById("patternFile").click();
      });
      guiPattern.addButton({title: "Save Image..."}).on("click", () => this.trigger("click", "saveImage"));
      const guiAnimation = this.gui.addFolder({
        title: "Animation",
        expanded: true
      });
      guiAnimation.addInput(params, "editAllKeyframes", {
        label: "Edit All Keyframes"
      }).on("change", handle("editAllKeyframes"));
      guiAnimation.addInput(params, "duration", {
        label: "Duration",
        min: 1,
        max: 600,
        step: 1
      }).on("change", handle("duration"));
      guiAnimation.addInput(params, "easing", {
        label: "Easing",
        options: Object.keys(easing_default).reduce((result, current) => {
          result[current] = current;
          return result;
        }, {})
      }).on("change", handle("easing"));
      guiAnimation.addInput(params, "currentKeyframe", {
        label: "Current Keyframe",
        disabled: true,
        step: 1
      });
      let newButton, playButton, stopButton, renderButton, nextButton, prevButton, deleteButton, resetButton, copyButton, pasteButton, randomizeButton;
      this.updateAnimationGui = () => {
        if (this.config.isPlayingAnimation) {
          playButton.hidden = true;
          stopButton.hidden = false;
        } else {
          playButton.hidden = false;
          stopButton.hidden = true;
        }
        const isBusy = this.config.isPlayingAnimation || this.config.isRecordingAnimation || this.config.isBusy;
        if (isBusy) {
          renderButton.disabled = prevButton.disabled = nextButton.disabled = deleteButton.disabled = resetButton.disabled = pasteButton.disabled = randomizeButton.disabled = newButton.disabled = copyButton.disabled = true;
          return;
        }
        playButton.disabled = renderButton.disabled = this.config.keyframes.length < 2;
        if (this.config.isPlayingAnimation) {
          playButton.disabled = false;
        }
        prevButton.disabled = this.config.currentKeyframe <= 0;
        nextButton.disabled = this.config.currentKeyframe < 0 || this.config.currentKeyframe >= this.config.totalKeyframes - 1;
        deleteButton.disabled = this.config.totalKeyframes <= 1;
        resetButton.disabled = this.config.totalKeyframes <= 1;
        pasteButton.disabled = !this.config.keyframeClipboard;
        randomizeButton.disabled = newButton.disabled = copyButton.disabled = !this.config.file;
      };
      prevButton = guiAnimation.addButton({title: "Previous keyframe", disabled: true}).on("click", () => {
        this.trigger("click", "prevKeyframe");
        this.updateAnimationGui();
      });
      nextButton = guiAnimation.addButton({title: "Next keyframe", disabled: true}).on("click", () => {
        this.trigger("click", "nextKeyframe");
        this.updateAnimationGui();
      });
      guiAnimation.addSeparator();
      newButton = guiAnimation.addButton({title: "New keyframe", disabled: true}).on("click", () => {
        this.trigger("click", "newKeyframe");
        this.updateAnimationGui();
      });
      deleteButton = guiAnimation.addButton({title: "Delete keyframe", disabled: true}).on("click", () => {
        this.trigger("click", "deleteKeyframe");
        this.updateAnimationGui();
      });
      resetButton = guiAnimation.addButton({title: "Clear keyframes", disabled: true}).on("click", () => {
        this.trigger("click", "resetKeyframes");
        this.updateAnimationGui();
      });
      guiAnimation.addSeparator();
      copyButton = guiAnimation.addButton({title: "Copy keyframe", disabled: true}).on("click", () => {
        this.trigger("click", "copyKeyframe");
        this.updateAnimationGui();
      });
      pasteButton = guiAnimation.addButton({title: "Paste keyframe", disabled: true}).on("click", () => {
        this.trigger("click", "pasteKeyframe");
        this.updateAnimationGui();
      });
      guiAnimation.addInput(params, "randomizeStrength", {
        label: "Randomization Strength",
        min: 0,
        max: 1,
        step: 0.01
      });
      randomizeButton = guiAnimation.addButton({title: "Randomize", disabled: true}).on("click", () => this.trigger("click", "randomize"));
      guiAnimation.addSeparator();
      guiAnimation.addInput(params, "fps", {
        label: "FPS",
        min: 1,
        max: 60,
        step: 1
      }).on("change", handle("fps"));
      guiAnimation.addInput(params, "loop", {label: "Loop"});
      guiAnimation.addInput(params, "firstFrameAsLastFrame", {
        label: "First frame as last"
      });
      playButton = guiAnimation.addButton({title: "Play animation", disabled: true}).on("click", () => {
        this.trigger("click", "playAnimation");
        this.updateAnimationGui();
      });
      stopButton = guiAnimation.addButton({title: "Stop", hidden: true}).on("click", () => {
        this.trigger("click", "stopAnimation");
        this.updateAnimationGui();
      });
      renderButton = guiAnimation.addButton({title: "Export animation...", disabled: true}).on("click", () => {
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
  var gui_default = Gui;

  // src/config.ts
  const randomizeValue = (value, min, max, strength) => {
    const newValue = Math.random() * (max - min) + min;
    return Math.min(max, Math.max(min, value + (newValue - value) * strength));
  };
  class Config {
    constructor(params) {
      this.import(params);
    }
    toKeyframe() {
      return {
        angle: this.angle,
        offset: {
          x: this.offset.x,
          y: this.offset.y
        },
        patternScale: this.patternScale,
        patternAngle: this.patternAngle,
        symmetries: this.symmetries,
        easing: this.easing,
        duration: this.duration
      };
    }
    fromKeyframe(keyframeIndex) {
      if (this.keyframes.length < 1) {
        return;
      }
      keyframeIndex = keyframeIndex === void 0 ? this.currentKeyframe : keyframeIndex;
      const keyframe = this.keyframes[keyframeIndex];
      this.angle = keyframe.angle;
      this.offset = {
        x: keyframe.offset.x,
        y: keyframe.offset.y
      };
      this.patternScale = keyframe.patternScale;
      this.patternAngle = keyframe.patternAngle;
      this.symmetries = keyframe.symmetries;
      this.easing = keyframe.easing;
      this.duration = keyframe.duration;
    }
    updateKeyframe(newKeyframeParams) {
      this.keyframes[this.currentKeyframe] = newKeyframeParams || this.toKeyframe();
    }
    addKeyframe() {
      this.keyframes[this.currentKeyframe] = this.toKeyframe();
      this.keyframes.splice(this.currentKeyframe, 0, this.toKeyframe());
      this.currentKeyframe++;
      this.totalKeyframes = this.keyframes.length;
    }
    nextKeyframe() {
      this.updateKeyframe();
      if (this.currentKeyframe < this.totalKeyframes - 1) {
        this.currentKeyframe++;
        this.fromKeyframe();
      }
    }
    prevKeyframe() {
      this.updateKeyframe();
      if (this.currentKeyframe > 0) {
        this.currentKeyframe--;
        this.fromKeyframe();
      }
    }
    copyKeyframe() {
      this.keyframeClipboard = this.toKeyframe();
    }
    pasteKeyframe() {
      this.updateKeyframe(this.keyframeClipboard);
      this.fromKeyframe();
    }
    deleteKeyframe() {
      if (this.totalKeyframes > 0) {
        this.keyframes.splice(this.currentKeyframe, 1);
        Math.max(0, this.currentKeyframe--);
        this.totalKeyframes = this.keyframes.length;
        this.fromKeyframe();
      }
    }
    resetKeyframes() {
      this.keyframes = [this.keyframes[0]];
      this.totalKeyframes = this.keyframes.length;
      this.currentKeyframe = 0;
    }
    randomize() {
      this.angle = randomizeValue(this.angle, -180, 180, this.randomizeStrength);
      this.offset.x = randomizeValue(this.offset.x, -1, 1, this.randomizeStrength);
      this.offset.y = randomizeValue(this.offset.y, -1, 1, this.randomizeStrength);
      this.patternScale = randomizeValue(this.patternScale, 0.1, 4, this.randomizeStrength);
      this.patternAngle = randomizeValue(this.patternAngle, -180, 180, this.randomizeStrength);
      this.symmetries = Math.floor(randomizeValue(this.symmetries, 4, 16, this.randomizeStrength));
    }
    export() {
      return {
        width: this.width,
        height: this.height,
        scale: this.scale,
        angle: this.angle,
        backgroundColor: this.backgroundColor,
        randomizeStrength: this.randomizeStrength,
        loop: this.loop,
        firstFrameAsLastFrame: this.firstFrameAsLastFrame,
        keyframes: [...this.keyframes],
        fps: this.fps
      };
    }
    import(params) {
      params = params || {};
      this.width = params.width || 2048;
      this.height = params.height || 2048;
      this.scale = params.scale || 4;
      this.angle = params.angle || 0;
      this.offset = params.offset || {x: 0, y: 0};
      this.patternScale = params.patternScale || 1;
      this.patternAngle = params.patternAngle || 0;
      this.symmetries = params.symmetries || 7;
      this.backgroundColor = "#000";
      this.randomizeStrength = 1;
      this.file = void 0;
      this.isPlayingAnimation = false;
      this.isRecordingAnimation = false;
      this.isBusy = false;
      this.loop = false;
      this.firstFrameAsLastFrame = false;
      this.keyframes = params.keyframes || [];
      this.keyframeClipboard = void 0;
      this.fps = params.fps || 30;
      this.editAllKeyframes = false;
      this.duration = this.fps;
      this.totalKeyframes = 0;
      this.currentKeyframe = 0;
      this.easing = "linear";
      this.fromKeyframe();
    }
  }
  var config_default = Config;

  // src/video.ts
  const webm_writer = __toModule(require_browser());
  class Video {
    constructor(params = {}) {
      this.config = {
        quality: params.quality || 0.95,
        frameRate: params.frameRate || 30,
        transparent: false,
        alphaQuality: void 0
      };
      this.reset();
    }
    reset() {
      this.video = new webm_writer.default(this.config);
    }
    save(filename = "mandala.webm") {
      this.video.complete().then((blob) => {
        const anchor = document.createElement("a");
        anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
        anchor.download = filename;
        anchor.click();
      });
    }
    addFrame(canvas) {
      this.video.addFrame(canvas);
    }
  }
  var video_default = Video;

  // src/player.ts
  class Player extends events_default {
    play(mandala2, stage2, config2) {
      this.mandala = mandala2;
      if (window.OffscreenCanvas) {
        this.ctx = new OffscreenCanvas(stage2.width, stage2.height).getContext("2d");
      } else {
        this.ctx = stage2.ctx;
      }
      this.keyframes = [...config2.keyframes];
      if (config2.firstFrameAsLastFrame) {
        this.keyframes.push(this.keyframes[0]);
      }
      this.currentFrame = 0;
      this.currentKeyframe = -1;
      this.nextKeyframe();
      this.trigger("started", this);
      this.delay = config2.isRecordingAnimation ? 1 : 1e3 / config2.fps;
      this.loop = !config2.isRecordingAnimation && config2.loop;
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
      this.easing = easing_default[frame.easing];
    }
    interpolate(from, to, t) {
      const k = this.easing(t);
      return {
        angle: (to.angle - from.angle) * k + from.angle,
        offset: {
          x: (to.offset.x - from.offset.x) * k + from.offset.x,
          y: (to.offset.y - from.offset.y) * k + from.offset.y
        },
        patternScale: (to.patternScale - from.patternScale) * k + from.patternScale,
        patternAngle: (to.patternAngle - from.patternAngle) * k + from.patternAngle,
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
  var player_default = Player;

  // src/helpers.ts
  const on = (context, eventType, eventCallback, useCapture) => {
    if (context && eventType && eventCallback) {
      var events3 = String(eventType).split(" ");
      while (events3.length) {
        eventType = events3.pop();
        if (context.addEventListener) {
          context.addEventListener(eventType, eventCallback, useCapture);
        } else {
          context.attachEvent("on" + eventType, eventCallback, useCapture);
        }
      }
    }
  };

  // src/main.ts
  class MandalaApp {
    constructor(node) {
      const canvas = document.querySelector(node);
      this.config = new config_default();
      this.gui = new gui_default(this.config);
      this.mandala = new mandala_default();
      this.player = new player_default();
      this.stage = new stage_default(canvas);
      this.stage.clear("white");
      this.stage.setScale(this.gui.getValue("scale"));
      this.stage.drawText("DROP IMAGE HERE");
      this.bindEvents();
    }
    bindEvents() {
      let isDragging = false;
      on(document.getElementById("patternFile"), "change", (e) => {
        this.onFileChange(e.target.files[0]);
      });
      on(this.stage.canvas, "mousedown", (e) => {
        if (e.button === 0) {
          isDragging = true;
        }
      });
      on(document, "mouseup", (e) => {
        isDragging = false;
      });
      on(document, "mousemove", (e) => {
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
      const lastPosition = {x: void 0, y: void 0};
      on(this.stage.canvas, "touchstart", (e) => {
        isDragging = true;
        const touch = event.changedTouches[0];
        lastPosition.x = touch.clientX;
        lastPosition.y = touch.clientY;
      });
      on(document, "touchend touchcancel", (e) => {
        isDragging = false;
      });
      on(document, "touchmove", (e) => {
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
      on(this.stage.canvas, "wheel", (e) => {
        e.preventDefault();
        this.gui.increaseValue("patternScale", e.deltaY * -1e-3);
      });
      on(window, "dragover", (e) => e.preventDefault());
      on(window, "drop", (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        this.onFileChange(file);
      });
      const editInAllKeyframes = (name, value) => {
        if (this.config.editAllKeyframes) {
          this.config.keyframes.forEach((kf) => kf[name] = value);
        }
      };
      on(this.gui, "change", ({name, value: {value}}) => {
        switch (name) {
          case "patternAngle":
            this.mandala.setRotation(value);
            editInAllKeyframes(name, value);
            break;
          case "patternScale":
            this.mandala.setScale(value);
            editInAllKeyframes(name, value);
            break;
          case "scale":
            this.stage.setScale(value);
            editInAllKeyframes(name, value);
            break;
          case "width":
            this.stage.setWidth(value);
            break;
          case "height":
            this.stage.setHeight(value);
            break;
          case "editAllKeyframes":
            if (value) {
              document.body.classList.add("warning");
            } else {
              document.body.classList.remove("warning");
            }
            break;
          case "duration":
          case "angle":
          case "offset":
          case "symmetries":
          case "easing":
            editInAllKeyframes(name, value);
            break;
        }
        this.render();
      });
      on(this.gui, "click", ({name}) => {
        switch (name) {
          case "saveImage":
            const a = document.createElement("a");
            a.download = "mandala.png";
            a.href = document.getElementById("stage").toDataURL("image/png").replace(/^data:image\/[^;]/, "data:application/octet-stream");
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
          case "exportAnimation":
            this.config.isRecordingAnimation = true;
          case "playAnimation":
            this.config.updateKeyframe();
            this.config.busy = true;
            this.gui.update();
            this.player.play(this.mandala, this.stage, this.config);
            break;
          case "stopAnimation":
            this.config.isRecordingAnimation = false;
            this.config.isPlayingAnimation = false;
            this.config.busy = false;
            this.gui.update();
            this.player.stop();
            break;
          case "randomize":
            this.config.randomize();
            this.mandala.setScale(this.config.patternScale);
            this.mandala.setRotation(this.config.patternRotation);
            this.gui.update();
            break;
        }
      });
      on(this.player, "started", () => {
        this.config.isPlayingAnimation = true;
        if (this.config.isRecordingAnimation) {
          this.video = new video_default({frameRate: this.config.fps});
        }
      });
      on(this.player, "ended", () => {
        if (this.config.isRecordingAnimation) {
          this.video.save();
        }
        this.config.isPlayingAnimation = false;
        this.config.isRecordingAnimation = false;
        this.config.busy = false;
        this.gui.update();
      });
      on(this.player, "change", () => {
        if (this.config.isRecordingAnimation) {
          this.video.addFrame(this.player.ctx.canvas);
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
        this.mandala.setPattern(this.stage.ctx.createPattern(img, "repeat"));
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
})();
//# sourceMappingURL=bundle.js.map
