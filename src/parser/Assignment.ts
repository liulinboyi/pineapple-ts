import { Variable } from "../definition";
import { Lexer, tokenNameMap, Tokens } from "../lexer1";
import { NUMBER, parseNumber, parseString, parseVariable, STRING, TOKEN_EQUAL, TOKEN_IGNORED, TOKEN_VAR_PREFIX } from "../parser";

export interface Assignment {
    LineNum?: number,
    Variable?: Variable,
    String?: string,
    Number?: number,
    type?: string,
    Literal?: Literal,
    kind?: string,
}

export interface Literal {
    type?: string,
    value: string | number
}

export class Literal {
    constructor(value: string | number, type = 'Literal') {
        this.type = type
        this.value = value
    }
}

export class Assignment {
    constructor(LineNum?: number, Variable?: Variable, String?: string, num?: number, type?: string, Literal?: Literal, kind?: string) {
        this.LineNum = LineNum
        this.Variable = Variable
        this.String = String
        this.Number = num
        this.type = type
        this.Literal = Literal
        this.kind = 'let'
    }
}


// Assignment  ::= Variable Ignored "=" Ignored String Ignored
export function parseAssignment(lexer: Lexer) {
    let assignment: any = new Assignment()

    assignment.LineNum = lexer.GetLineNum()
    assignment.declarations = []
    let VariableDeclarator: any = { type: "VariableDeclarator" }
    VariableDeclarator.id = { type: "Identifier" }
    VariableDeclarator.id.name = parseVariable(lexer).Name
    // assignment.Variable = parseVariable(lexer) // 标识符

    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
    lexer.NextTokenIs(TOKEN_EQUAL) // =
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格

    console.log(lexer.LookAhead().tokenType, 'lexer.LookAhead().tokenType')
    // 如果后面仍是$
    if (lexer.LookAhead().tokenType === TOKEN_VAR_PREFIX) {
        const Variable = parseVariable(lexer) // 标识符
        console.log(Variable, 'Variable')
        assignment.Variable = Variable
        return assignment
    } else {
        if (lexer.isNumber(lexer.sourceCode[0])) {
            // console.log('parseNumber start')
            const literial = new Literal(parseNumber(lexer))
            VariableDeclarator.init = literial
            // assignment.Literal = literial
            // assignment.type = tokenNameMap[NUMBER]
            assignment.type = "VariableDeclaration"
            // console.log('parseNumber end')
        } else {
            const literial = new Literal(parseString(lexer))
            // assignment.Literal = literial
            VariableDeclarator.init = literial
            // assignment.type = tokenNameMap[STRING]
            assignment.type = "VariableDeclaration"
        }

        lexer.LookAheadAndSkip(TOKEN_IGNORED)
        assignment.declarations.push(VariableDeclarator) // 一行只允许声明和初始化一个变量
        return assignment
    }
}