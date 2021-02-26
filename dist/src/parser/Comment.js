"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paseComment = exports.Comment = void 0;
const lexer1_1 = require("../lexer1");
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
    console.log("paseComment start");
    comment.LineNum = lexer.GetLineNum();
    lexer.NextTokenIs(lexer1_1.COMMENT);
    console.log(lexer.isNewLine(lexer.sourceCode[0]), 'isNewLine');
    let content = "";
    // 如果换行或者源码为空则停止解析注释
    while (!lexer.isNewLine(lexer.sourceCode[0]) && !lexer.isEmpty()) {
        content += lexer.next(1);
    }
    lexer.LookAheadAndSkip(lexer1_1.TOKEN_IGNORED);
    comment.Content = content;
    comment.type = lexer1_1.tokenNameMap[lexer1_1.COMMENT];
    return comment;
}
exports.paseComment = paseComment;
