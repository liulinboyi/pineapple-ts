import { Variable } from "../definition"
import { Lexer, tokenNameMap, Tokens } from "../lexer1"
import { parseVariable, TOKEN_IGNORED, TOKEN_LEFT_PAREN, TOKEN_PRINT, TOKEN_RIGHT_PAREN } from "../parser"

export interface Print {
    LineNum?: number,
    Variable?: Variable,
    Type?: string,
}

export class Print {
    constructor(LineNum?: number, Variable?: Variable, Type?: string) {
        this.LineNum = LineNum
        this.Variable = Variable
        this.Type = Type
    }
}

// Print ::= "print" "(" Ignored Variable Ignored ")" Ignored
export function parsePrint(lexer: Lexer) {
    let print = new Print()

    print.LineNum = lexer.GetLineNum()
    lexer.NextTokenIs(TOKEN_PRINT)
    lexer.NextTokenIs(TOKEN_LEFT_PAREN)
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    print.Variable = parseVariable(lexer)
    print.Type = tokenNameMap[TOKEN_PRINT]

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN)
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    return print
}