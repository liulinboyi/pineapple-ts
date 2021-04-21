"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrCanNotReadProperty = exports.ErrIsNotFunction = exports.ErrNoSuper = exports.ErrInvalidIterable = exports.ErrIsNot = exports.ErrDuplicateDeclard = exports.ErrImplement = exports.ErrNotDefined = void 0;
function ErrNotDefined(varName) {
    return new ReferenceError(`${varName} is not defined`);
}
exports.ErrNotDefined = ErrNotDefined;
function ErrImplement(varName) {
    return new SyntaxError(`Not implement for '${varName}' syntax`);
}
exports.ErrImplement = ErrImplement;
function ErrDuplicateDeclard(varName) {
    return new SyntaxError(`Identifier '${varName}' has already been declared`);
}
exports.ErrDuplicateDeclard = ErrDuplicateDeclard;
function ErrIsNot(name, type) {
    return new TypeError(`${name} is not ${type}`);
}
exports.ErrIsNot = ErrIsNot;
function ErrInvalidIterable(name) {
    return ErrIsNot(name, "iterable");
}
exports.ErrInvalidIterable = ErrInvalidIterable;
function ErrNoSuper() {
    return new ReferenceError(`Must call super constructor in derived class before accessing 'this' or returning from derived constructor`);
}
exports.ErrNoSuper = ErrNoSuper;
function ErrIsNotFunction(name) {
    return new TypeError(`${name} is not a function`);
}
exports.ErrIsNotFunction = ErrIsNotFunction;
function ErrCanNotReadProperty(property, target) {
    return new TypeError(`Cannot read property '${property}' of ${target}`);
}
exports.ErrCanNotReadProperty = ErrCanNotReadProperty;
