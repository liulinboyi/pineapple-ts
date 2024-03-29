"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExpression = void 0;
const lexer_1 = require("../lexer");
const parser_1 = require("../parser");
const Assignment_1 = require("./Assignment");
function parseExpression(lexer) {
    const ExpressionStatement = {
        type: "ExpressionStatement",
        expression: {
            type: "CallExpression",
            callee: {
                type: "Identifier",
                // name: ""
            },
            arguments: []
        }
    };
    const IdentifierName = parser_1.parseName(lexer);
    ExpressionStatement.expression.callee.name = IdentifierName;
    lexer.NextTokenIs(lexer_1.TOKEN_LEFT_PAREN); // (
    const params = [];
    const tokenType = lexer.LookAhead().tokenType;
    while (tokenType !== lexer_1.TOKEN_RIGHT_PAREN) {
        let p;
        // $
        if (tokenType === lexer_1.TOKEN_VAR_PREFIX) {
            p = parser_1.parseVariable(lexer).Name;
            params.push(new Assignment_1.Identifier(p));
        }
        else if (tokenType === lexer_1.NUMBER) {
            p = parser_1.parseNumber(lexer);
            params.push(new Assignment_1.Literal(p));
        }
        if (lexer.nextTokenType === lexer_1.TOKEN_RIGHT_PAREN) {
            break;
        }
        lexer.NextTokenIs(lexer_1.TOKEN_FUNC_PARAMS_DIV); // ,
    }
    lexer.NextTokenIs(lexer_1.TOKEN_RIGHT_PAREN); // )
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED); // 空格
    ExpressionStatement.expression.arguments = params;
    return ExpressionStatement;
}
exports.parseExpression = parseExpression;
