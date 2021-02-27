import { COMMENT, Lexer, NewLexer, NUMBER, tokenNameMap, TOKEN_DUOQUOTE, TOKEN_EOF, TOKEN_FUNC, TOKEN_IGNORED, TOKEN_NAME, TOKEN_PRINT, TOKEN_QUOTE, TOKEN_VAR_PREFIX } from "./lexer1"
import { Variable } from './definition'
import { paseComment } from './parser/Comment'
import { parsePrint, Print } from "./parser/Print"
import { Assignment, parseAssignment } from "./parser/Assignment"
import { parseFunction } from "./parser/Function"
import { parseExpression } from "./parser/Expression"


export class Program {
    constructor(type?: string, body?: Array<any>, LineNum?: number) {
        this.type = 'Program'
        this.body = body
        this.LineNum = LineNum
    }
}

export interface Program {
    type?: string,
    body?: Array<any>,
    LineNum?: number
}

// SourceCode ::= Statement+ 
function parseSourceCode(lexer: Lexer) {

    let program: Program = new Program()

    let sourceCode: { LineNum?: number, Statements?: Array<Variable> } = {}
    // sourceCode.LineNum = lexer.GetLineNum()
    // sourceCode.Statements = parseStatements(lexer)
    program.LineNum = lexer.GetLineNum()
    program.body = parseStatements(lexer)
    return program
}

// Statement ::= Print | Assignment
function parseStatements(lexer: Lexer) {
    let statements: Array<Variable> = []

    // 先调用LookAhead一次，将GetNextToken的结果缓存
    while (!isSourceCodeEnd(lexer.LookAhead().tokenType)) {
        let statement: Print | Assignment | Comment | undefined = {}
        statement = parseStatement(lexer)
        statements.push(statement)
    }
    return statements
}

function parseStatement(lexer: Lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // skip if source code start with ignored token
    let look = lexer.LookAhead().tokenType
    console.log(look, 'look')
    switch (look) {
        case TOKEN_PRINT:
            return parsePrint(lexer)
        case TOKEN_VAR_PREFIX:
            return parseAssignment(lexer)
        case COMMENT:
            return paseComment(lexer)
        case TOKEN_FUNC:
            return parseFunction(lexer)
        case TOKEN_NAME:
            return parseExpression(lexer)
        default:
            throw new Error("parseStatement(): unknown Statement.")
    }
}

function isSourceCodeEnd(token: number): boolean {
    return token === TOKEN_EOF
}

// Variable ::= "$" Name Ignored
export function parseVariable(lexer: Lexer) {
    let variable: {
        LineNum?: number
        Name: string
    } = { Name: '' }

    variable.LineNum = lexer.GetLineNum()
    lexer.NextTokenIs(TOKEN_VAR_PREFIX)
    variable.Name = parseName(lexer)

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    return variable
}

// Name ::= [_A-Za-z][_0-9A-Za-z]*
export function parseName(lexer: Lexer) {
    let { nowLineNum: _, nowToken: name } = lexer.NextTokenIs(TOKEN_NAME)
    return name
}

// Integer         ::= [0-9]+
// Number          ::= Integer Ignored
export function parseNumber(lexer: Lexer) {
    let str = ""
    let { tokenType, token } = lexer.LookAhead()
    str += token
    // console.log(tokenType, 'parseNumber', str, 'str')
    if (tokenType === NUMBER) {

        while (lexer.isNumber(lexer.sourceCode[0])) {
            // console.log(lexer.sourceCode[0])
            str += lexer.next(1)
        }
        // if (!lexer.isIgnored()) {
        //     throw new Error('Uncaught SyntaxError: Invalid or unexpected token')
        // }
        lexer.NextTokenIs(NUMBER)

        lexer.LookAheadAndSkip(TOKEN_IGNORED)
    }
    return +str
}

// String ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
export function parseString(lexer: Lexer) {
    let str = ""
    let look = lexer.LookAhead().tokenType
    switch (look) {
        case TOKEN_DUOQUOTE:
            lexer.NextTokenIs(TOKEN_DUOQUOTE)
            lexer.LookAheadAndSkip(TOKEN_IGNORED)
            return str
        case TOKEN_QUOTE:
            lexer.NextTokenIs(TOKEN_QUOTE) // 这里已经吃掉一个单个双引号了
            str = lexer.scanBeforeToken(tokenNameMap[TOKEN_QUOTE]) // 这里就会成这样了 eg: aa"后面其他字符串
            lexer.NextTokenIs(TOKEN_QUOTE)
            lexer.LookAheadAndSkip(TOKEN_IGNORED)
            return str
        default:
            return ""
    }
}

export function parse(code: string) {

    let lexer = NewLexer(code)
    let sourceCode = parseSourceCode(lexer);

    lexer.NextTokenIs(TOKEN_EOF)
    // console.log(JSON.stringify(sourceCode), 'sourceCode')
    return sourceCode
}
