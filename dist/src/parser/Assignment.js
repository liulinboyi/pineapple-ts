"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBinaryExpression = exports.parseAssignment = exports.Assignment = exports.Identifier = exports.Literal = void 0;
const lexer1_1 = require("../lexer1");
const parser_1 = require("../parser");
const Expression_1 = require("./Expression");
class Literal {
    constructor(value, type = 'Literal') {
        this.type = type;
        this.value = value;
    }
}
exports.Literal = Literal;
class Identifier {
    constructor(name, type = "Identifier") {
        this.name = name;
        this.type = type;
    }
}
exports.Identifier = Identifier;
class Assignment {
    constructor(LineNum, Variable, String, num, type, Literal, kind) {
        this.LineNum = LineNum;
        this.Variable = Variable;
        this.String = String;
        this.Number = num;
        this.type = type;
        this.Literal = Literal;
        this.kind = 'let';
    }
}
exports.Assignment = Assignment;
// Assignment  ::= Variable Ignored "=" Ignored String Ignored
function parseAssignment(lexer) {
    let assignment = new Assignment();
    assignment.LineNum = lexer.GetLineNum();
    assignment.declarations = [];
    let VariableDeclarator = { type: "VariableDeclarator" };
    VariableDeclarator.id = { type: "Identifier" };
    VariableDeclarator.id.name = parser_1.parseVariable(lexer).Name;
    // assignment.Variable = parseVariable(lexer) // 标识符
    // $a = "aaa"
    // $a = 1
    // $a = $b
    // $a = 1 - 1
    // $a = $b - 1
    // $a = $b - $c
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 空格
    lexer.NextTokenIs(lexer1_1.TOKEN_EQUAL); // =
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED); // 空格
    const tokenType = lexer.LookAhead().tokenType;
    // 如果后面仍是$
    if (tokenType === lexer1_1.TOKEN_VAR_PREFIX) {
        const Variable = parser_1.parseVariable(lexer); // 标识符,这里面会把邻近的空格回车删掉
        const identifier = new Identifier(Variable.Name);
        VariableDeclarator.init = identifier;
        assignment.type = "VariableDeclaration";
        assignment.declarations.push(VariableDeclarator); // 一行只允许声明和初始化一个变量
        let ahead = lexer.LookAhead();
        if (ahead.tokenType !== lexer1_1.Operator) {
            return assignment;
        }
        else {
            lexer.NextTokenIs(lexer1_1.Operator); // +-*/
            // lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
            lexer.isIgnored();
            const idAndinit = assignment.declarations.pop();
            return parseBinaryExpression(lexer, idAndinit, assignment, "Identifier");
        }
    }
    else {
        if (tokenType === lexer1_1.TOKEN_NAME) { // 函数执行并赋值
            const expression = Expression_1.parseExpression(lexer);
            VariableDeclarator.init = expression.expression;
            assignment.type = "VariableDeclaration";
        }
        else if (tokenType === lexer1_1.NUMBER) {
            const literial = new Literal(parser_1.parseNumber(lexer)); // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial;
            assignment.type = "VariableDeclaration";
        }
        else {
            const literial = new Literal(parser_1.parseString(lexer)); // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial;
            assignment.type = "VariableDeclaration";
        }
        assignment.declarations.push(VariableDeclarator); // 一行只允许声明和初始化一个变量
        let ahead = lexer.LookAhead();
        if (ahead.tokenType !== lexer1_1.Operator) {
            return assignment;
        }
        else {
            lexer.NextTokenIs(lexer1_1.Operator); // +-*/
            // lexer.LookAheadAndSkip(TOKEN_IGNORED); // 空格
            lexer.isIgnored();
            const idAndinit = assignment.declarations.pop();
            return parseBinaryExpression(lexer, idAndinit, assignment, "Literal");
        }
    }
}
exports.parseAssignment = parseAssignment;
function parseBinaryExpression(lexer, idAndinit, assignment, leftType) {
    const BinaryExpression = {
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
    };
    let ahead = lexer.LookAhead();
    if (leftType === 'Identifier') {
        BinaryExpression.left = new Identifier(idAndinit.init.name);
    }
    else if (leftType === 'Literal') {
        BinaryExpression.left = new Literal(idAndinit.init.value);
    }
    if (ahead.tokenType === lexer1_1.NUMBER) {
        const literial = new Literal(parser_1.parseNumber(lexer));
        BinaryExpression.right = literial;
    }
    else if (ahead.tokenType === lexer1_1.TOKEN_VAR_PREFIX) {
        const Variable = parser_1.parseVariable(lexer); // 标识符
        const identifier = new Identifier(Variable.Name);
        BinaryExpression.right = identifier;
    }
    let VariableDeclarator = { type: "VariableDeclarator" };
    VariableDeclarator.id = { type: "Identifier" };
    VariableDeclarator.id.name = idAndinit.id.name;
    VariableDeclarator.init = BinaryExpression;
    assignment.declarations.push(VariableDeclarator);
    return assignment;
}
exports.parseBinaryExpression = parseBinaryExpression;
