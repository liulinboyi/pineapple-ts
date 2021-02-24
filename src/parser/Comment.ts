import { Lexer, Tokens } from "../lexer1"
import { COMMENT, SourceCharacter, TOKEN_IGNORED } from "../parser"

export interface Comment {
    LineNum?: number,
    Type?: string,
    Content?: string
}

export class Comment {
    constructor(LineNum?: number, Content?: string, Type?: string) {
        this.LineNum = LineNum
        this.Content = Content
        this.Type = Type
    }
}

export function paseComment(lexer: Lexer) {
    let comment = new Comment()
    console.log("paseComment start")

    comment.LineNum = lexer.GetLineNum()
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格
    lexer.NextTokenIs(COMMENT)
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // 空格

    console.log(lexer.isNewLine(lexer.sourceCode[0]), 'isNewLine')
    let content = ""
    // 如果换行或者源码为空则停止解析注释
    while (!lexer.isNewLine(lexer.sourceCode[0]) && !lexer.isEmpty()) {
        content += lexer.sourceCode[0]
        lexer.skipSourceCode(1)
    }

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    comment.Content = content
    return comment
}