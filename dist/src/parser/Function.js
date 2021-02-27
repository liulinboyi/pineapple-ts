"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paseReturnStatement = exports.paseBlock = exports.parseFunction = void 0;
const lexer1_1 = require("../lexer1");
const parser_1 = require("../parser");
const Assignment_1 = require("./Assignment");
const Print_1 = require("./Print");
function parseFunction(lexer) {
    const FunctionDeclaration = {
        type: "FunctionDeclaration",
        id: {
            type: "Identifier",
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
    lexer.NextTokenIs(lexer1_1.TOKEN_FUNC);
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 空格
    const Identifier = parser_1.parseName(lexer);
    FunctionDeclaration.id.name = Identifier;
    lexer.NextTokenIs(lexer1_1.TOKEN_LEFT_PAREN); // (
    const params = [];
    while (lexer.LookAhead().tokenType !== lexer1_1.TOKEN_RIGHT_PAREN) {
        const p = parser_1.parseVariable(lexer);
        params.push(p);
        if (lexer.nextTokenType === lexer1_1.TOKEN_RIGHT_PAREN) {
            break;
        }
        lexer.NextTokenIs(lexer1_1.TOKEN_FUNC_PARAMS_DIV);
    }
    for (let item of params) {
        FunctionDeclaration.params.push({
            type: "Identifier",
            name: item.Name
        });
    }
    lexer.NextTokenIs(lexer1_1.TOKEN_RIGHT_PAREN); // )
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 去除空格回车等
    lexer.NextTokenIs(lexer1_1.BLOCK_START);
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 去除空格回车等
    const block = paseBlock(lexer);
    FunctionDeclaration.body.body = block;
    lexer.NextTokenIs(lexer1_1.BLOCK_END);
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED);
    return FunctionDeclaration;
}
exports.parseFunction = parseFunction;
const BlockStatementBody = [];
function paseBlock(lexer) {
    const ahead = lexer.LookAhead();
    if (ahead.tokenType === lexer1_1.TOKEN_RETURN) { // return
        lexer.NextTokenIs(lexer1_1.TOKEN_RETURN);
        lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED);
        const returnStatement = paseReturnStatement(lexer);
        // returnStatement.argument = returnStatement.declarations[0].init
        // delete returnStatement.declarations
        BlockStatementBody.push({
            type: "ReturnStatement",
            argument: returnStatement.declarations[0].init
        });
    }
    else if (ahead.tokenType === lexer1_1.TOKEN_VAR_PREFIX) { // $
        const VariableDeclaration = Assignment_1.parseAssignment(lexer);
        console.log(VariableDeclaration);
        BlockStatementBody.push({
            type: VariableDeclaration.type,
            declarations: VariableDeclaration.declarations,
            kind: VariableDeclaration.kind
        });
        paseBlock(lexer);
    }
    else if (ahead.tokenType === lexer1_1.TOKEN_PRINT) {
        const print = Print_1.parsePrint(lexer);
        console.log(print);
        BlockStatementBody.push(print);
        paseBlock(lexer);
    }
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
    console.log(tokenType, 'lexer.LookAhead().tokenType');
    // 如果后面仍是$
    if (tokenType === lexer1_1.TOKEN_VAR_PREFIX) {
        const Variable = parser_1.parseVariable(lexer); // 标识符,这里面会把邻近的空格回车删掉
        console.log(Variable, 'Variable');
        const identifier = new Assignment_1.Identifier(Variable.Name);
        VariableDeclarator.init = identifier;
        assignment.type = "ReturnStatement";
        assignment.declarations.push(VariableDeclarator); // 一行只允许声明和初始化一个变量
        let ahead = lexer.LookAhead();
        console.log(ahead, 'parseAssignment Variable ahead');
        if (ahead.tokenType !== lexer1_1.Operator) {
            return assignment;
        }
        else {
            lexer.NextTokenIs(lexer1_1.Operator); // +-*/
            // lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
            lexer.isIgnored();
            const idAndinit = assignment.declarations.pop();
            return Assignment_1.parseBinaryExpression(lexer, idAndinit, assignment, "Identifier");
        }
    }
    else {
        if (tokenType === lexer1_1.NUMBER) {
            // console.log('parseNumber start')
            const literial = new Assignment_1.Literal(parser_1.parseNumber(lexer)); // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial;
            assignment.type = "ReturnStatement";
            // console.log('parseNumber end')
        }
        else {
            const literial = new Assignment_1.Literal(parser_1.parseString(lexer)); // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial;
            assignment.type = "ReturnStatement";
        }
        assignment.declarations.push(VariableDeclarator); // 一行只允许声明和初始化一个变量
        let ahead = lexer.LookAhead();
        console.log(ahead, 'parseAssignment not Variable ahead');
        if (ahead.tokenType !== lexer1_1.Operator) {
            return assignment;
        }
        else {
            lexer.NextTokenIs(lexer1_1.Operator); // +-*/
            // lexer.LookAheadAndSkip(TOKEN_IGNORED); // 空格
            lexer.isIgnored();
            const idAndinit = assignment.declarations.pop();
            return Assignment_1.parseBinaryExpression(lexer, idAndinit, assignment, "Literal");
        }
    }
}
exports.paseReturnStatement = paseReturnStatement;
