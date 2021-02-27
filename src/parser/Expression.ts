import { Lexer, NUMBER, TOKEN_FUNC_PARAMS_DIV, TOKEN_IGNORED, TOKEN_LEFT_PAREN, TOKEN_NAME, TOKEN_RIGHT_PAREN, TOKEN_VAR_PREFIX } from "../lexer1";
import { parseName, parseNumber, parseVariable } from "../parser";
import { Identifier, Literal } from "./Assignment";

export function parseExpression(lexer: Lexer) {
    const ExpressionStatement: any = {
        type: "ExpressionStatement",
        expression: {
            type: "CallExpression",
            callee: {
                type: "Identifier",
                // name: ""
            },
            arguments: [

            ]
        }
    }
    const IdentifierName = parseName(lexer)
    ExpressionStatement.expression.callee.name = IdentifierName
    lexer.NextTokenIs(TOKEN_LEFT_PAREN) // (
    const params = []
    const tokenType = lexer.LookAhead().tokenType
    while (tokenType !== TOKEN_RIGHT_PAREN) {
        let p: any
        // $
        if (tokenType === TOKEN_VAR_PREFIX) {
            p = parseVariable(lexer).Name
            params.push(new Identifier(p))
        } else if (tokenType === NUMBER) {
            p = parseNumber(lexer)
            params.push(new Literal(p))
        }
        if (lexer.nextTokenType === TOKEN_RIGHT_PAREN) {
            break
        }
        lexer.NextTokenIs(TOKEN_FUNC_PARAMS_DIV) // ,
    }
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN) // )
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
    ExpressionStatement.expression.arguments = params
    return ExpressionStatement
}