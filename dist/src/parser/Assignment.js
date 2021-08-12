"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBinaryExpression = exports.Factor = exports.Trem_tail = exports.Trem = exports.Expression_tail = exports.Expressions = exports.parseAssignment = exports.Assignment = exports.Identifier = exports.Literal = void 0;
const lexer_1 = require("../lexer");
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
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED); // 空格
    lexer.NextTokenIs(lexer_1.TOKEN_EQUAL); // =
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED); // 空格
    const tokenType = lexer.LookAhead().tokenType;
    // 如果后面仍是$
    if (tokenType === lexer_1.TOKEN_VAR_PREFIX) {
        // 需要Expressions处理
        const Variable = parser_1.parseVariable(lexer); // 标识符,这里面会把邻近的空格回车删掉
        const identifier = new Identifier(Variable.Name);
        VariableDeclarator.init = identifier;
        assignment.type = "VariableDeclaration";
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
            return parseBinaryExpression(lexer, idAndinit, assignment, "Identifier");
        }
    }
    else {
        if (tokenType === lexer_1.TOKEN_NAME) { // 函数执行并赋值
            const expression = Expression_1.parseExpression(lexer);
            VariableDeclarator.init = expression.expression;
            assignment.type = "VariableDeclaration";
        }
        else if (tokenType === lexer_1.NUMBER || tokenType === lexer_1.TOKEN_LEFT_PAREN) {
            // 需要Expressions处理
            let ex = new BinaryExpression('');
            const expr = Expressions(lexer, ex);
            ex = expr;
            console.log(ex);
            // const literial = new Literal(parseNumber(lexer)) // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = ex;
            assignment.type = "VariableDeclaration";
        }
        else {
            const literial = new Literal(parser_1.parseString(lexer)); // 这里面会把邻近的空格回车删掉
            VariableDeclarator.init = literial;
            assignment.type = "VariableDeclaration";
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
            return parseBinaryExpression(lexer, idAndinit, assignment, "Literal");
        }
    }
}
exports.parseAssignment = parseAssignment;
// $a = $b + $c + $d
// $a = 1 + 2 + 5
// $a = 1 + $b + $c
function Expressions(lexer, expr) {
    let value = Trem(lexer, expr);
    return Expression_tail(lexer, value ? value : expr);
}
exports.Expressions = Expressions;
function Expression_tail(lexer, value) {
    let ahead = lexer.LookAhead();
    if (ahead.token === "+") {
        if (value instanceof BinaryExpression) {
            value.operator = "+";
        }
        lexer.NextTokenIs(lexer_1.Operator);
        const expression = new BinaryExpression("+");
        expression.left = value;
        expression.right = Trem(lexer);
        return expression;
    }
    else if (ahead.token === "-") {
        if (value instanceof BinaryExpression) {
            value.operator = "-";
        }
        lexer.NextTokenIs(lexer_1.Operator);
        const expression = new BinaryExpression("-");
        expression.left = value;
        expression.right = Trem(lexer);
        return expression;
    }
    else {
        lexer.isIgnored();
        return value;
    }
}
exports.Expression_tail = Expression_tail;
function Trem(lexer, expr) {
    let value = Factor(lexer, expr);
    return Trem_tail(lexer, value);
}
exports.Trem = Trem;
function Trem_tail(lexer, value) {
    let ahead = lexer.LookAhead();
    if (ahead.token === "*") {
        lexer.NextTokenIs(lexer_1.Operator);
        const expression = new BinaryExpression("*");
        expression.left = value;
        expression.right = Factor(lexer);
        return expression;
    }
    else if (ahead.token === "/") {
        lexer.NextTokenIs(lexer_1.Operator);
        const expression = new BinaryExpression("/");
        expression.left = value;
        expression.right = Factor(lexer);
        return expression;
    }
    else {
        // 如果不进行NextTokenIs，取消缓存，使用lexer.LookAheadAndSkip(TOKEN_IGNORED)不生效
        // 只能使用这个lexer.isIgnored() api了
        lexer.isIgnored();
        return value;
    }
}
exports.Trem_tail = Trem_tail;
function Factor(lexer, expr) {
    let ahead = lexer.LookAhead();
    if (lexer.isNumber(ahead.token)) {
        let token = "";
        while (lexer.isNumber(ahead.token)) {
            token += ahead.token;
            lexer.NextTokenIs(lexer_1.NUMBER);
            ahead = lexer.LookAhead();
        }
        lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
        return new Literal(+token); // 转换为数字
    }
    else if (ahead.token === "(") {
        // (1 + 2)
        lexer.NextTokenIs(lexer_1.TOKEN_LEFT_PAREN);
        lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
        // type: "BinaryExpression",
        // left: {
        //     // type: "Identifier",
        //     // name: "c"
        // },
        // operator: lexer.nextToken,
        // right: {
        //     // type: "Identifier",
        //     // name: "b"
        // }
        const exp = Expressions(lexer, expr);
        lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
        lexer.NextTokenIs(lexer_1.TOKEN_RIGHT_PAREN);
        return exp;
    }
}
exports.Factor = Factor;
class BinaryExpression {
    constructor(operator, type = "BinaryExpression", left = {}, right = {}) {
        this.type = type;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}
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
    else if (leftType === "BinaryExpression") {
        BinaryExpression.left = idAndinit.init;
    }
    if (ahead.tokenType === lexer_1.NUMBER) {
        const literial = new Literal(parser_1.parseNumber(lexer));
        BinaryExpression.right = literial;
    }
    else if (ahead.tokenType === lexer_1.TOKEN_VAR_PREFIX) {
        const Variable = parser_1.parseVariable(lexer); // 标识符
        const identifier = new Identifier(Variable.Name);
        BinaryExpression.right = identifier;
    }
    let VariableDeclarator = { type: "VariableDeclarator" };
    VariableDeclarator.id = { type: "Identifier" };
    VariableDeclarator.id.name = idAndinit.id.name;
    VariableDeclarator.init = BinaryExpression;
    assignment.declarations.push(VariableDeclarator);
    let oahead = lexer.LookAhead();
    if (oahead.tokenType === lexer_1.Operator) {
        lexer.NextTokenIs(lexer_1.Operator); // +-*/
        // lexer.LookAheadAndSkip(TOKEN_IGNORED); // 空格
        lexer.isIgnored();
        const idAndinits = assignment.declarations.pop();
        parseBinaryExpression(lexer, idAndinits, assignment, "BinaryExpression");
    }
    return assignment;
}
exports.parseBinaryExpression = parseBinaryExpression;
