"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAssignment = exports.Assignment = void 0;
const lexer1_1 = require("../lexer1");
const parser_1 = require("../parser");
class Assignment {
    constructor(LineNum, Variable, String, num, type) {
        this.LineNum = LineNum;
        this.Variable = Variable;
        this.String = String;
        this.Number = num;
        this.Type = type;
    }
}
exports.Assignment = Assignment;
// Assignment  ::= Variable Ignored "=" Ignored String Ignored
function parseAssignment(lexer) {
    let assignment = new Assignment();
    assignment.LineNum = lexer.GetLineNum();
    assignment.Variable = parser_1.parseVariable(lexer);
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED); // 空格
    lexer.NextTokenIs(parser_1.TOKEN_EQUAL); // =
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED); // 空格
    if (lexer.isNumber(lexer.sourceCode[0])) {
        // console.log('parseNumber start')
        assignment.Number = parser_1.parseNumber(lexer);
        assignment.Type = lexer1_1.tokenNameMap[parser_1.NUMBER];
        // console.log('parseNumber end')
    }
    else {
        assignment.String = parser_1.parseString(lexer);
        assignment.Type = lexer1_1.tokenNameMap[parser_1.STRING];
    }
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED);
    return assignment;
}
exports.parseAssignment = parseAssignment;
//# sourceMappingURL=Assignment.js.map