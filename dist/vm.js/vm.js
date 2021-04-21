"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = exports.runInContext = void 0;
const babylon_1 = require("babylon");
const context_1 = require("./context");
const evaluate_1 = __importDefault(require("./evaluate"));
const path_1 = require("./path");
const scope_1 = require("./scope");
const constant_1 = require("./constant");
const type_1 = require("./type");
const stack_1 = require("./stack");
/**
 * Run the code in context
 * @export
 * @param {string} code
 * @param {Context} context
 * @returns
 */
function runInContext(outast, code, context, preset = type_1.presetMap.env) {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    scope.level = 0;
    scope.invasive = true;
    scope.const(constant_1.THIS, undefined);
    scope.setContext(context);
    // define module
    const $exports = {};
    const $module = { exports: $exports };
    scope.const(constant_1.MODULE, $module);
    scope.var(constant_1.EXPORTS, $exports);
    let ast;
    if (outast) {
        ast = outast;
    }
    else {
        ast = babylon_1.parse(code, {
            sourceType: "module",
            plugins: [
                "asyncGenerators",
                "classProperties",
                "decorators",
                "doExpressions",
                "exportExtensions",
                "flow",
                "objectRestSpread"
            ]
        });
    }
    const path = new path_1.Path(ast, null, scope, {}, new stack_1.Stack());
    path.preset = preset;
    path.evaluate = evaluate_1.default;
    evaluate_1.default(path);
    // exports
    const moduleVar = scope.hasBinding(constant_1.MODULE);
    return moduleVar ? moduleVar.value.exports : undefined;
}
exports.runInContext = runInContext;
/**
 * Create a context
 * @export
 * @param {ISandBox} [sandbox={}]
 * @returns {Context}
 */
function createContext(sandbox = {}) {
    return new context_1.Context(sandbox);
}
exports.createContext = createContext;
exports.default = { runInContext, createContext };
