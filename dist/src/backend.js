"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Execute = void 0;
const parser_1 = require("./parser");
const Assignment_1 = require("./parser/Assignment");
const Print_1 = require("./parser/Print");
const Comment_1 = require("./parser/Comment");
const index_js_1 = __importDefault(require("../vm/index.js"));
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
    for (let i = 0; i < ast.body.length; i++) {
        console.log(ast.body[i].type, 'type');
        if (ast.body[i].type === "COMMENT") { // 如果是注释，删除
            console.log(i);
            ast.body.splice(i, 1);
            i--;
        }
    }
    console.log(JSON.stringify(ast, null, 4), '\r\rAST');
    console.log("--------------------------------------------");
    // resolve
    const vm = new index_js_1.default(ast);
    vm.run();
    // resolveAST(g, ast)
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
    if (statement instanceof Assignment_1.Assignment) {
        let assignment = statement;
        return resolveAssignment(g, assignment);
    }
    else if (statement instanceof Print_1.Print) {
        let print = statement;
        return resolvePrint(g, print);
    }
    else if (statement instanceof Comment_1.Comment) {
        // 注释，什么也不做
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
    if (assignment.Literal) {
        g.Variables[varName] = assignment.Literal.value;
    }
    else {
        throw new Error("Ivalie value.");
    }
    // if (assignment.String !== null && assignment.String !== undefined) {
    //     g.Variables[varName] = assignment.String
    // } else if (assignment.Number !== null && assignment.Number !== undefined) {
    //     g.Variables[varName] = assignment.Number
    // } else {
    //     throw new Error("Ivalie value.");
    // }
    return null;
}
function resolvePrint(g, print) {
    let varName = "";
    varName = print.Variable.Name;
    // console.log(varName, 'varName')
    // console.log(g, 'g')
    if (varName == "") {
        throw new Error("resolvePrint(): variable name can NOT be empty.");
    }
    let str = "";
    let ok = false;
    str = g.Variables[varName];
    // console.log(str, 'str')
    ok = str !== null && str !== undefined ? true : false;
    if (!ok) {
        throw new Error(`resolvePrint(): variable '$${varName}'not found.`);
    }
    console.log(str);
    return null;
}
