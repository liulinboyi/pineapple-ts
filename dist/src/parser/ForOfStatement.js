"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseForStatement = void 0;
const lexer1_1 = require("../lexer1");
const parser_1 = require("../parser");
const Assignment_1 = require("./Assignment");
const Function_1 = require("./Function");
function parseForStatement(lexer) {
    lexer.NextTokenIs(lexer1_1.TOKEN_FOR);
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED);
    lexer.NextTokenIs(lexer1_1.TOKEN_LEFT_PAREN); // (
    const ForOfStatement = parseBinaryExpression(lexer);
    lexer.NextTokenIs(lexer1_1.TOKEN_RIGHT_PAREN); // )
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED);
    lexer.NextTokenIs(lexer1_1.BLOCK_START); // {
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 去除空格回车等
    const BlockStatementBody = [];
    const consequent = {
        type: "BlockStatement",
        body: []
    };
    consequent.body = Function_1.paseBlock(lexer, BlockStatementBody);
    lexer.NextTokenIs(lexer1_1.BLOCK_END);
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 去除空格回车等
    ForOfStatement.body = consequent;
    return ForOfStatement;
}
exports.parseForStatement = parseForStatement;
function parseBinaryExpression(lexer) {
    const ForOfStatement = {
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
    };
    const Variable = parser_1.parseVariable(lexer); // 标识符,这里面会把邻近的空格回车删掉
    const identifier = new Assignment_1.Identifier(Variable.Name);
    lexer.NextTokenIs(lexer1_1.TOKEN_OF);
    // BinaryExpression.operator = (lexer.NextTokenIs(Operator)).nowToken; // +-*/
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 空格
    let ahead = lexer.LookAhead();
    ForOfStatement.left.declarations[0].id = new Assignment_1.Identifier(identifier.name);
    if (ahead.tokenType === lexer1_1.NUMBER) {
        const literial = new Assignment_1.Literal(parser_1.parseNumber(lexer));
        ForOfStatement.right = literial;
    }
    else if (ahead.tokenType === lexer1_1.TOKEN_VAR_PREFIX) {
        const Variable = parser_1.parseVariable(lexer); // 标识符
        const identifier = new Assignment_1.Identifier(Variable.Name);
        ForOfStatement.right = identifier;
    }
    return ForOfStatement;
}
