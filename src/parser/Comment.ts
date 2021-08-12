import { COMMENT, Lexer, tokenNameMap, Tokens, TOKEN_IGNORED } from "../lexer"

export interface Comment {
    LineNum?: number,
    type?: string,
    Content?: string
}

export class Comment {
    constructor(LineNum?: number, Content?: string, type?: string) {
        this.LineNum = LineNum
        this.Content = Content
        this.type = type
    }
}

export function paseComment(lexer: Lexer) {
    let comment = new Comment()

    comment.LineNum = lexer.GetLineNum()
    lexer.NextTokenIs(COMMENT)

    let content = ""
    // 如果换行或者源码为空则停止解析注释
    while (!lexer.isNewLine(lexer.sourceCode[0]) && !lexer.isEmpty()) {
        content += lexer.next(1)
    }

    lexer.LookAheadAndSkip(TOKEN_IGNORED)
    comment.Content = content
    comment.type = tokenNameMap[COMMENT]
    return comment
}