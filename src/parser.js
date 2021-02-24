"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.parseString = exports.parseNumber = exports.parseVariable = exports.SourceCharacter = exports.COMMENT = exports.STRING = exports.NUMBER = exports.INTERGER = exports.TOKEN_IGNORED = exports.TOKEN_PRINT = exports.TOKEN_NAME = exports.TOKEN_DUOQUOTE = exports.TOKEN_QUOTE = exports.TOKEN_EQUAL = exports.TOKEN_RIGHT_PAREN = exports.TOKEN_LEFT_PAREN = exports.TOKEN_VAR_PREFIX = exports.TOKEN_EOF = void 0;
const lexer1_1 = require("./lexer1");
const Comment_1 = require("./parser/Comment");
const Print_1 = require("./parser/Print");
const Assignment_1 = require("./parser/Assignment");
exports.TOKEN_EOF = lexer1_1.Tokens.TOKEN_EOF, exports.TOKEN_VAR_PREFIX = lexer1_1.Tokens.TOKEN_VAR_PREFIX, exports.TOKEN_LEFT_PAREN = lexer1_1.Tokens.TOKEN_LEFT_PAREN, exports.TOKEN_RIGHT_PAREN = lexer1_1.Tokens.TOKEN_RIGHT_PAREN, exports.TOKEN_EQUAL = lexer1_1.Tokens.TOKEN_EQUAL, exports.TOKEN_QUOTE = lexer1_1.Tokens.TOKEN_QUOTE, exports.TOKEN_DUOQUOTE = lexer1_1.Tokens.TOKEN_DUOQUOTE, exports.TOKEN_NAME = lexer1_1.Tokens.TOKEN_NAME, exports.TOKEN_PRINT = lexer1_1.Tokens.TOKEN_PRINT, exports.TOKEN_IGNORED = lexer1_1.Tokens.TOKEN_IGNORED, exports.INTERGER = lexer1_1.Tokens.INTERGER, exports.NUMBER = lexer1_1.Tokens.NUMBER, exports.STRING = lexer1_1.Tokens.STRING, exports.COMMENT = lexer1_1.Tokens.COMMENT, exports.SourceCharacter = lexer1_1.Tokens.SourceCharacter;
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
    while (!isSourceCodeEnd(lexer.LookAhead().tokenType)) {
        let statement = {};
        statement = parseStatement(lexer);
        statements.push(statement);
    }
    return statements;
}
function parseStatement(lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(exports.TOKEN_IGNORED); // skip if source code start with ignored token
    let look = lexer.LookAhead().tokenType;
    // console.log(look, 'look')
    switch (look) {
        case exports.TOKEN_PRINT:
            return Print_1.parsePrint(lexer);
        case exports.TOKEN_VAR_PREFIX:
            return Assignment_1.parseAssignment(lexer);
        case exports.COMMENT:
            return Comment_1.paseComment(lexer);
        default:
            throw new Error("parseStatement(): unknown Statement.");
    }
}
function isSourceCodeEnd(token) {
    return token === exports.TOKEN_EOF;
}
// Variable ::= "$" Name Ignored
function parseVariable(lexer) {
    let variable = {};
    variable.LineNum = lexer.GetLineNum();
    lexer.NextTokenIs(exports.TOKEN_VAR_PREFIX);
    variable.Name = parseName(lexer);
    lexer.LookAheadAndSkip(exports.TOKEN_IGNORED);
    return variable;
}
exports.parseVariable = parseVariable;
// Name ::= [_A-Za-z][_0-9A-Za-z]*
function parseName(lexer) {
    let { nowLineNum: _, nowToken: name } = lexer.NextTokenIs(exports.TOKEN_NAME);
    return name;
}
// Integer         ::= [0-9]+
// Number          ::= Integer Ignored
function parseNumber(lexer) {
    let str = "";
    let { tokenType, token } = lexer.MatchToken();
    str += token;
    // console.log(tokenType, 'parseNumber', str, 'str')
    if (tokenType === exports.NUMBER) {
        while (lexer.isNumber(lexer.sourceCode[0])) {
            // console.log(lexer.sourceCode[0])
            str = lexer.sourceCode[0];
            lexer.skipSourceCode(1);
        }
        if (!lexer.isIgnored()) {
            throw new Error('Uncaught SyntaxError: Invalid or unexpected token');
        }
        lexer.LookAheadAndSkip(exports.TOKEN_IGNORED);
    }
    return +str;
}
exports.parseNumber = parseNumber;
// String ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
function parseString(lexer) {
    let str = "";
    let look = lexer.LookAhead().tokenType;
    switch (look) {
        case exports.TOKEN_DUOQUOTE:
            lexer.NextTokenIs(exports.TOKEN_DUOQUOTE);
            lexer.LookAheadAndSkip(exports.TOKEN_IGNORED);
            return str;
        case exports.TOKEN_QUOTE:
            lexer.NextTokenIs(exports.TOKEN_QUOTE); // 这里已经吃掉一个单个双引号了
            str = lexer.scanBeforeToken(lexer1_1.tokenNameMap[exports.TOKEN_QUOTE]); // 这里就会成这样了 eg: aa"后面其他字符串
            lexer.NextTokenIs(exports.TOKEN_QUOTE);
            lexer.LookAheadAndSkip(exports.TOKEN_IGNORED);
            return str;
        default:
            return "";
    }
}
exports.parseString = parseString;
function parse(code) {
    let lexer = lexer1_1.NewLexer(code);
    let sourceCode = parseSourceCode(lexer);
    lexer.NextTokenIs(exports.TOKEN_EOF);
    // console.log(JSON.stringify(sourceCode), 'sourceCode')
    return sourceCode;
}
exports.parse = parse;
//# sourceMappingURL=parser.js.map