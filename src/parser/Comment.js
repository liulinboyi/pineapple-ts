"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paseComment = exports.Comment = void 0;
const parser_1 = require("../parser");
class Comment {
    constructor(LineNum, Content, Type) {
        this.LineNum = LineNum;
        this.Content = Content;
        this.Type = Type;
    }
}
exports.Comment = Comment;
function paseComment(lexer) {
    let comment = new Comment();
    console.log("paseComment start");
    comment.LineNum = lexer.GetLineNum();
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED); // 空格
    lexer.NextTokenIs(parser_1.COMMENT);
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED); // 空格
    console.log(lexer.isNewLine(lexer.sourceCode[0]), 'isNewLine');
    let content = "";
    // 如果换行或者源码为空则停止解析注释
    while (!lexer.isNewLine(lexer.sourceCode[0]) && !lexer.isEmpty()) {
        content += lexer.sourceCode[0];
        lexer.skipSourceCode(1);
    }
    lexer.LookAheadAndSkip(parser_1.TOKEN_IGNORED);
    comment.Content = content;
    return comment;
}
exports.paseComment = paseComment;
//# sourceMappingURL=Comment.js.map