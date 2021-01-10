"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.Assignment = exports.Print = void 0;
const lexer_1 = require("./lexer");
// SourceCode ::= Statement+ 
function parseSourceCode(lexer) {
    let sourceCode = {};
    sourceCode.LineNum = lexer.GetLineNum();
    sourceCode.Statements = parseStatements(lexer);
    return sourceCode;
}
// Statement ::= Print | Assignment
function parseStatements(lexer) {
    let statements = [];
    while (!isSourceCodeEnd(lexer.LookAhead())) {
        let statement = {};
        statement = parseStatement(lexer);
        statements.push(statement);
    }
    return statements;
}
function isSourceCodeEnd(token) {
    if (token == lexer_1.Tokens.TOKEN_EOF) {
        return true;
    }
    return false;
}
function parseStatement(lexer) {
    lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED); // skip if source code start with ignored token
    let look = lexer.LookAhead();
    switch (look) {
        case lexer_1.Tokens.TOKEN_PRINT:
            return parsePrint(lexer);
        case lexer_1.Tokens.TOKEN_VAR_PREFIX:
            return parseAssignment(lexer);
        default:
            throw new Error("parseStatement(): unknown Statement.");
    }
}
class Print {
    constructor(LineNum, Variable) {
        this.LineNum = LineNum;
        this.Variable = Variable;
    }
}
exports.Print = Print;
// Print ::= "print" "(" Ignored Variable Ignored ")" Ignored
function parsePrint(lexer) {
    let print = new Print();
    print.LineNum = lexer.GetLineNum();
    lexer.NextTokenIs(lexer_1.Tokens.TOKEN_PRINT);
    lexer.NextTokenIs(lexer_1.Tokens.TOKEN_LEFT_PAREN);
    lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
    print.Variable = parseVariable(lexer);
    lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
    lexer.NextTokenIs(lexer_1.Tokens.TOKEN_RIGHT_PAREN);
    lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
    return print;
}
// Variable ::= "$" Name Ignored
function parseVariable(lexer) {
    let variable = {};
    variable.LineNum = lexer.GetLineNum();
    lexer.NextTokenIs(lexer_1.Tokens.TOKEN_VAR_PREFIX);
    variable.Name = parseName(lexer);
    lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
    return variable;
}
// Name ::= [_A-Za-z][_0-9A-Za-z]*
function parseName(lexer) {
    let { nowLineNum: _, nowToken: name } = lexer.NextTokenIs(lexer_1.Tokens.TOKEN_NAME);
    return name;
}
class Assignment {
    constructor(LineNum, Variable, String) {
        this.LineNum = LineNum;
        this.Variable = Variable;
        this.String = String;
    }
}
exports.Assignment = Assignment;
// Assignment  ::= Variable Ignored "=" Ignored String Ignored
function parseAssignment(lexer) {
    let assignment = new Assignment();
    assignment.LineNum = lexer.GetLineNum();
    assignment.Variable = parseVariable(lexer);
    lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
    lexer.NextTokenIs(lexer_1.Tokens.TOKEN_EQUAL);
    lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
    assignment.String = parseString(lexer);
    lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
    return assignment;
}
// String ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
function parseString(lexer) {
    let str = "";
    let look = lexer.LookAhead();
    switch (look) {
        case lexer_1.Tokens.TOKEN_DUOQUOTE:
            lexer.NextTokenIs(lexer_1.Tokens.TOKEN_DUOQUOTE);
            lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
            return str;
        case lexer_1.Tokens.TOKEN_QUOTE:
            lexer.NextTokenIs(lexer_1.Tokens.TOKEN_QUOTE);
            str = lexer.scanBeforeToken(lexer_1.tokenNameMap[lexer_1.Tokens.TOKEN_QUOTE]);
            lexer.NextTokenIs(lexer_1.Tokens.TOKEN_QUOTE);
            lexer.LookAheadAndSkip(lexer_1.Tokens.TOKEN_IGNORED);
            return str;
        default:
            return "";
    }
}
function parse(code) {
    let lexer = lexer_1.NewLexer(code);
    let sourceCode = parseSourceCode(lexer);
    lexer.NextTokenIs(lexer_1.Tokens.TOKEN_EOF);
    return sourceCode;
}
exports.parse = parse;
// test
// const paserResult = parse(`$a = "你好，我是pineapple"
// print($a)`)
// console.log(JSON.stringify(paserResult))
//# sourceMappingURL=parser.js.map