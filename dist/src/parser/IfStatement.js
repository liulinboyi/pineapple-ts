"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBinaryExpression = exports.parseIfStatement = void 0;
const lexer1_1 = require("../lexer1");
const parser_1 = require("../parser");
const Assignment_1 = require("./Assignment");
const Function_1 = require("./Function");
function parseIfStatement(lexer) {
    lexer.NextTokenIs(lexer1_1.TOKEN_IF);
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED);
    lexer.NextTokenIs(lexer1_1.TOKEN_LEFT_PAREN); // (
    const test = parseBinaryExpression(lexer);
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
    console.log(consequent);
    lexer.NextTokenIs(lexer1_1.BLOCK_END);
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 去除空格回车等
    return {
        type: "IfStatement",
        test,
        consequent,
    };
}
exports.parseIfStatement = parseIfStatement;
function parseBinaryExpression(lexer) {
    const BinaryExpression = {
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
    };
    const Variable = parser_1.parseVariable(lexer); // 标识符,这里面会把邻近的空格回车删掉
    console.log(Variable, 'Variable');
    const identifier = new Assignment_1.Identifier(Variable.Name);
    console.log(identifier);
    let leftType = identifier.type;
    BinaryExpression.operator = (lexer.NextTokenIs(lexer1_1.Operator)).nowToken; // +-*/
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 空格
    let ahead = lexer.LookAhead();
    console.log(ahead, 'parseBinaryExpression ahead');
    if (leftType === 'Identifier') {
        BinaryExpression.left = new Assignment_1.Identifier(identifier.name);
    }
    else if (leftType === 'Literal') {
        // BinaryExpression.left = new Literal((idAndinit.init as Literal).value)
    }
    if (ahead.tokenType === lexer1_1.NUMBER) {
        console.log('NUMBER');
        const literial = new Assignment_1.Literal(parser_1.parseNumber(lexer));
        BinaryExpression.right = literial;
    }
    else if (ahead.tokenType === lexer1_1.TOKEN_VAR_PREFIX) {
        const Variable = parser_1.parseVariable(lexer); // 标识符
        console.log(Variable, 'Variable');
        const identifier = new Assignment_1.Identifier(Variable.Name);
        BinaryExpression.right = identifier;
    }
    console.log(BinaryExpression);
    return BinaryExpression;
}
exports.parseBinaryExpression = parseBinaryExpression;
