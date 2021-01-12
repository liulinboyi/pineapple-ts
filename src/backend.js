"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Execute = void 0;
const parser_1 = require("./parser");
let GlobalVariables = {
    Variables: {}
};
function NewGlobalVariables() {
    var g = GlobalVariables;
    g.Variables = {};
    return g;
}
function Execute(code) {
    var ast = {};
    let g = NewGlobalVariables();
    // parse
    ast = parser_1.parse(code);
    // resolve
    resolveAST(g, ast);
}
exports.Execute = Execute;
function resolveAST(g, ast) {
    if (ast.Statements.length == 0) {
        throw new Error("resolveAST(): no code to execute, please check your input.");
    }
    for (let statement of ast.Statements) {
        resolveStatement(g, statement);
    }
    return null;
}
function resolveStatement(g, statement) {
    if (statement instanceof parser_1.Assignment) {
        let assignment = statement;
        return resolveAssignment(g, assignment);
    }
    else if (statement instanceof parser_1.Print) {
        let print = statement;
        return resolvePrint(g, print);
    }
    else {
        throw new Error("resolveStatement(): undefined statement type.");
    }
}
function resolveAssignment(g, assignment) {
    let varName = "";
    varName = assignment.Variable.Name;
    if (varName == "") {
        throw new Error("resolveAssignment(): variable name can NOT be empty.");
    }
    g.Variables[varName] = assignment.String;
    return null;
}
function resolvePrint(g, print) {
    let varName = "";
    varName = print.Variable.Name;
    if (varName == "") {
        throw new Error("resolvePrint(): variable name can NOT be empty.");
    }
    let str = "";
    let ok = false;
    str = g.Variables[varName];
    ok = str ? true : false;
    if (!ok) {
        throw new Error(`resolvePrint(): variable '$${varName}'not found.`);
    }
    console.log(str);
    return null;
}
//# sourceMappingURL=backend.js.map