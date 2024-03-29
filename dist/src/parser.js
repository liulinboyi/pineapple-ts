"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.parseString = exports.parseNumber = exports.parseName = exports.parseVariable = exports.Program = void 0;
const lexer_1 = require("./lexer");
const Comment_1 = require("./parser/Comment");
const Print_1 = require("./parser/Print");
const Assignment_1 = require("./parser/Assignment");
const Function_1 = require("./parser/Function");
const Expression_1 = require("./parser/Expression");
class Program {
    constructor(type, body, LineNum) {
        this.type = 'Program';
        this.body = body;
        this.LineNum = LineNum;
    }
}
exports.Program = Program;
// SourceCode ::= Statement+ 
function parseSourceCode(lexer) {
    let program = new Program();
    let sourceCode = {};
    // sourceCode.LineNum = lexer.GetLineNum()
    // sourceCode.Statements = parseStatements(lexer)
    program.LineNum = lexer.GetLineNum();
    program.body = parseStatements(lexer);
    return program;
}
// Statement ::= Print | Assignment
function parseStatements(lexer) {
    let statements = [];
    // 先调用LookAhead一次，将GetNextToken的结果缓存
    while (!isSourceCodeEnd(lexer.LookAhead().tokenType)) {
        let statement = {};
        statement = parseStatement(lexer);
        statements.push(statement);
    }
    return statements;
}
function parseStatement(lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED); // skip if source code start with ignored token
    let look = lexer.LookAhead().tokenType;
    switch (look) {
        case lexer_1.TOKEN_PRINT:
            return Print_1.parsePrint(lexer);
        case lexer_1.TOKEN_VAR_PREFIX:
            return Assignment_1.parseAssignment(lexer);
        case lexer_1.COMMENT:
            return Comment_1.paseComment(lexer);
        case lexer_1.TOKEN_FUNC:
            return Function_1.parseFunction(lexer);
        case lexer_1.TOKEN_NAME:
            return Expression_1.parseExpression(lexer);
        default:
            throw new Error("parseStatement(): unknown Statement.");
    }
}
function isSourceCodeEnd(token) {
    return token === lexer_1.TOKEN_EOF;
}
// Variable ::= "$" Name Ignored
function parseVariable(lexer) {
    let variable = { Name: '' };
    variable.LineNum = lexer.GetLineNum();
    lexer.NextTokenIs(lexer_1.TOKEN_VAR_PREFIX);
    variable.Name = parseName(lexer);
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
    return variable;
}
exports.parseVariable = parseVariable;
// Name ::= [_A-Za-z][_0-9A-Za-z]*
function parseName(lexer) {
    let { nowLineNum: _, nowToken: name } = lexer.NextTokenIs(lexer_1.TOKEN_NAME);
    return name;
}
exports.parseName = parseName;
// Integer         ::= [0-9]+
// Number          ::= Integer Ignored
function parseNumber(lexer) {
    let str = "";
    let { tokenType, token } = lexer.LookAhead();
    str += token;
    if (tokenType === lexer_1.NUMBER) {
        while (lexer.isNumber(lexer.sourceCode[0])) {
            str += lexer.next(1);
        }
        lexer.NextTokenIs(lexer_1.NUMBER);
        lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
    }
    return +str;
}
exports.parseNumber = parseNumber;
// String ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
function parseString(lexer) {
    let str = "";
    let look = lexer.LookAhead().tokenType;
    switch (look) {
        case lexer_1.TOKEN_DUOQUOTE:
            lexer.NextTokenIs(lexer_1.TOKEN_DUOQUOTE);
            lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
            return str;
        case lexer_1.TOKEN_QUOTE:
            lexer.NextTokenIs(lexer_1.TOKEN_QUOTE); // 这里已经吃掉一个单个双引号了
            str = lexer.scanBeforeToken(lexer_1.tokenNameMap[lexer_1.TOKEN_QUOTE]); // 这里就会成这样了 eg: aa"后面其他字符串
            lexer.NextTokenIs(lexer_1.TOKEN_QUOTE);
            lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
            return str;
        default:
            return "";
    }
}
exports.parseString = parseString;
function parse(code) {
    let lexer = lexer_1.NewLexer(code);
    let sourceCode = parseSourceCode(lexer);
    lexer.NextTokenIs(lexer_1.TOKEN_EOF);
    return sourceCode;
}
exports.parse = parse;
