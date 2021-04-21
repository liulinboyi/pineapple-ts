"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presetMap = exports.Kind = exports.isolatedScopeMap = exports.ScopeType = void 0;
var ScopeType;
(function (ScopeType) {
    ScopeType[ScopeType["Root"] = 0] = "Root";
    ScopeType[ScopeType["Function"] = 1] = "Function";
    ScopeType[ScopeType["Method"] = 2] = "Method";
    ScopeType[ScopeType["Constructor"] = 3] = "Constructor";
    ScopeType[ScopeType["For"] = 4] = "For";
    ScopeType[ScopeType["ForChild"] = 5] = "ForChild";
    ScopeType[ScopeType["ForIn"] = 6] = "ForIn";
    ScopeType[ScopeType["ForOf"] = 7] = "ForOf";
    ScopeType[ScopeType["While"] = 8] = "While";
    ScopeType[ScopeType["DoWhile"] = 9] = "DoWhile";
    ScopeType[ScopeType["Do"] = 10] = "Do";
    ScopeType[ScopeType["Switch"] = 11] = "Switch";
    ScopeType[ScopeType["If"] = 12] = "If";
    ScopeType[ScopeType["ElseIf"] = 13] = "ElseIf";
    ScopeType[ScopeType["Object"] = 14] = "Object";
    ScopeType[ScopeType["Try"] = 15] = "Try";
    ScopeType[ScopeType["Catch"] = 16] = "Catch";
    ScopeType[ScopeType["Finally"] = 17] = "Finally";
    ScopeType[ScopeType["Class"] = 18] = "Class";
    ScopeType[ScopeType["Block"] = 19] = "Block";
})(ScopeType = exports.ScopeType || (exports.ScopeType = {}));
exports.isolatedScopeMap = {
    [ScopeType.Function]: true,
    [ScopeType.Constructor]: true,
    [ScopeType.Method]: true,
    [ScopeType.Object]: true
};
var Kind;
(function (Kind) {
    Kind["Var"] = "var";
    Kind["Const"] = "const";
    Kind["Let"] = "let";
})(Kind = exports.Kind || (exports.Kind = {}));
var presetMap;
(function (presetMap) {
    presetMap["es5"] = "es5";
    presetMap["es2015"] = "es2015";
    presetMap["es2016"] = "es2016";
    presetMap["es2017"] = "es2017";
    presetMap["es2018"] = "es2018";
    presetMap["env"] = "env";
})(presetMap = exports.presetMap || (exports.presetMap = {}));
