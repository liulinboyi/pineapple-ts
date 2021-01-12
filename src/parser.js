"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.Assignment = exports.Print = void 0;
const lexer1_1 = require("./lexer1");
const { TOKEN_EOF, // end-of-file
TOKEN_VAR_PREFIX, // $
TOKEN_LEFT_PAREN, // (
TOKEN_RIGHT_PAREN, // )
TOKEN_EQUAL, // =
TOKEN_QUOTE, // "
TOKEN_DUOQUOTE, // ""
TOKEN_NAME, // Name ::= [_A-Za-z][_0-9A-Za-z]*
TOKEN_PRINT, // print
TOKEN_IGNORED, } = lexer1_1.Tokens;
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
    // 先调用LookAhead一次，将GetNextToken的结果缓存
    while (!isSourceCodeEnd(lexer.LookAhead())) {
        let statement = {};
        statement = parseStatement(lexer);
        statements.push(statement);
    }
    return statements;
}
function parseStatement(lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(TOKEN_IGNORED); // skip if source code start with ignored token
    let look = lexer.LookAhead();
    switch (look) {
        case TOKEN_PRINT:
            return parsePrint(lexer);
        case TOKEN_VAR_PREFIX:
            return parseAssignment(lexer);
        default:
            throw new Error("parseStatement(): unknown Statement.");
    }
}
function isSourceCodeEnd(token) {
    return token === TOKEN_EOF;
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
    lexer.NextTokenIs(TOKEN_PRINT);
    lexer.NextTokenIs(TOKEN_LEFT_PAREN);
    lexer.LookAheadAndSkip(TOKEN_IGNORED);
    print.Variable = parseVariable(lexer);
    lexer.LookAheadAndSkip(TOKEN_IGNORED);
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN);
    lexer.LookAheadAndSkip(TOKEN_IGNORED);
    return print;
}
// Variable ::= "$" Name Ignored
function parseVariable(lexer) {
    let variable = {};
    variable.LineNum = lexer.GetLineNum();
    lexer.NextTokenIs(TOKEN_VAR_PREFIX);
    variable.Name = parseName(lexer);
    lexer.LookAheadAndSkip(TOKEN_IGNORED);
    return variable;
}
// Name ::= [_A-Za-z][_0-9A-Za-z]*
function parseName(lexer) {
    let { nowLineNum: _, nowToken: name } = lexer.NextTokenIs(TOKEN_NAME);
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
    lexer.LookAheadAndSkip(TOKEN_IGNORED);
    lexer.NextTokenIs(TOKEN_EQUAL);
    lexer.LookAheadAndSkip(TOKEN_IGNORED);
    assignment.String = parseString(lexer);
    lexer.LookAheadAndSkip(TOKEN_IGNORED);
    return assignment;
}
// String ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
function parseString(lexer) {
    let str = "";
    let look = lexer.LookAhead();
    switch (look) {
        case TOKEN_DUOQUOTE:
            lexer.NextTokenIs(TOKEN_DUOQUOTE);
            lexer.LookAheadAndSkip(TOKEN_IGNORED);
            return str;
        case TOKEN_QUOTE:
            lexer.NextTokenIs(TOKEN_QUOTE);
            str = lexer.scanBeforeToken(lexer1_1.tokenNameMap[TOKEN_QUOTE]);
            lexer.NextTokenIs(TOKEN_QUOTE);
            lexer.LookAheadAndSkip(TOKEN_IGNORED);
            return str;
        default:
            return "";
    }
}
function parse(code) {
    let lexer = lexer1_1.NewLexer(code);
    let sourceCode = parseSourceCode(lexer);
    lexer.NextTokenIs(TOKEN_EOF);
    // console.log(JSON.stringify(sourceCode), 'sourceCode')
    return sourceCode;
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map