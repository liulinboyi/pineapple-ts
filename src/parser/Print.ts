import { Variable } from "../definition"
import { Lexer, tokenNameMap, Tokens } from "../lexer1"
import { parseVariable, TOKEN_IGNORED, TOKEN_LEFT_PAREN, TOKEN_PRINT, TOKEN_RIGHT_PAREN } from "../parser"

export interface Print {
    LineNum?: number,
    Variable?: {
        LineNum?: number
        Name: string
    },
    type?: string,
}

export class Print {
    constructor(LineNum?: number, Variable?: {
        LineNum?: number
        Name: string
    }, type?: string) {
        this.LineNum = LineNum
        this.Variable = Variable
        this.type = type
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
    print.type = tokenNameMap[TOKEN_PRINT]

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN)
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    const p = {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "object": {
                    "type": "Identifier",
                    "name": "console"
                },
                "property": {
                    "type": "Identifier",
                    "name": "log"
                },
                "computed": false,
                "optional": false
            },
            "arguments": [
                {
                    "type": "Identifier",
                    "name": "a"
                }
            ],
            "optional": false
        }
    }
    // print 只打印，不计算
    p.expression.arguments[0].name = print.Variable.Name
    return p
}