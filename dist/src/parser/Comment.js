"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paseComment = exports.Comment = void 0;
const lexer_1 = require("../lexer");
class Comment {
    constructor(LineNum, Content, type) {
        this.LineNum = LineNum;
        this.Content = Content;
        this.type = type;
    }
}
exports.Comment = Comment;
function paseComment(lexer) {
    let comment = new Comment();
    comment.LineNum = lexer.GetLineNum();
    lexer.NextTokenIs(lexer_1.COMMENT);
    let content = "";
    // 如果换行或者源码为空则停止解析注释
    while (!lexer.isNewLine(lexer.sourceCode[0]) && !lexer.isEmpty()) {
        content += lexer.next(1);
    }
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED);
    comment.Content = content;
    comment.type = lexer_1.tokenNameMap[lexer_1.COMMENT];
    return comment;
}
exports.paseComment = paseComment;
