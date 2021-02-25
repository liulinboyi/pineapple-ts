"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAssignment = exports.Assignment = exports.Literal = void 0;
const parser_1 = require("../parser");
class Literal {
    constructor(value, type = 'Literal') {
        this.type = type;
        this.value = value;
    }
}
exports.Literal = Literal;
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
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED); // 空格
    lexer.NextTokenIs(parser_1.TOKEN_EQUAL); // =
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED); // 空格
    console.log(lexer.LookAhead().tokenType, 'lexer.LookAhead().tokenType');
    // 如果后面仍是$
    if (lexer.LookAhead().tokenType === parser_1.TOKEN_VAR_PREFIX) {
        const Variable = parser_1.parseVariable(lexer); // 标识符
        console.log(Variable, 'Variable');
        const identifier = { name: Variable.Name, type: "Identifier" };
        VariableDeclarator.init = identifier;
        assignment.type = "VariableDeclaration";
        assignment.declarations.push(VariableDeclarator); // 一行只允许声明和初始化一个变量
        // assignment.Variable = Variable
        return assignment;
    }
    else {
        if (lexer.isNumber(lexer.sourceCode[0])) {
            // console.log('parseNumber start')
            const literial = new Literal(parser_1.parseNumber(lexer));
            VariableDeclarator.init = literial;
            // assignment.Literal = literial
            // assignment.type = tokenNameMap[NUMBER]
            assignment.type = "VariableDeclaration";
            // console.log('parseNumber end')
        }
        else {
            const literial = new Literal(parser_1.parseString(lexer));
            // assignment.Literal = literial
            VariableDeclarator.init = literial;
            // assignment.type = tokenNameMap[STRING]
            assignment.type = "VariableDeclaration";
        }
        lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED);
        assignment.declarations.push(VariableDeclarator); // 一行只允许声明和初始化一个变量
        return assignment;
    }
}
exports.parseAssignment = parseAssignment;
