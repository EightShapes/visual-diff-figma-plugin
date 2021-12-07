(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i4 = decorators.length - 1, decorator; i4 >= 0; i4--)
      if (decorator = decorators[i4])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e5) {
          reject(e5);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e5) {
          reject(e5);
        }
      };
      var step = (x2) => x2.done ? resolve(x2.value) : Promise.resolve(x2.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/pixelmatch/index.js
  var require_pixelmatch = __commonJS({
    "node_modules/pixelmatch/index.js"(exports, module) {
      "use strict";
      module.exports = pixelmatch2;
      var defaultOptions = {
        threshold: 0.1,
        includeAA: false,
        alpha: 0.1,
        aaColor: [255, 255, 0],
        diffColor: [255, 0, 0],
        diffColorAlt: null,
        diffMask: false
      };
      function pixelmatch2(img1, img2, output, width, height, options) {
        if (!isPixelData(img1) || !isPixelData(img2) || output && !isPixelData(output))
          throw new Error("Image data: Uint8Array, Uint8ClampedArray or Buffer expected.");
        if (img1.length !== img2.length || output && output.length !== img1.length)
          throw new Error("Image sizes do not match.");
        if (img1.length !== width * height * 4)
          throw new Error("Image data size does not match width/height.");
        options = Object.assign({}, defaultOptions, options);
        const len = width * height;
        const a32 = new Uint32Array(img1.buffer, img1.byteOffset, len);
        const b32 = new Uint32Array(img2.buffer, img2.byteOffset, len);
        let identical = true;
        for (let i4 = 0; i4 < len; i4++) {
          if (a32[i4] !== b32[i4]) {
            identical = false;
            break;
          }
        }
        if (identical) {
          if (output && !options.diffMask) {
            for (let i4 = 0; i4 < len; i4++)
              drawGrayPixel(img1, 4 * i4, options.alpha, output);
          }
          return 0;
        }
        const maxDelta = 35215 * options.threshold * options.threshold;
        let diff = 0;
        for (let y2 = 0; y2 < height; y2++) {
          for (let x2 = 0; x2 < width; x2++) {
            const pos = (y2 * width + x2) * 4;
            const delta = colorDelta(img1, img2, pos, pos);
            if (Math.abs(delta) > maxDelta) {
              if (!options.includeAA && (antialiased(img1, x2, y2, width, height, img2) || antialiased(img2, x2, y2, width, height, img1))) {
                if (output && !options.diffMask)
                  drawPixel(output, pos, ...options.aaColor);
              } else {
                if (output) {
                  drawPixel(output, pos, ...delta < 0 && options.diffColorAlt || options.diffColor);
                }
                diff++;
              }
            } else if (output) {
              if (!options.diffMask)
                drawGrayPixel(img1, pos, options.alpha, output);
            }
          }
        }
        return diff;
      }
      function isPixelData(arr) {
        return ArrayBuffer.isView(arr) && arr.constructor.BYTES_PER_ELEMENT === 1;
      }
      function antialiased(img, x1, y1, width, height, img2) {
        const x0 = Math.max(x1 - 1, 0);
        const y0 = Math.max(y1 - 1, 0);
        const x2 = Math.min(x1 + 1, width - 1);
        const y2 = Math.min(y1 + 1, height - 1);
        const pos = (y1 * width + x1) * 4;
        let zeroes = x1 === x0 || x1 === x2 || y1 === y0 || y1 === y2 ? 1 : 0;
        let min = 0;
        let max = 0;
        let minX, minY, maxX, maxY;
        for (let x3 = x0; x3 <= x2; x3++) {
          for (let y3 = y0; y3 <= y2; y3++) {
            if (x3 === x1 && y3 === y1)
              continue;
            const delta = colorDelta(img, img, pos, (y3 * width + x3) * 4, true);
            if (delta === 0) {
              zeroes++;
              if (zeroes > 2)
                return false;
            } else if (delta < min) {
              min = delta;
              minX = x3;
              minY = y3;
            } else if (delta > max) {
              max = delta;
              maxX = x3;
              maxY = y3;
            }
          }
        }
        if (min === 0 || max === 0)
          return false;
        return hasManySiblings(img, minX, minY, width, height) && hasManySiblings(img2, minX, minY, width, height) || hasManySiblings(img, maxX, maxY, width, height) && hasManySiblings(img2, maxX, maxY, width, height);
      }
      function hasManySiblings(img, x1, y1, width, height) {
        const x0 = Math.max(x1 - 1, 0);
        const y0 = Math.max(y1 - 1, 0);
        const x2 = Math.min(x1 + 1, width - 1);
        const y2 = Math.min(y1 + 1, height - 1);
        const pos = (y1 * width + x1) * 4;
        let zeroes = x1 === x0 || x1 === x2 || y1 === y0 || y1 === y2 ? 1 : 0;
        for (let x3 = x0; x3 <= x2; x3++) {
          for (let y3 = y0; y3 <= y2; y3++) {
            if (x3 === x1 && y3 === y1)
              continue;
            const pos2 = (y3 * width + x3) * 4;
            if (img[pos] === img[pos2] && img[pos + 1] === img[pos2 + 1] && img[pos + 2] === img[pos2 + 2] && img[pos + 3] === img[pos2 + 3])
              zeroes++;
            if (zeroes > 2)
              return true;
          }
        }
        return false;
      }
      function colorDelta(img1, img2, k2, m2, yOnly) {
        let r1 = img1[k2 + 0];
        let g1 = img1[k2 + 1];
        let b1 = img1[k2 + 2];
        let a1 = img1[k2 + 3];
        let r22 = img2[m2 + 0];
        let g2 = img2[m2 + 1];
        let b2 = img2[m2 + 2];
        let a22 = img2[m2 + 3];
        if (a1 === a22 && r1 === r22 && g1 === g2 && b1 === b2)
          return 0;
        if (a1 < 255) {
          a1 /= 255;
          r1 = blend(r1, a1);
          g1 = blend(g1, a1);
          b1 = blend(b1, a1);
        }
        if (a22 < 255) {
          a22 /= 255;
          r22 = blend(r22, a22);
          g2 = blend(g2, a22);
          b2 = blend(b2, a22);
        }
        const y1 = rgb2y(r1, g1, b1);
        const y2 = rgb2y(r22, g2, b2);
        const y3 = y1 - y2;
        if (yOnly)
          return y3;
        const i4 = rgb2i(r1, g1, b1) - rgb2i(r22, g2, b2);
        const q = rgb2q(r1, g1, b1) - rgb2q(r22, g2, b2);
        const delta = 0.5053 * y3 * y3 + 0.299 * i4 * i4 + 0.1957 * q * q;
        return y1 > y2 ? -delta : delta;
      }
      function rgb2y(r4, g2, b2) {
        return r4 * 0.29889531 + g2 * 0.58662247 + b2 * 0.11448223;
      }
      function rgb2i(r4, g2, b2) {
        return r4 * 0.59597799 - g2 * 0.2741761 - b2 * 0.32180189;
      }
      function rgb2q(r4, g2, b2) {
        return r4 * 0.21147017 - g2 * 0.52261711 + b2 * 0.31114694;
      }
      function blend(c2, a3) {
        return 255 + (c2 - 255) * a3;
      }
      function drawPixel(output, pos, r4, g2, b2) {
        output[pos + 0] = r4;
        output[pos + 1] = g2;
        output[pos + 2] = b2;
        output[pos + 3] = 255;
      }
      function drawGrayPixel(img, i4, alpha, output) {
        const r4 = img[i4 + 0];
        const g2 = img[i4 + 1];
        const b2 = img[i4 + 2];
        const val = blend(rgb2y(r4, g2, b2), alpha * img[i4 + 3] / 255);
        drawPixel(output, i4, val, val, val);
      }
    }
  });

  // node_modules/@lit/reactive-element/css-tag.js
  var t = window.ShadowRoot && (window.ShadyCSS === void 0 || window.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
  var e = Symbol();
  var n = /* @__PURE__ */ new Map();
  var s = class {
    constructor(t3, n6) {
      if (this._$cssResult$ = true, n6 !== e)
        throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t3;
    }
    get styleSheet() {
      let e5 = n.get(this.cssText);
      return t && e5 === void 0 && (n.set(this.cssText, e5 = new CSSStyleSheet()), e5.replaceSync(this.cssText)), e5;
    }
    toString() {
      return this.cssText;
    }
  };
  var o = (t3) => new s(typeof t3 == "string" ? t3 : t3 + "", e);
  var r = (t3, ...n6) => {
    const o6 = t3.length === 1 ? t3[0] : n6.reduce((e5, n7, s5) => e5 + ((t4) => {
      if (t4._$cssResult$ === true)
        return t4.cssText;
      if (typeof t4 == "number")
        return t4;
      throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
    })(n7) + t3[s5 + 1], t3[0]);
    return new s(o6, e);
  };
  var i = (e5, n6) => {
    t ? e5.adoptedStyleSheets = n6.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet) : n6.forEach((t3) => {
      const n7 = document.createElement("style"), s5 = window.litNonce;
      s5 !== void 0 && n7.setAttribute("nonce", s5), n7.textContent = t3.cssText, e5.appendChild(n7);
    });
  };
  var S = t ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
    let e5 = "";
    for (const n6 of t4.cssRules)
      e5 += n6.cssText;
    return o(e5);
  })(t3) : t3;

  // node_modules/@lit/reactive-element/reactive-element.js
  var s2;
  var e2 = window.trustedTypes;
  var r2 = e2 ? e2.emptyScript : "";
  var h = window.reactiveElementPolyfillSupport;
  var o2 = { toAttribute(t3, i4) {
    switch (i4) {
      case Boolean:
        t3 = t3 ? r2 : null;
        break;
      case Object:
      case Array:
        t3 = t3 == null ? t3 : JSON.stringify(t3);
    }
    return t3;
  }, fromAttribute(t3, i4) {
    let s5 = t3;
    switch (i4) {
      case Boolean:
        s5 = t3 !== null;
        break;
      case Number:
        s5 = t3 === null ? null : Number(t3);
        break;
      case Object:
      case Array:
        try {
          s5 = JSON.parse(t3);
        } catch (t4) {
          s5 = null;
        }
    }
    return s5;
  } };
  var n2 = (t3, i4) => i4 !== t3 && (i4 == i4 || t3 == t3);
  var l = { attribute: true, type: String, converter: o2, reflect: false, hasChanged: n2 };
  var a = class extends HTMLElement {
    constructor() {
      super(), this._$Et = /* @__PURE__ */ new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$Ei = null, this.o();
    }
    static addInitializer(t3) {
      var i4;
      (i4 = this.l) !== null && i4 !== void 0 || (this.l = []), this.l.push(t3);
    }
    static get observedAttributes() {
      this.finalize();
      const t3 = [];
      return this.elementProperties.forEach((i4, s5) => {
        const e5 = this._$Eh(s5, i4);
        e5 !== void 0 && (this._$Eu.set(e5, s5), t3.push(e5));
      }), t3;
    }
    static createProperty(t3, i4 = l) {
      if (i4.state && (i4.attribute = false), this.finalize(), this.elementProperties.set(t3, i4), !i4.noAccessor && !this.prototype.hasOwnProperty(t3)) {
        const s5 = typeof t3 == "symbol" ? Symbol() : "__" + t3, e5 = this.getPropertyDescriptor(t3, s5, i4);
        e5 !== void 0 && Object.defineProperty(this.prototype, t3, e5);
      }
    }
    static getPropertyDescriptor(t3, i4, s5) {
      return { get() {
        return this[i4];
      }, set(e5) {
        const r4 = this[t3];
        this[i4] = e5, this.requestUpdate(t3, r4, s5);
      }, configurable: true, enumerable: true };
    }
    static getPropertyOptions(t3) {
      return this.elementProperties.get(t3) || l;
    }
    static finalize() {
      if (this.hasOwnProperty("finalized"))
        return false;
      this.finalized = true;
      const t3 = Object.getPrototypeOf(this);
      if (t3.finalize(), this.elementProperties = new Map(t3.elementProperties), this._$Eu = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
        const t4 = this.properties, i4 = [...Object.getOwnPropertyNames(t4), ...Object.getOwnPropertySymbols(t4)];
        for (const s5 of i4)
          this.createProperty(s5, t4[s5]);
      }
      return this.elementStyles = this.finalizeStyles(this.styles), true;
    }
    static finalizeStyles(i4) {
      const s5 = [];
      if (Array.isArray(i4)) {
        const e5 = new Set(i4.flat(1 / 0).reverse());
        for (const i5 of e5)
          s5.unshift(S(i5));
      } else
        i4 !== void 0 && s5.push(S(i4));
      return s5;
    }
    static _$Eh(t3, i4) {
      const s5 = i4.attribute;
      return s5 === false ? void 0 : typeof s5 == "string" ? s5 : typeof t3 == "string" ? t3.toLowerCase() : void 0;
    }
    o() {
      var t3;
      this._$Ep = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$Em(), this.requestUpdate(), (t3 = this.constructor.l) === null || t3 === void 0 || t3.forEach((t4) => t4(this));
    }
    addController(t3) {
      var i4, s5;
      ((i4 = this._$Eg) !== null && i4 !== void 0 ? i4 : this._$Eg = []).push(t3), this.renderRoot !== void 0 && this.isConnected && ((s5 = t3.hostConnected) === null || s5 === void 0 || s5.call(t3));
    }
    removeController(t3) {
      var i4;
      (i4 = this._$Eg) === null || i4 === void 0 || i4.splice(this._$Eg.indexOf(t3) >>> 0, 1);
    }
    _$Em() {
      this.constructor.elementProperties.forEach((t3, i4) => {
        this.hasOwnProperty(i4) && (this._$Et.set(i4, this[i4]), delete this[i4]);
      });
    }
    createRenderRoot() {
      var t3;
      const s5 = (t3 = this.shadowRoot) !== null && t3 !== void 0 ? t3 : this.attachShadow(this.constructor.shadowRootOptions);
      return i(s5, this.constructor.elementStyles), s5;
    }
    connectedCallback() {
      var t3;
      this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
        var i4;
        return (i4 = t4.hostConnected) === null || i4 === void 0 ? void 0 : i4.call(t4);
      });
    }
    enableUpdating(t3) {
    }
    disconnectedCallback() {
      var t3;
      (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
        var i4;
        return (i4 = t4.hostDisconnected) === null || i4 === void 0 ? void 0 : i4.call(t4);
      });
    }
    attributeChangedCallback(t3, i4, s5) {
      this._$AK(t3, s5);
    }
    _$ES(t3, i4, s5 = l) {
      var e5, r4;
      const h3 = this.constructor._$Eh(t3, s5);
      if (h3 !== void 0 && s5.reflect === true) {
        const n6 = ((r4 = (e5 = s5.converter) === null || e5 === void 0 ? void 0 : e5.toAttribute) !== null && r4 !== void 0 ? r4 : o2.toAttribute)(i4, s5.type);
        this._$Ei = t3, n6 == null ? this.removeAttribute(h3) : this.setAttribute(h3, n6), this._$Ei = null;
      }
    }
    _$AK(t3, i4) {
      var s5, e5, r4;
      const h3 = this.constructor, n6 = h3._$Eu.get(t3);
      if (n6 !== void 0 && this._$Ei !== n6) {
        const t4 = h3.getPropertyOptions(n6), l4 = t4.converter, a3 = (r4 = (e5 = (s5 = l4) === null || s5 === void 0 ? void 0 : s5.fromAttribute) !== null && e5 !== void 0 ? e5 : typeof l4 == "function" ? l4 : null) !== null && r4 !== void 0 ? r4 : o2.fromAttribute;
        this._$Ei = n6, this[n6] = a3(i4, t4.type), this._$Ei = null;
      }
    }
    requestUpdate(t3, i4, s5) {
      let e5 = true;
      t3 !== void 0 && (((s5 = s5 || this.constructor.getPropertyOptions(t3)).hasChanged || n2)(this[t3], i4) ? (this._$AL.has(t3) || this._$AL.set(t3, i4), s5.reflect === true && this._$Ei !== t3 && (this._$E_ === void 0 && (this._$E_ = /* @__PURE__ */ new Map()), this._$E_.set(t3, s5))) : e5 = false), !this.isUpdatePending && e5 && (this._$Ep = this._$EC());
    }
    async _$EC() {
      this.isUpdatePending = true;
      try {
        await this._$Ep;
      } catch (t4) {
        Promise.reject(t4);
      }
      const t3 = this.scheduleUpdate();
      return t3 != null && await t3, !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      var t3;
      if (!this.isUpdatePending)
        return;
      this.hasUpdated, this._$Et && (this._$Et.forEach((t4, i5) => this[i5] = t4), this._$Et = void 0);
      let i4 = false;
      const s5 = this._$AL;
      try {
        i4 = this.shouldUpdate(s5), i4 ? (this.willUpdate(s5), (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
          var i5;
          return (i5 = t4.hostUpdate) === null || i5 === void 0 ? void 0 : i5.call(t4);
        }), this.update(s5)) : this._$EU();
      } catch (t4) {
        throw i4 = false, this._$EU(), t4;
      }
      i4 && this._$AE(s5);
    }
    willUpdate(t3) {
    }
    _$AE(t3) {
      var i4;
      (i4 = this._$Eg) === null || i4 === void 0 || i4.forEach((t4) => {
        var i5;
        return (i5 = t4.hostUpdated) === null || i5 === void 0 ? void 0 : i5.call(t4);
      }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
    }
    _$EU() {
      this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$Ep;
    }
    shouldUpdate(t3) {
      return true;
    }
    update(t3) {
      this._$E_ !== void 0 && (this._$E_.forEach((t4, i4) => this._$ES(i4, this[i4], t4)), this._$E_ = void 0), this._$EU();
    }
    updated(t3) {
    }
    firstUpdated(t3) {
    }
  };
  a.finalized = true, a.elementProperties = /* @__PURE__ */ new Map(), a.elementStyles = [], a.shadowRootOptions = { mode: "open" }, h == null || h({ ReactiveElement: a }), ((s2 = globalThis.reactiveElementVersions) !== null && s2 !== void 0 ? s2 : globalThis.reactiveElementVersions = []).push("1.0.2");

  // node_modules/lit-html/lit-html.js
  var t2;
  var i2 = globalThis.trustedTypes;
  var s3 = i2 ? i2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
  var e3 = `lit$${(Math.random() + "").slice(9)}$`;
  var o3 = "?" + e3;
  var n3 = `<${o3}>`;
  var l2 = document;
  var h2 = (t3 = "") => l2.createComment(t3);
  var r3 = (t3) => t3 === null || typeof t3 != "object" && typeof t3 != "function";
  var d = Array.isArray;
  var u = (t3) => {
    var i4;
    return d(t3) || typeof ((i4 = t3) === null || i4 === void 0 ? void 0 : i4[Symbol.iterator]) == "function";
  };
  var c = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var v = /-->/g;
  var a2 = />/g;
  var f = />|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g;
  var _ = /'/g;
  var m = /"/g;
  var g = /^(?:script|style|textarea)$/i;
  var $ = (t3) => (i4, ...s5) => ({ _$litType$: t3, strings: i4, values: s5 });
  var p = $(1);
  var y = $(2);
  var b = Symbol.for("lit-noChange");
  var T = Symbol.for("lit-nothing");
  var x = new WeakMap();
  var w = (t3, i4, s5) => {
    var e5, o6;
    const n6 = (e5 = s5 == null ? void 0 : s5.renderBefore) !== null && e5 !== void 0 ? e5 : i4;
    let l4 = n6._$litPart$;
    if (l4 === void 0) {
      const t4 = (o6 = s5 == null ? void 0 : s5.renderBefore) !== null && o6 !== void 0 ? o6 : null;
      n6._$litPart$ = l4 = new N(i4.insertBefore(h2(), t4), t4, void 0, s5 != null ? s5 : {});
    }
    return l4._$AI(t3), l4;
  };
  var A = l2.createTreeWalker(l2, 129, null, false);
  var C = (t3, i4) => {
    const o6 = t3.length - 1, l4 = [];
    let h3, r4 = i4 === 2 ? "<svg>" : "", d2 = c;
    for (let i5 = 0; i5 < o6; i5++) {
      const s5 = t3[i5];
      let o7, u3, $2 = -1, p2 = 0;
      for (; p2 < s5.length && (d2.lastIndex = p2, u3 = d2.exec(s5), u3 !== null); )
        p2 = d2.lastIndex, d2 === c ? u3[1] === "!--" ? d2 = v : u3[1] !== void 0 ? d2 = a2 : u3[2] !== void 0 ? (g.test(u3[2]) && (h3 = RegExp("</" + u3[2], "g")), d2 = f) : u3[3] !== void 0 && (d2 = f) : d2 === f ? u3[0] === ">" ? (d2 = h3 != null ? h3 : c, $2 = -1) : u3[1] === void 0 ? $2 = -2 : ($2 = d2.lastIndex - u3[2].length, o7 = u3[1], d2 = u3[3] === void 0 ? f : u3[3] === '"' ? m : _) : d2 === m || d2 === _ ? d2 = f : d2 === v || d2 === a2 ? d2 = c : (d2 = f, h3 = void 0);
      const y2 = d2 === f && t3[i5 + 1].startsWith("/>") ? " " : "";
      r4 += d2 === c ? s5 + n3 : $2 >= 0 ? (l4.push(o7), s5.slice(0, $2) + "$lit$" + s5.slice($2) + e3 + y2) : s5 + e3 + ($2 === -2 ? (l4.push(void 0), i5) : y2);
    }
    const u2 = r4 + (t3[o6] || "<?>") + (i4 === 2 ? "</svg>" : "");
    return [s3 !== void 0 ? s3.createHTML(u2) : u2, l4];
  };
  var P = class {
    constructor({ strings: t3, _$litType$: s5 }, n6) {
      let l4;
      this.parts = [];
      let r4 = 0, d2 = 0;
      const u2 = t3.length - 1, c2 = this.parts, [v2, a3] = C(t3, s5);
      if (this.el = P.createElement(v2, n6), A.currentNode = this.el.content, s5 === 2) {
        const t4 = this.el.content, i4 = t4.firstChild;
        i4.remove(), t4.append(...i4.childNodes);
      }
      for (; (l4 = A.nextNode()) !== null && c2.length < u2; ) {
        if (l4.nodeType === 1) {
          if (l4.hasAttributes()) {
            const t4 = [];
            for (const i4 of l4.getAttributeNames())
              if (i4.endsWith("$lit$") || i4.startsWith(e3)) {
                const s6 = a3[d2++];
                if (t4.push(i4), s6 !== void 0) {
                  const t5 = l4.getAttribute(s6.toLowerCase() + "$lit$").split(e3), i5 = /([.?@])?(.*)/.exec(s6);
                  c2.push({ type: 1, index: r4, name: i5[2], strings: t5, ctor: i5[1] === "." ? M : i5[1] === "?" ? H : i5[1] === "@" ? I : S2 });
                } else
                  c2.push({ type: 6, index: r4 });
              }
            for (const i4 of t4)
              l4.removeAttribute(i4);
          }
          if (g.test(l4.tagName)) {
            const t4 = l4.textContent.split(e3), s6 = t4.length - 1;
            if (s6 > 0) {
              l4.textContent = i2 ? i2.emptyScript : "";
              for (let i4 = 0; i4 < s6; i4++)
                l4.append(t4[i4], h2()), A.nextNode(), c2.push({ type: 2, index: ++r4 });
              l4.append(t4[s6], h2());
            }
          }
        } else if (l4.nodeType === 8)
          if (l4.data === o3)
            c2.push({ type: 2, index: r4 });
          else {
            let t4 = -1;
            for (; (t4 = l4.data.indexOf(e3, t4 + 1)) !== -1; )
              c2.push({ type: 7, index: r4 }), t4 += e3.length - 1;
          }
        r4++;
      }
    }
    static createElement(t3, i4) {
      const s5 = l2.createElement("template");
      return s5.innerHTML = t3, s5;
    }
  };
  function V(t3, i4, s5 = t3, e5) {
    var o6, n6, l4, h3;
    if (i4 === b)
      return i4;
    let d2 = e5 !== void 0 ? (o6 = s5._$Cl) === null || o6 === void 0 ? void 0 : o6[e5] : s5._$Cu;
    const u2 = r3(i4) ? void 0 : i4._$litDirective$;
    return (d2 == null ? void 0 : d2.constructor) !== u2 && ((n6 = d2 == null ? void 0 : d2._$AO) === null || n6 === void 0 || n6.call(d2, false), u2 === void 0 ? d2 = void 0 : (d2 = new u2(t3), d2._$AT(t3, s5, e5)), e5 !== void 0 ? ((l4 = (h3 = s5)._$Cl) !== null && l4 !== void 0 ? l4 : h3._$Cl = [])[e5] = d2 : s5._$Cu = d2), d2 !== void 0 && (i4 = V(t3, d2._$AS(t3, i4.values), d2, e5)), i4;
  }
  var E = class {
    constructor(t3, i4) {
      this.v = [], this._$AN = void 0, this._$AD = t3, this._$AM = i4;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    p(t3) {
      var i4;
      const { el: { content: s5 }, parts: e5 } = this._$AD, o6 = ((i4 = t3 == null ? void 0 : t3.creationScope) !== null && i4 !== void 0 ? i4 : l2).importNode(s5, true);
      A.currentNode = o6;
      let n6 = A.nextNode(), h3 = 0, r4 = 0, d2 = e5[0];
      for (; d2 !== void 0; ) {
        if (h3 === d2.index) {
          let i5;
          d2.type === 2 ? i5 = new N(n6, n6.nextSibling, this, t3) : d2.type === 1 ? i5 = new d2.ctor(n6, d2.name, d2.strings, this, t3) : d2.type === 6 && (i5 = new L(n6, this, t3)), this.v.push(i5), d2 = e5[++r4];
        }
        h3 !== (d2 == null ? void 0 : d2.index) && (n6 = A.nextNode(), h3++);
      }
      return o6;
    }
    m(t3) {
      let i4 = 0;
      for (const s5 of this.v)
        s5 !== void 0 && (s5.strings !== void 0 ? (s5._$AI(t3, s5, i4), i4 += s5.strings.length - 2) : s5._$AI(t3[i4])), i4++;
    }
  };
  var N = class {
    constructor(t3, i4, s5, e5) {
      var o6;
      this.type = 2, this._$AH = T, this._$AN = void 0, this._$AA = t3, this._$AB = i4, this._$AM = s5, this.options = e5, this._$Cg = (o6 = e5 == null ? void 0 : e5.isConnected) === null || o6 === void 0 || o6;
    }
    get _$AU() {
      var t3, i4;
      return (i4 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && i4 !== void 0 ? i4 : this._$Cg;
    }
    get parentNode() {
      let t3 = this._$AA.parentNode;
      const i4 = this._$AM;
      return i4 !== void 0 && t3.nodeType === 11 && (t3 = i4.parentNode), t3;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t3, i4 = this) {
      t3 = V(this, t3, i4), r3(t3) ? t3 === T || t3 == null || t3 === "" ? (this._$AH !== T && this._$AR(), this._$AH = T) : t3 !== this._$AH && t3 !== b && this.$(t3) : t3._$litType$ !== void 0 ? this.T(t3) : t3.nodeType !== void 0 ? this.S(t3) : u(t3) ? this.M(t3) : this.$(t3);
    }
    A(t3, i4 = this._$AB) {
      return this._$AA.parentNode.insertBefore(t3, i4);
    }
    S(t3) {
      this._$AH !== t3 && (this._$AR(), this._$AH = this.A(t3));
    }
    $(t3) {
      this._$AH !== T && r3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.S(l2.createTextNode(t3)), this._$AH = t3;
    }
    T(t3) {
      var i4;
      const { values: s5, _$litType$: e5 } = t3, o6 = typeof e5 == "number" ? this._$AC(t3) : (e5.el === void 0 && (e5.el = P.createElement(e5.h, this.options)), e5);
      if (((i4 = this._$AH) === null || i4 === void 0 ? void 0 : i4._$AD) === o6)
        this._$AH.m(s5);
      else {
        const t4 = new E(o6, this), i5 = t4.p(this.options);
        t4.m(s5), this.S(i5), this._$AH = t4;
      }
    }
    _$AC(t3) {
      let i4 = x.get(t3.strings);
      return i4 === void 0 && x.set(t3.strings, i4 = new P(t3)), i4;
    }
    M(t3) {
      d(this._$AH) || (this._$AH = [], this._$AR());
      const i4 = this._$AH;
      let s5, e5 = 0;
      for (const o6 of t3)
        e5 === i4.length ? i4.push(s5 = new N(this.A(h2()), this.A(h2()), this, this.options)) : s5 = i4[e5], s5._$AI(o6), e5++;
      e5 < i4.length && (this._$AR(s5 && s5._$AB.nextSibling, e5), i4.length = e5);
    }
    _$AR(t3 = this._$AA.nextSibling, i4) {
      var s5;
      for ((s5 = this._$AP) === null || s5 === void 0 || s5.call(this, false, true, i4); t3 && t3 !== this._$AB; ) {
        const i5 = t3.nextSibling;
        t3.remove(), t3 = i5;
      }
    }
    setConnected(t3) {
      var i4;
      this._$AM === void 0 && (this._$Cg = t3, (i4 = this._$AP) === null || i4 === void 0 || i4.call(this, t3));
    }
  };
  var S2 = class {
    constructor(t3, i4, s5, e5, o6) {
      this.type = 1, this._$AH = T, this._$AN = void 0, this.element = t3, this.name = i4, this._$AM = e5, this.options = o6, s5.length > 2 || s5[0] !== "" || s5[1] !== "" ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = T;
    }
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3, i4 = this, s5, e5) {
      const o6 = this.strings;
      let n6 = false;
      if (o6 === void 0)
        t3 = V(this, t3, i4, 0), n6 = !r3(t3) || t3 !== this._$AH && t3 !== b, n6 && (this._$AH = t3);
      else {
        const e6 = t3;
        let l4, h3;
        for (t3 = o6[0], l4 = 0; l4 < o6.length - 1; l4++)
          h3 = V(this, e6[s5 + l4], i4, l4), h3 === b && (h3 = this._$AH[l4]), n6 || (n6 = !r3(h3) || h3 !== this._$AH[l4]), h3 === T ? t3 = T : t3 !== T && (t3 += (h3 != null ? h3 : "") + o6[l4 + 1]), this._$AH[l4] = h3;
      }
      n6 && !e5 && this.k(t3);
    }
    k(t3) {
      t3 === T ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 != null ? t3 : "");
    }
  };
  var M = class extends S2 {
    constructor() {
      super(...arguments), this.type = 3;
    }
    k(t3) {
      this.element[this.name] = t3 === T ? void 0 : t3;
    }
  };
  var k = i2 ? i2.emptyScript : "";
  var H = class extends S2 {
    constructor() {
      super(...arguments), this.type = 4;
    }
    k(t3) {
      t3 && t3 !== T ? this.element.setAttribute(this.name, k) : this.element.removeAttribute(this.name);
    }
  };
  var I = class extends S2 {
    constructor(t3, i4, s5, e5, o6) {
      super(t3, i4, s5, e5, o6), this.type = 5;
    }
    _$AI(t3, i4 = this) {
      var s5;
      if ((t3 = (s5 = V(this, t3, i4, 0)) !== null && s5 !== void 0 ? s5 : T) === b)
        return;
      const e5 = this._$AH, o6 = t3 === T && e5 !== T || t3.capture !== e5.capture || t3.once !== e5.once || t3.passive !== e5.passive, n6 = t3 !== T && (e5 === T || o6);
      o6 && this.element.removeEventListener(this.name, this, e5), n6 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
    }
    handleEvent(t3) {
      var i4, s5;
      typeof this._$AH == "function" ? this._$AH.call((s5 = (i4 = this.options) === null || i4 === void 0 ? void 0 : i4.host) !== null && s5 !== void 0 ? s5 : this.element, t3) : this._$AH.handleEvent(t3);
    }
  };
  var L = class {
    constructor(t3, i4, s5) {
      this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i4, this.options = s5;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3) {
      V(this, t3);
    }
  };
  var z = window.litHtmlPolyfillSupport;
  z == null || z(P, N), ((t2 = globalThis.litHtmlVersions) !== null && t2 !== void 0 ? t2 : globalThis.litHtmlVersions = []).push("2.0.2");

  // node_modules/lit-element/lit-element.js
  var l3;
  var o4;
  var s4 = class extends a {
    constructor() {
      super(...arguments), this.renderOptions = { host: this }, this._$Dt = void 0;
    }
    createRenderRoot() {
      var t3, e5;
      const i4 = super.createRenderRoot();
      return (t3 = (e5 = this.renderOptions).renderBefore) !== null && t3 !== void 0 || (e5.renderBefore = i4.firstChild), i4;
    }
    update(t3) {
      const i4 = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Dt = w(i4, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      var t3;
      super.connectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(true);
    }
    disconnectedCallback() {
      var t3;
      super.disconnectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(false);
    }
    render() {
      return b;
    }
  };
  s4.finalized = true, s4._$litElement$ = true, (l3 = globalThis.litElementHydrateSupport) === null || l3 === void 0 || l3.call(globalThis, { LitElement: s4 });
  var n4 = globalThis.litElementPolyfillSupport;
  n4 == null || n4({ LitElement: s4 });
  ((o4 = globalThis.litElementVersions) !== null && o4 !== void 0 ? o4 : globalThis.litElementVersions = []).push("3.0.2");

  // node_modules/@lit/reactive-element/decorators/custom-element.js
  var n5 = (n6) => (e5) => typeof e5 == "function" ? ((n7, e6) => (window.customElements.define(n7, e6), e6))(n6, e5) : ((n7, e6) => {
    const { kind: t3, elements: i4 } = e6;
    return { kind: t3, elements: i4, finisher(e7) {
      window.customElements.define(n7, e7);
    } };
  })(n6, e5);

  // node_modules/@lit/reactive-element/decorators/property.js
  var i3 = (i4, e5) => e5.kind === "method" && e5.descriptor && !("value" in e5.descriptor) ? { ...e5, finisher(n6) {
    n6.createProperty(e5.key, i4);
  } } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: e5.key, initializer() {
    typeof e5.initializer == "function" && (this[e5.key] = e5.initializer.call(this));
  }, finisher(n6) {
    n6.createProperty(e5.key, i4);
  } };
  function e4(e5) {
    return (n6, t3) => t3 !== void 0 ? ((i4, e6, n7) => {
      e6.constructor.createProperty(n7, i4);
    })(e5, n6, t3) : i3(e5, n6);
  }

  // src/components/image-processor.ts
  var pixelmatch = require_pixelmatch();
  var ImageProcessor = class extends s4 {
    constructor() {
      super(...arguments);
      this._encode = (canvas, ctx, imageData) => __async(this, null, function* () {
        ctx.putImageData(imageData, 0, 0);
        return yield new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onload = () => resolve(new Uint8Array(reader.result));
            reader.onerror = () => reject(new Error("Could not read from blob"));
            reader.readAsArrayBuffer(blob);
          });
        });
      });
      this._decode = (canvas, ctx, bytes, width, height) => __async(this, null, function* () {
        const url = URL.createObjectURL(new Blob([bytes]));
        const image = yield new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject();
          img.src = url;
        });
        console.log(image);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);
        return imageData;
      });
      this.getImageDiff = (messageData) => __async(this, null, function* () {
        console.log("GID", this);
        const canvas = this.shadowRoot.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        const { baseline, test } = messageData.imageData;
        const largestWidth = Math.max(baseline.width, test.width);
        const largestHeight = Math.max(baseline.height, test.height);
        const baselineImageCanvas = yield this._decode(canvas, ctx, baseline.image, largestWidth, largestHeight);
        const img1 = ctx.getImageData(0, 0, largestWidth, largestHeight);
        const testImageCanvas = yield this._decode(canvas, ctx, test.image, largestWidth, largestHeight);
        const img2 = ctx.getImageData(0, 0, largestWidth, largestHeight);
        const diff = ctx.createImageData(largestWidth, largestHeight);
        console.log(`DIFF DIMENSIONS: ${largestWidth} x ${largestHeight}`);
        const pixelDiffCount = pixelmatch(img1.data, img2.data, diff.data, largestWidth, largestHeight, {
          threshold: 0,
          diffColor: [255, 66, 179],
          aaColor: [255, 66, 179],
          alpha: 0.3
        });
        ctx.putImageData(diff, 0, 0);
        const encodedImageDiff = yield this._encode(canvas, ctx, diff);
        console.log("diff", diff);
        return {
          pixelDiffCount,
          encodedImageDiff,
          baselineNodeId: baseline.nodeId,
          testNodeId: test.nodeId
        };
      });
    }
    render() {
      return p` <canvas style="display: none;"></canvas>`;
    }
  };
  ImageProcessor = __decorateClass([
    n5("image-processor")
  ], ImageProcessor);

  // src/components/m-button.ts
  var MButton = class extends s4 {
    render() {
      return p`
      <button><slot></slot></button>
`;
    }
  };
  MButton.styles = r`
    button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin: 0;
    }
  `;
  MButton = __decorateClass([
    n5("m-button")
  ], MButton);

  // src/components/test-list.ts
  var TestList = class extends s4 {
    constructor() {
      super(...arguments);
      this.baselineframes = [];
      this.currentselection = [];
    }
    renderEmptyState() {
      return p`<!-- Nothing selected -->
                <p>Select one or more objects to create a test.</p>
                <!-- something selected state-->
                <div>
                  <!-- List of selected objects, scrollable? -->
                  <ul>
                    ${this.currentselection.map((fNode) => p`<li>${fNode.name} -${fNode.id}</li>`)}
                  </ul>
                  <!-- List of actions to take -->
                  <ul>
                    <li><a href="onpage">Create test on this page</a></li>
                    <li><a href="newpage">Create test on separate page</a></li>
                  </ul>
                </div>`;
    }
    renderList() {
      return p`
      <h1>Tests</h1>
      <ul>
        ${this.baselineframes.map((fNode) => p`
          <li>
            <span>${fNode.name}</span>
            <m-button @click=${this._requestTest} data-baselineframeid=${fNode.id} data-originnodeid=${fNode.originNodeId}>▶️</m-button>
          </li>`)}
      </ul>
    `;
    }
    render() {
      return p`<div>
      ${this.baselineframes.length === 0 ? this.renderEmptyState() : this.renderList()}
      <button @click="${this._changeView}" data-view="tutorial">Show Tutorial</button>
    </div>
`;
    }
    _changeView(e5) {
      const target = e5.target;
      const newView = target.dataset.view;
      this.dispatchEvent(new CustomEvent("changeview", {
        detail: { newView },
        bubbles: true,
        composed: true
      }));
    }
    _requestTest(e5) {
      console.log("REQUEST TEST");
      const baselineFrameId = e5.target.dataset.baselineframeid;
      const originNodeId = e5.target.dataset.originnodeid;
      window.parent.postMessage({
        pluginMessage: {
          type: "create-test",
          data: { baselineFrameId, originNodeId }
        }
      }, "*");
    }
  };
  TestList.styles = r`
    * {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
  `;
  __decorateClass([
    e4({ type: Array })
  ], TestList.prototype, "baselineframes", 2);
  __decorateClass([
    e4({ type: Array })
  ], TestList.prototype, "currentselection", 2);
  TestList = __decorateClass([
    n5("test-list")
  ], TestList);

  // src/components/viewport-manager.ts
  var ViewportManager = class extends s4 {
    constructor() {
      super(...arguments);
      this.view = "test-list";
      this.currentselection = [];
      this.baselineframes = [];
    }
    render() {
      let viewOutput;
      switch (this.view) {
        case "test-list":
          viewOutput = p`
          <test-list currentselection=${JSON.stringify(this.currentselection)} baselineframes=${JSON.stringify(this.baselineframes)}></test-list>`;
          break;
        case "tutorial":
          viewOutput = p`
        <div>
          <h1>Tutorial</h1>
          <button @click="${this._changeView}" data-view="test-list">Show Create Tests</button>
        </div>`;
          break;
      }
      return p`
      <div @changeview=${this._changeViewListener} @postmessage=${this._handlePostMessage}>
        ${viewOutput}
      </div>
    `;
    }
    _changeView(e5) {
      const newView = e5.target.dataset.view;
      this.view = newView;
    }
    _changeViewListener(e5) {
      console.log("ive done a thing", e5);
      const newView = e5.detail.newView;
      this.view = newView;
    }
    _handlePostMessage(e5) {
      console.log("HTPM", e5, this);
      window.parent.postMessage({
        pluginMessage: e5.detail
      }, "*");
    }
  };
  __decorateClass([
    e4()
  ], ViewportManager.prototype, "view", 2);
  __decorateClass([
    e4({ type: Array })
  ], ViewportManager.prototype, "currentselection", 2);
  __decorateClass([
    e4({ type: Array })
  ], ViewportManager.prototype, "baselineframes", 2);
  ViewportManager = __decorateClass([
    n5("viewport-manager")
  ], ViewportManager);

  // src/ui-scripts.js
  var viewportManager = document.querySelector("viewport-manager");
  var imageProcessor = document.querySelector("image-processor");
  onmessage = (message) => __async(void 0, null, function* () {
    switch (message.data.pluginMessage.type) {
      case "current-selection-changed":
        viewportManager.currentselection = message.data.pluginMessage.data;
        break;
      case "baseline-frames-changed":
        viewportManager.baselineframes = message.data.pluginMessage.data;
        break;
      case "get-image-diff":
        console.log("switch gid");
        const diffData = yield imageProcessor.getImageDiff(message.data.pluginMessage);
        parent.postMessage({ pluginMessage: { type: "diff-created", data: diffData } }, "*");
        break;
    }
  });
})();
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
