import { Lexer, NewLexer, tokenNameMap, Tokens } from "./lexer1"
import { Variable } from './definition'
import { paseComment } from './parser/Comment'
import { parsePrint } from "./parser/Print"
import { parseAssignment } from "./parser/Assignment"

export const { TOKEN_EOF,            // end-of-file
    TOKEN_VAR_PREFIX,         // $
    TOKEN_LEFT_PAREN,         // (
    TOKEN_RIGHT_PAREN,        // )
    TOKEN_EQUAL,              // =
    TOKEN_QUOTE,              // "
    TOKEN_DUOQUOTE,           // ""
    TOKEN_NAME,               // Name ::= [_A-Za-z][_0-9A-Za-z]*
    TOKEN_PRINT,              // print
    TOKEN_IGNORED,            // Ignored  
    INTERGER,                 // [0-9]+
    NUMBER,                   // Integer Ignored
    STRING,                   // String          ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
    COMMENT,                  // Ignored "#" SourceCharacter Ignored
    SourceCharacter,          // 所有代码字符串
} = Tokens

// SourceCode ::= Statement+ 
function parseSourceCode(lexer: Lexer) {

    let sourceCode: { LineNum?: number, Statements?: Array<Variable> } = {}
    sourceCode.LineNum = lexer.GetLineNum()
    sourceCode.Statements = parseStatements(lexer)
    return sourceCode
}

// Statement ::= Print | Assignment
function parseStatements(lexer: Lexer) {
    let statements: Array<Variable> = []

    // 先调用LookAhead一次，将GetNextToken的结果缓存
    while (!isSourceCodeEnd(lexer.LookAhead().tokenType)) {
        let statement = {}
        statement = parseStatement(lexer)
        statements.push(statement)
    }
    return statements
}

function parseStatement(lexer: Lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // skip if source code start with ignored token
    let look = lexer.LookAhead().tokenType
    // console.log(look, 'look')
    switch (look) {
        case TOKEN_PRINT:
            return parsePrint(lexer)
        case TOKEN_VAR_PREFIX:
            return parseAssignment(lexer)
        case COMMENT:
            return paseComment(lexer)
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
        Name?: string
    } = {}

    variable.LineNum = lexer.GetLineNum()
    lexer.NextTokenIs(TOKEN_VAR_PREFIX)
    variable.Name = parseName(lexer)

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    return variable
}

// Name ::= [_A-Za-z][_0-9A-Za-z]*
function parseName(lexer: Lexer) {
    let { nowLineNum: _, nowToken: name } = lexer.NextTokenIs(TOKEN_NAME)
    return name
}

// Integer         ::= [0-9]+
// Number          ::= Integer Ignored
export function parseNumber(lexer: Lexer) {
    let str = ""
    let { tokenType, token } = lexer.MatchToken()
    str += token
    // console.log(tokenType, 'parseNumber', str, 'str')
    if (tokenType === NUMBER) {

        while (lexer.isNumber(lexer.sourceCode[0])) {
            // console.log(lexer.sourceCode[0])
            str = lexer.sourceCode[0];
            lexer.skipSourceCode(1);
        }
        if (!lexer.isIgnored()) {
            throw new Error('Uncaught SyntaxError: Invalid or unexpected token')
        }

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
