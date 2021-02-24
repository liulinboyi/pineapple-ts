"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePrint = exports.Print = void 0;
const lexer1_1 = require("../lexer1");
const parser_1 = require("../parser");
class Print {
    constructor(LineNum, Variable, Type) {
        this.LineNum = LineNum;
        this.Variable = Variable;
        this.Type = Type;
    }
}
exports.Print = Print;
// Print ::= "print" "(" Ignored Variable Ignored ")" Ignored
function parsePrint(lexer) {
    let print = new Print();
    print.LineNum = lexer.GetLineNum();
    lexer.NextTokenIs(parser_1.TOKEN_PRINT);
    lexer.NextTokenIs(parser_1.TOKEN_LEFT_PAREN);
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED);
    print.Variable = parser_1.parseVariable(lexer);
    print.Type = lexer1_1.tokenNameMap[parser_1.TOKEN_PRINT];
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED);
    lexer.NextTokenIs(parser_1.TOKEN_RIGHT_PAREN);
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED);
    return print;
}
exports.parsePrint = parsePrint;
//# sourceMappingURL=Print.js.map