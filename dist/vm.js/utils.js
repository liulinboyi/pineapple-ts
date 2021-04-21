"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineFunctionLength = exports.defineFunctionName = void 0;
function defineFunctionName(func, name) {
    Object.defineProperty(func, "name", {
        value: name || "",
        writable: false,
        enumerable: false,
        configurable: true
    });
}
exports.defineFunctionName = defineFunctionName;
function defineFunctionLength(func, length) {
    Object.defineProperty(func, "length", {
        value: length || 0,
        writable: false,
        enumerable: false,
        configurable: true
    });
}
exports.defineFunctionLength = defineFunctionLength;
