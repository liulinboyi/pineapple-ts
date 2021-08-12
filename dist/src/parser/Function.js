"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paseReturnStatement = exports.paseBlock = exports.parseFunction = void 0;
const lexer_1 = require("../lexer");
const parser_1 = require("../parser");
const Assignment_1 = require("./Assignment");
const IfStatement_1 = require("./IfStatement");
const ForOfStatement_1 = require("./ForOfStatement");
const Print_1 = require("./Print");
function parseFunction(lexer) {
    const FunctionDeclaration = {
        type: "FunctionDeclaration",
        id: {
            type: "Identifier",
            // name: ""
        },
        params: [
        // {
        //     type: "Identifier",
        //     name: ""
        // }
        ],
        body: {
            type: "BlockStatement",
            body: [
            // {
            //     type: "ReturnStatement",
            //     argument: {
            //         type: "BinaryExpression",
            //         left: {
            //         },
            //         operator: '+',
            //         right: {
            //         }
            //     }
            // }
            ]
        }
    };
    lexer.NextTokenIs(lexer_1.TOKEN_FUNC);
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED); // 空格
    const Identifier = parser_1.parseName(lexer);
    FunctionDeclaration.id.name = Identifier;
    lexer.NextTokenIs(lexer_1.TOKEN_LEFT_PAREN); // (
    const params = [];
    while (lexer.LookAhead().tokenType !== lexer_1.TOKEN_RIGHT_PAREN) {
        const p = parser_1.parseVariable(lexer);
        params.push(p);
        if (lexer.nextTokenType === lexer_1.TOKEN_RIGHT_PAREN) {
            break;
        }
        lexer.NextTokenIs(lexer_1.TOKEN_FUNC_PARAMS_DIV);
    }
    for (let item of params) {
        FunctionDeclaration.params.push({
            type: "Identifier",
            name: item.Name
        });
    }
    lexer.NextTokenIs(lexer_1.TOKEN_RIGHT_PAREN); // )
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED); // 去除空格回车等
    lexer.NextTokenIs(lexer_1.BLOCK_START); // {
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED); // 去除空格回车等
    const BlockStatementBody = [];
    const block = paseBlock(lexer, BlockStatementBody);
    FunctionDeclaration.body.body = block;
    lexer.NextTokenIs(lexer_1.BLOCK_END); // }
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
    return FunctionDeclaration;
}
exports.parseFunction = parseFunction;
function paseBlock(lexer, BlockStatementBody) {
    const ahead = lexer.LookAhead();
    if (ahead.tokenType === lexer_1.TOKEN_RETURN) { // return
        lexer.NextTokenIs(lexer_1.TOKEN_RETURN);
        lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
        const returnStatement = paseReturnStatement(lexer);
        // returnStatement.argument = returnStatement.declarations[0].init
        // delete returnStatement.declarations
        BlockStatementBody.push({
            type: "ReturnStatement",
            argument: returnStatement.declarations[0].init
        });
    }
    else if (ahead.tokenType === lexer_1.TOKEN_VAR_PREFIX) { // $
        const VariableDeclaration = Assignment_1.parseAssignment(lexer);
        BlockStatementBody.push({
            type: VariableDeclaration.type,
            declarations: VariableDeclaration.declarations,
            kind: VariableDeclaration.kind
        });
        paseBlock(lexer, BlockStatementBody);
    }
    else if (ahead.tokenType === lexer_1.TOKEN_PRINT) {
        const print = Print_1.parsePrint(lexer);
        BlockStatementBody.push(print);
        paseBlock(lexer, BlockStatementBody);
    }
    else if (ahead.tokenType === lexer_1.TOKEN_IF) {
        const IfStatement = IfStatement_1.parseIfStatement(lexer);
        BlockStatementBody.push(IfStatement);
        paseBlock(lexer, BlockStatementBody);
    }
    else if (ahead.tokenType === lexer_1.TOKEN_FOR) {
        const ForStatement = ForOfStatement_1.parseForStatement(lexer);
        BlockStatementBody.push(ForStatement);
        paseBlock(lexer, BlockStatementBody);
    }
    // else if (ahead.tokenType === TOKEN_NAME) {
    //     const ExpressionStatement = parseExpression(lexer)
    // }
    return BlockStatementBody;
}
exports.paseBlock = paseBlock;
function paseReturnStatement(lexer) {
    let assignment = new Assignment_1.Assignment();
    assignment.LineNum = lexer.GetLineNum();
    assignment.declarations = [];
    let VariableDeclarator = { type: "VariableDeclarator" };
    VariableDeclarator.id = { type: "Identifier" };
    const tokenType = lexer.LookAhead().tokenType;
    // 如果后面仍是$
    if (tokenType === lexer_1.TOKEN_VAR_PREFIX) {
        const Variable = parser_1.parseVariable(lexer); // 标识符,这里面会把邻近的空格回车删掉
        const identifier = new Assignment_1.Identifier(Variable.Name);
        VariableDeclarator.init = identifier;
        assignment.type = "ReturnStatement";
        assignment.declarations.push(VariableDeclarator); // 一行只允许声明和初始化一个变量
        let ahead = lexer.LookAhead();
        if (ahead.tokenType !== lexer_1.Operator) {
            return assignment;
        }
        else {
            lexer.NextTokenIs(lexer_1.Operator); // +-*/
            // lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
            lexer.isIgnored();
            const idAndinit = assignment.declarations.pop();
            return Assignment_1.parseBinaryExpression(lexer, idAndinit, assignment, "Identifier");
        }
    }
    else {
        if (tokenType === lexer_1.NUMBER) {
            const literial = new Assignment_1.Literal(parser_1.parseNumber(lexer)); // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial;
            assignment.type = "ReturnStatement";
        }
        else {
            const literial = new Assignment_1.Literal(parser_1.parseString(lexer)); // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial;
            assignment.type = "ReturnStatement";
        }
        assignment.declarations.push(VariableDeclarator); // 一行只允许声明和初始化一个变量
        let ahead = lexer.LookAhead();
        if (ahead.tokenType !== lexer_1.Operator) {
            return assignment;
        }
        else {
            lexer.NextTokenIs(lexer_1.Operator); // +-*/
            // lexer.LookAheadAndSkip(TOKEN_IGNORED); // 空格
            lexer.isIgnored();
            const idAndinit = assignment.declarations.pop();
            return Assignment_1.parseBinaryExpression(lexer, idAndinit, assignment, "Literal");
        }
    }
}
exports.paseReturnStatement = paseReturnStatement;
