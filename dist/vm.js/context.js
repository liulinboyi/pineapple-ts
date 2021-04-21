"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = exports.DEFAULT_CONTEXT = void 0;
const constant_1 = require("./constant");
// ECMA standar refs: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects
exports.DEFAULT_CONTEXT = {
    Function,
    Array,
    Boolean,
    clearInterval,
    clearTimeout,
    console,
    Date,
    decodeURI,
    decodeURIComponent,
    encodeURI,
    encodeURIComponent,
    Error,
    escape,
    eval,
    EvalError,
    Infinity,
    isFinite,
    isNaN,
    JSON,
    Math,
    NaN,
    Number,
    ["null"]: null,
    [constant_1.UNDEFINED]: void 0,
    Object,
    parseFloat,
    parseInt,
    RangeError,
    ReferenceError,
    RegExp,
    setInterval,
    setTimeout,
    String,
    SyntaxError,
    TypeError,
    unescape,
    URIError
};
// need to polyfill by user
/* istanbul ignore if */
if (typeof Promise !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Promise = Promise;
}
/* istanbul ignore if */
if (typeof Proxy !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Proxy = Proxy;
}
/* istanbul ignore if */
if (typeof Reflect !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Reflect = Reflect;
}
/* istanbul ignore if */
if (typeof Symbol !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Symbol = Symbol;
}
/* istanbul ignore if */
if (typeof Set !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Set = Set;
}
/* istanbul ignore if */
if (typeof WeakSet !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.WeakSet = WeakSet;
}
/* istanbul ignore if */
if (typeof Map !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Map = Map;
}
/* istanbul ignore if */
if (typeof WeakMap !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.WeakMap = WeakMap;
}
/* istanbul ignore if */
if (typeof ArrayBuffer !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.ArrayBuffer = ArrayBuffer;
}
/* istanbul ignore if */
if (typeof SharedArrayBuffer !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.ArrayBuffer = SharedArrayBuffer;
}
/* istanbul ignore if */
if (typeof DataView !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.ArrayBuffer = DataView;
}
/* istanbul ignore if */
if (typeof Atomics !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Atomics = Atomics;
}
/* istanbul ignore if */
if (typeof Float32Array !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Float32Array = Float32Array;
}
/* istanbul ignore if */
if (typeof Float64Array !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Float64Array = Float64Array;
}
/* istanbul ignore if */
if (typeof Int16Array !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Int16Array = Int16Array;
}
/* istanbul ignore if */
if (typeof Int32Array !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Int32Array = Int32Array;
}
/* istanbul ignore if */
if (typeof Int8Array !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Int32Array = Int8Array;
}
/* istanbul ignore if */
if (typeof Intl !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Intl = Intl;
}
/* istanbul ignore if */
if (typeof Uint16Array !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Uint16Array = Uint16Array;
}
/* istanbul ignore if */
if (typeof Uint32Array !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Uint32Array = Uint32Array;
}
/* istanbul ignore if */
if (typeof Uint8Array !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Uint8Array = Uint8Array;
}
/* istanbul ignore if */
if (typeof Uint8ClampedArray !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.Uint8ClampedArray = Uint8ClampedArray;
}
/* istanbul ignore if */
if (typeof WebAssembly !== constant_1.UNDEFINED) {
    exports.DEFAULT_CONTEXT.WebAssembly = WebAssembly;
}
class Context {
    constructor(externalContext = {}) {
        const ctx = { ...exports.DEFAULT_CONTEXT, ...externalContext };
        for (const attr in ctx) {
            /* istanbul ignore next */
            if (ctx.hasOwnProperty(attr)) {
                this[attr] = ctx[attr];
            }
        }
    }
}
exports.Context = Context;
