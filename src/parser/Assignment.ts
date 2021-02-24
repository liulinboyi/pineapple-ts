import { Variable } from "../definition";
import { Lexer, tokenNameMap, Tokens } from "../lexer1";
import { NUMBER, parseNumber, parseString, parseVariable, STRING, TOKEN_EQUAL, TOKEN_IGNORED } from "../parser";

export interface Assignment {
    LineNum?: number,
    Variable?: Variable,
    String?: string,
    Number?: number,
    Type?: string
}

export class Assignment {
    constructor(LineNum?: number, Variable?: Variable, String?: string, num?: number, type?: string) {
        this.LineNum = LineNum
        this.Variable = Variable
        this.String = String
        this.Number = num
        this.Type = type
    }
}


// Assignment  ::= Variable Ignored "=" Ignored String Ignored
export function parseAssignment(lexer: Lexer) {
    let assignment = new Assignment()

    assignment.LineNum = lexer.GetLineNum()
    assignment.Variable = parseVariable(lexer)

    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
    lexer.NextTokenIs(TOKEN_EQUAL) // =
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格

    if (lexer.isNumber(lexer.sourceCode[0])) {
        // console.log('parseNumber start')
        assignment.Number = parseNumber(lexer)
        assignment.Type = tokenNameMap[NUMBER]
        // console.log('parseNumber end')
    } else {
        assignment.String = parseString(lexer)
        assignment.Type = tokenNameMap[STRING]
    }

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    return assignment
}