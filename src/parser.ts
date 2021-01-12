import { Lexer, NewLexer, tokenNameMap, Tokens } from "./lexer1"
import { Variable } from './definition'

const { TOKEN_EOF,            // end-of-file
    TOKEN_VAR_PREFIX,         // $
    TOKEN_LEFT_PAREN,         // (
    TOKEN_RIGHT_PAREN,        // )
    TOKEN_EQUAL,              // =
    TOKEN_QUOTE,              // "
    TOKEN_DUOQUOTE,           // ""
    TOKEN_NAME,               // Name ::= [_A-Za-z][_0-9A-Za-z]*
    TOKEN_PRINT,              // print
    TOKEN_IGNORED,            // Ignored  
} = Tokens

export interface Assignment {
    LineNum?: number,
    Variable?: Variable,
    String?: string
}

export interface Print {
    LineNum?: number,
    Variable?: Variable
}

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
    while (!isSourceCodeEnd(lexer.LookAhead())) {
        let statement = {}
        statement = parseStatement(lexer)
        statements.push(statement)
    }
    return statements
}

function parseStatement(lexer: Lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // skip if source code start with ignored token
    let look = lexer.LookAhead()
    switch (look) {
        case TOKEN_PRINT:
            return parsePrint(lexer)
        case TOKEN_VAR_PREFIX:
            return parseAssignment(lexer)
        default:
            throw new Error("parseStatement(): unknown Statement.")
    }
}

function isSourceCodeEnd(token: number): boolean {
    return token === TOKEN_EOF
}

export class Print {
    constructor(LineNum?: number, Variable?: Variable) {
        this.LineNum = LineNum
        this.Variable = Variable
    }
}

// Print ::= "print" "(" Ignored Variable Ignored ")" Ignored
function parsePrint(lexer: Lexer) {
    let print = new Print()

    print.LineNum = lexer.GetLineNum()
    lexer.NextTokenIs(TOKEN_PRINT)
    lexer.NextTokenIs(TOKEN_LEFT_PAREN)
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    print.Variable = parseVariable(lexer)

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN)
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    return print
}

// Variable ::= "$" Name Ignored
function parseVariable(lexer: Lexer) {
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


export class Assignment {
    constructor(LineNum?: number, Variable?: Variable, String?: string) {
        this.LineNum = LineNum
        this.Variable = Variable
        this.String = String
    }
}

// Assignment  ::= Variable Ignored "=" Ignored String Ignored
function parseAssignment(lexer: Lexer) {
    let assignment = new Assignment()

    assignment.LineNum = lexer.GetLineNum()
    assignment.Variable = parseVariable(lexer)

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    lexer.NextTokenIs(TOKEN_EQUAL)
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    assignment.String = parseString(lexer)

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    return assignment
}

// String ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
function parseString(lexer: Lexer) {
    let str = ""
    let look = lexer.LookAhead()
    switch (look) {
        case TOKEN_DUOQUOTE:
            lexer.NextTokenIs(TOKEN_DUOQUOTE)
            lexer.LookAheadAndSkip(TOKEN_IGNORED)
            return str
        case TOKEN_QUOTE:
            lexer.NextTokenIs(TOKEN_QUOTE)
            str = lexer.scanBeforeToken(tokenNameMap[TOKEN_QUOTE])
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
