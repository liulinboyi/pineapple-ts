import { Variable } from "../definition";
import { INTERGER, Lexer, NUMBER, Operator, tokenNameMap, Tokens, TOKEN_EQUAL, TOKEN_IGNORED, TOKEN_LEFT_PAREN, TOKEN_NAME, TOKEN_RIGHT_PAREN, TOKEN_VAR_PREFIX } from "../lexer";
import { parseNumber, parseString, parseVariable } from "../parser";
import { parseExpression } from "./Expression";

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

export interface Identifier {
    name: string,
    type?: string,
}

export class Literal {
    constructor(value: string | number, type = 'Literal') {
        this.type = type
        this.value = value
    }
}

export class Identifier {
    constructor(name: string, type = "Identifier") {
        this.name = name
        this.type = type
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
    // $a = "aaa"
    // $a = 1
    // $a = $b
    // $a = 1 - 1
    // $a = $b - 1
    // $a = $b - $c

    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
    lexer.NextTokenIs(TOKEN_EQUAL) // =
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格

    const tokenType = lexer.LookAhead().tokenType

    // 如果后面仍是$
    if (tokenType === TOKEN_VAR_PREFIX) {
        // 需要Expressions处理
        const Variable = parseVariable(lexer) // 标识符,这里面会把邻近的空格回车删掉
        const identifier = new Identifier(Variable.Name);
        VariableDeclarator.init = identifier
        assignment.type = "VariableDeclaration"
        assignment.declarations.push(VariableDeclarator) // 一行只允许声明和初始化一个变量

        let ahead = lexer.LookAhead()

        if (ahead.tokenType !== Operator) {
            return assignment
        } else {
            lexer.NextTokenIs(Operator) // +-*/
            // lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
            lexer.isIgnored()
            const idAndinit = assignment.declarations.pop()
            return parseBinaryExpression(lexer, idAndinit, assignment, "Identifier")
        }
    } else {
        if (tokenType === TOKEN_NAME) { // 函数执行并赋值
            const expression = parseExpression(lexer)
            VariableDeclarator.init = expression.expression
            assignment.type = "VariableDeclaration"
        } else if (tokenType === NUMBER || tokenType === TOKEN_LEFT_PAREN) {
            // 需要Expressions处理
            let ex = new BinaryExpression('')
            const expr = Expressions(lexer, ex)
            ex = expr
            console.log(ex)
            // const literial = new Literal(parseNumber(lexer)) // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = ex
            assignment.type = "VariableDeclaration"
        } else {
            const literial = new Literal(parseString(lexer)) // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial
            assignment.type = "VariableDeclaration"
        }

        assignment.declarations.push(VariableDeclarator) // 一行只允许声明和初始化一个变量

        let ahead = lexer.LookAhead()

        if (ahead.tokenType !== Operator) {
            return assignment
        } else {
            lexer.NextTokenIs(Operator); // +-*/
            // lexer.LookAheadAndSkip(TOKEN_IGNORED); // 空格
            lexer.isIgnored()
            const idAndinit = assignment.declarations.pop();
            return parseBinaryExpression(lexer, idAndinit, assignment, "Literal");
        }
    }
}

// $a = $b + $c + $d
// $a = 1 + 2 + 5
// $a = 1 + $b + $c

export function Expressions(lexer: Lexer, expr: any) {
    let value = Trem(lexer, expr)
    return Expression_tail(lexer, value ? value : expr)
}

export function Expression_tail(lexer: Lexer, value: any) {
    let ahead = lexer.LookAhead()
    if (ahead.token === "+") {
        if (value instanceof BinaryExpression) {
            value.operator = "+"
        }
        lexer.NextTokenIs(Operator)
        const expression = new BinaryExpression("+")
        expression.left = value;
        expression.right = Trem(lexer)
        return expression
    } else if (ahead.token === "-") {
        if (value instanceof BinaryExpression) {
            value.operator = "-"
        }
        lexer.NextTokenIs(Operator)
        const expression = new BinaryExpression("-")
        expression.left = value;
        expression.right = Trem(lexer)
        return expression
    } else {
        lexer.isIgnored()
        return value
    }
}

export function Trem(lexer: Lexer, expr?: any) {
    let value = Factor(lexer, expr)
    return Trem_tail(lexer, value)
}

export function Trem_tail(lexer: Lexer, value: any) {
    let ahead = lexer.LookAhead()
    if (ahead.token === "*") {
        lexer.NextTokenIs(Operator)
        const expression = new BinaryExpression("*")
        expression.left = value;
        expression.right = Factor(lexer)
        return expression
    } else if (ahead.token === "/") {
        lexer.NextTokenIs(Operator)
        const expression = new BinaryExpression("/")
        expression.left = value;
        expression.right = Factor(lexer)
        return expression
    } else {
        // 如果不进行NextTokenIs，取消缓存，使用lexer.LookAheadAndSkip(TOKEN_IGNORED)不生效
        // 只能使用这个lexer.isIgnored() api了
        lexer.isIgnored()
        return value
    }
}

export function Factor(lexer: Lexer, expr?: any) {
    let ahead = lexer.LookAhead()
    if (lexer.isNumber(ahead.token)) {
        let token = ""
        while (lexer.isNumber(ahead.token)) {
            token += ahead.token
            lexer.NextTokenIs(NUMBER);
            ahead = lexer.LookAhead();
        }
        lexer.LookAheadAndSkip(TOKEN_IGNORED);
        return new Literal(+token); // 转换为数字
    } else if (ahead.token === "(") {
        // (1 + 2)
        lexer.NextTokenIs(TOKEN_LEFT_PAREN)
        lexer.LookAheadAndSkip(TOKEN_IGNORED)
        // type: "BinaryExpression",
        // left: {
        //     // type: "Identifier",
        //     // name: "c"
        // },
        // operator: lexer.nextToken,
        // right: {
        //     // type: "Identifier",
        //     // name: "b"
        // }
        const exp: any = Expressions(lexer, expr)
        lexer.LookAheadAndSkip(TOKEN_IGNORED)
        lexer.NextTokenIs(TOKEN_RIGHT_PAREN)

        return exp
    }
}

interface BinaryExpression {
    type?: string,
    left: any,
    operator?: any,
    right?: any
}

class BinaryExpression {
    constructor(operator: string, type = "BinaryExpression", left = {}, right = {}) {
        this.type = type;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export function parseBinaryExpression(lexer: Lexer, idAndinit: { init: Literal | Identifier, id: Identifier }, assignment: Assignment, leftType: string) {
    const BinaryExpression: {
        type: string,
        left: {
            type?: string,
            name?: string,
            value?: number | string
        },
        operator: string,
        right: {
            type?: string,
            name?: string,
        }
    } = {
        type: "BinaryExpression",
        left: {
            // type: "Identifier",
            // name: "c"
        },
        operator: lexer.nextToken,
        right: {
            // type: "Identifier",
            // name: "b"
        }
    }

    let ahead = lexer.LookAhead()
    if (leftType === 'Identifier') {
        BinaryExpression.left = new Identifier((idAndinit.init as Identifier).name)
    } else if (leftType === 'Literal') {
        BinaryExpression.left = new Literal((idAndinit.init as Literal).value)
    } else if (leftType === "BinaryExpression") {
        BinaryExpression.left = idAndinit.init
    }
    if (ahead.tokenType === NUMBER) {
        const literial = new Literal(parseNumber(lexer))
        BinaryExpression.right = literial
    } else if (ahead.tokenType === TOKEN_VAR_PREFIX) {
        const Variable = parseVariable(lexer) // 标识符
        const identifier = new Identifier(Variable.Name);
        BinaryExpression.right = identifier
    }

    let VariableDeclarator: any = { type: "VariableDeclarator" }
    VariableDeclarator.id = { type: "Identifier" };
    VariableDeclarator.id.name = idAndinit.id.name;
    VariableDeclarator.init = BinaryExpression;
    (assignment as any).declarations.push(VariableDeclarator)

    let oahead = lexer.LookAhead()

    if (oahead.tokenType === Operator) {
        lexer.NextTokenIs(Operator); // +-*/
        // lexer.LookAheadAndSkip(TOKEN_IGNORED); // 空格
        lexer.isIgnored()
        const idAndinits = (assignment as any).declarations.pop();
        parseBinaryExpression(lexer, idAndinits, assignment, "BinaryExpression");
    }


    return assignment
}