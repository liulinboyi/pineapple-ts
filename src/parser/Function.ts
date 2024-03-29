import { TOKEN_IGNORED, TOKEN_LEFT_PAREN, Lexer, TOKEN_RIGHT_PAREN, TOKEN_FUNC_PARAMS_DIV, TOKEN_FUNC, BLOCK_START, TOKEN_RETURN, NUMBER, TOKEN_VAR_PREFIX, Operator, BLOCK_END, TOKEN_PRINT, TOKEN_IF, TOKEN_NAME, TOKEN_FOR } from "../lexer";
import { parseName, parseNumber, parseString, parseVariable } from "../parser";
import { Assignment, Identifier, Literal, parseAssignment, parseBinaryExpression } from "./Assignment";
import { parseExpression } from "./Expression";
import { parseIfStatement } from "./IfStatement";
import { parseForStatement } from './ForOfStatement'
import { parsePrint } from "./Print";

export function parseFunction(lexer: Lexer) {
    const FunctionDeclaration: any = {
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
    }
    lexer.NextTokenIs(TOKEN_FUNC)
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
    const Identifier = parseName(lexer)
    FunctionDeclaration.id.name = Identifier
    lexer.NextTokenIs(TOKEN_LEFT_PAREN) // (
    const params = []
    while (lexer.LookAhead().tokenType !== TOKEN_RIGHT_PAREN) {
        const p = parseVariable(lexer)
        params.push(p)
        if (lexer.nextTokenType === TOKEN_RIGHT_PAREN) {
            break
        }
        lexer.NextTokenIs(TOKEN_FUNC_PARAMS_DIV)
    }
    for (let item of params) {
        FunctionDeclaration.params.push({
            type: "Identifier",
            name: item.Name
        })
    }
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN) // )
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 去除空格回车等

    lexer.NextTokenIs(BLOCK_START) // {
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 去除空格回车等
    const BlockStatementBody: any[] = []
    const block = paseBlock(lexer, BlockStatementBody)
    FunctionDeclaration.body.body = block
    lexer.NextTokenIs(BLOCK_END) // }
    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    return FunctionDeclaration
}

export function paseBlock(lexer: Lexer, BlockStatementBody: any) {
    const ahead = lexer.LookAhead()
    if (ahead.tokenType === TOKEN_RETURN) { // return
        lexer.NextTokenIs(TOKEN_RETURN)
        lexer.LookAheadAndSkip(TOKEN_IGNORED)
        const returnStatement = paseReturnStatement(lexer)
        // returnStatement.argument = returnStatement.declarations[0].init
        // delete returnStatement.declarations
        BlockStatementBody.push({
            type: "ReturnStatement",
            argument: returnStatement.declarations[0].init
        })
    } else if (ahead.tokenType === TOKEN_VAR_PREFIX) { // $
        const VariableDeclaration = parseAssignment(lexer)
        BlockStatementBody.push({
            type: VariableDeclaration.type,
            declarations: VariableDeclaration.declarations,
            kind: VariableDeclaration.kind
        })
        paseBlock(lexer, BlockStatementBody)
    } else if (ahead.tokenType === TOKEN_PRINT) {
        const print = parsePrint(lexer)
        BlockStatementBody.push(print)
        paseBlock(lexer, BlockStatementBody)
    } else if (ahead.tokenType === TOKEN_IF) {
        const IfStatement = parseIfStatement(lexer)
        BlockStatementBody.push(IfStatement)
        paseBlock(lexer, BlockStatementBody)
    } else if (ahead.tokenType === TOKEN_FOR) {
        const ForStatement = parseForStatement(lexer)
        BlockStatementBody.push(ForStatement)
        paseBlock(lexer, BlockStatementBody)
    }
    // else if (ahead.tokenType === TOKEN_NAME) {
    //     const ExpressionStatement = parseExpression(lexer)
    // }
    return BlockStatementBody
}

export function paseReturnStatement(lexer: Lexer) {
    let assignment: any = new Assignment()

    assignment.LineNum = lexer.GetLineNum()
    assignment.declarations = []
    let VariableDeclarator: any = { type: "VariableDeclarator" }
    VariableDeclarator.id = { type: "Identifier" }


    const tokenType = lexer.LookAhead().tokenType

    // 如果后面仍是$
    if (tokenType === TOKEN_VAR_PREFIX) {
        const Variable = parseVariable(lexer) // 标识符,这里面会把邻近的空格回车删掉
        const identifier = new Identifier(Variable.Name);
        VariableDeclarator.init = identifier
        assignment.type = "ReturnStatement"
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
        if (tokenType === NUMBER) {
            const literial = new Literal(parseNumber(lexer)) // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial
            assignment.type = "ReturnStatement"
        } else {
            const literial = new Literal(parseString(lexer)) // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial
            assignment.type = "ReturnStatement"
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
