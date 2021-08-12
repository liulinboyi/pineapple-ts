import { BLOCK_END, BLOCK_START, Lexer, NUMBER, Operator, TOKEN_FOR, TOKEN_IF, TOKEN_IGNORED, TOKEN_LEFT_PAREN, TOKEN_OF, TOKEN_RIGHT_PAREN, TOKEN_VAR_PREFIX } from "../lexer";
import { parseNumber, parseVariable } from "../parser";
import { Identifier, Literal } from "./Assignment";
import { paseBlock } from "./Function";

export function parseForStatement(lexer: Lexer) {
    lexer.NextTokenIs(TOKEN_FOR)
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    lexer.NextTokenIs(TOKEN_LEFT_PAREN) // (
    const ForOfStatement = parseBinaryExpression(lexer);
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
    lexer.NextTokenIs(BLOCK_END)
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 去除空格回车等
    ForOfStatement.body = consequent
    return ForOfStatement
}



function parseBinaryExpression(lexer: Lexer) {
    const ForOfStatement: {
        type: string,
        await: boolean,
        left: {
            type?: string,
            name?: string,
            value?: number | string,
            declarations?: any,
            kind?: string
        },
        // operator: string,
        right: {
            type?: string,
            name?: string,
        },
        body?: any
    } = {
        type: "ForOfStatement",
        await: false,
        left: {
            type: "VariableDeclaration",
            declarations: [
                {
                    type: "VariableDeclarator",
                    id: {
                        type: "Identifier",
                        name: ""
                    },
                    init: null
                }
            ],
            kind: "let"
        },
        // operator: "",
        right: {
            type: "Identifier",
            // name: "b"
        }
    }

    const Variable = parseVariable(lexer) // 标识符,这里面会把邻近的空格回车删掉
    const identifier = new Identifier(Variable.Name);
    lexer.NextTokenIs(TOKEN_OF)
    // BinaryExpression.operator = (lexer.NextTokenIs(Operator)).nowToken; // +-*/
    lexer.LookAheadAndSkip(TOKEN_IGNORED); // 空格

    let ahead = lexer.LookAhead()
    ForOfStatement.left.declarations[0].id = new Identifier(identifier.name)
    if (ahead.tokenType === NUMBER) {
        const literial = new Literal(parseNumber(lexer))
        ForOfStatement.right = literial
    } else if (ahead.tokenType === TOKEN_VAR_PREFIX) {
        const Variable = parseVariable(lexer) // 标识符
        const identifier = new Identifier(Variable.Name);
        ForOfStatement.right = identifier
    }
    return ForOfStatement
}