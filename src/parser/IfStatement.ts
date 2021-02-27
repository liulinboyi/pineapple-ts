import { BLOCK_END, BLOCK_START, Lexer, NUMBER, Operator, TOKEN_IF, TOKEN_IGNORED, TOKEN_LEFT_PAREN, TOKEN_RIGHT_PAREN, TOKEN_VAR_PREFIX } from "../lexer1";
import { parseNumber, parseVariable } from "../parser";
import { Identifier, Literal } from "./Assignment";
import { paseBlock } from "./Function";

export function parseIfStatement(lexer: Lexer) {
    lexer.NextTokenIs(TOKEN_IF)
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    lexer.NextTokenIs(TOKEN_LEFT_PAREN) // (
    const test = parseBinaryExpression(lexer);
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN) // )
    lexer.LookAheadAndSkip(TOKEN_IGNORED);
    lexer.NextTokenIs(BLOCK_START) // {
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 去除空格回车等
    const BlockStatementBody: any[] = []
    const consequent = {
        type: "BlockStatement",
        body: []
    }
    consequent.body = paseBlock(lexer, BlockStatementBody)
    console.log(consequent)
    lexer.NextTokenIs(BLOCK_END)
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 去除空格回车等
    return {
        type: "IfStatement",
        test,
        consequent,
    }
}

export function parseBinaryExpression(lexer: Lexer) {
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
        operator: "",
        right: {
            // type: "Identifier",
            // name: "b"
        }
    }

    const Variable = parseVariable(lexer) // 标识符,这里面会把邻近的空格回车删掉
    console.log(Variable, 'Variable')
    const identifier = new Identifier(Variable.Name);
    console.log(identifier)
    let leftType = identifier.type
    BinaryExpression.operator = (lexer.NextTokenIs(Operator)).nowToken; // +-*/
    lexer.LookAheadAndSkip(TOKEN_IGNORED); // 空格

    let ahead = lexer.LookAhead()
    console.log(ahead, 'parseBinaryExpression ahead')
    if (leftType === 'Identifier') {
        BinaryExpression.left = new Identifier(identifier.name)
    } else if (leftType === 'Literal') {
        // BinaryExpression.left = new Literal((idAndinit.init as Literal).value)
    }
    if (ahead.tokenType === NUMBER) {
        console.log('NUMBER')
        const literial = new Literal(parseNumber(lexer))
        BinaryExpression.right = literial
    } else if (ahead.tokenType === TOKEN_VAR_PREFIX) {
        const Variable = parseVariable(lexer) // 标识符
        console.log(Variable, 'Variable')
        const identifier = new Identifier(Variable.Name);
        BinaryExpression.right = identifier
    }
    console.log(BinaryExpression)
    return BinaryExpression
}