import { Lexer, NewLexer, tokenNameMap, Tokens } from "./lexer"
import { Variable } from './definition'


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

    while (!isSourceCodeEnd(lexer.LookAhead())) {
        let statement = {}
        statement = parseStatement(lexer)
        statements.push(statement)
    }
    return statements
}

function isSourceCodeEnd(token: number): boolean {
    if (token == Tokens.TOKEN_EOF) {
        return true
    }
    return false
}

function parseStatement(lexer: Lexer) {
    lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED) // skip if source code start with ignored token
    let look = lexer.LookAhead()
    switch (look) {
        case Tokens.TOKEN_PRINT:
            return parsePrint(lexer)
        case Tokens.TOKEN_VAR_PREFIX:
            return parseAssignment(lexer)
        default:
            throw new Error("parseStatement(): unknown Statement.")
    }
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
    lexer.NextTokenIs(Tokens.TOKEN_PRINT)
    lexer.NextTokenIs(Tokens.TOKEN_LEFT_PAREN)
    lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
    print.Variable = parseVariable(lexer)

    lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
    lexer.NextTokenIs(Tokens.TOKEN_RIGHT_PAREN)
    lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
    return print
}

// Variable ::= "$" Name Ignored
function parseVariable(lexer: Lexer) {
    let variable: {
        LineNum?: number
        Name?: string
    } = {}

    variable.LineNum = lexer.GetLineNum()
    lexer.NextTokenIs(Tokens.TOKEN_VAR_PREFIX)
    variable.Name = parseName(lexer)

    lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
    return variable
}

// Name ::= [_A-Za-z][_0-9A-Za-z]*
function parseName(lexer: Lexer) {
    let { nowLineNum: _, nowToken: name } = lexer.NextTokenIs(Tokens.TOKEN_NAME)
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

    lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
    lexer.NextTokenIs(Tokens.TOKEN_EQUAL)
    lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
    assignment.String = parseString(lexer)

    lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
    return assignment
}

// String ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
function parseString(lexer: Lexer) {
    let str = ""
    let look = lexer.LookAhead()
    switch (look) {
        case Tokens.TOKEN_DUOQUOTE:
            lexer.NextTokenIs(Tokens.TOKEN_DUOQUOTE)
            lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
            return str
        case Tokens.TOKEN_QUOTE:
            lexer.NextTokenIs(Tokens.TOKEN_QUOTE)
            str = lexer.scanBeforeToken(tokenNameMap[Tokens.TOKEN_QUOTE])
            lexer.NextTokenIs(Tokens.TOKEN_QUOTE)
            lexer.LookAheadAndSkip(Tokens.TOKEN_IGNORED)
            return str
        default:
            return ""
    }
}

export function parse(code: string) {

    let lexer = NewLexer(code)
    let sourceCode = parseSourceCode(lexer);

    lexer.NextTokenIs(Tokens.TOKEN_EOF)
    return sourceCode
}

// test

// const paserResult = parse(`$a = "你好，我是pineapple"
// print($a)`)

// console.log(JSON.stringify(paserResult))
