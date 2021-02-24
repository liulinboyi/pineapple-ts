import { Keywords, TokenNameMap } from "./definition";

/*
SourceCharacter ::=  #x0009 | #x000A | #x000D | [#x0020-#xFFFF] // 大部分的 Unicode 
Name            ::= [_A-Za-z][_0-9A-Za-z]* // 标识符名称第一部分只能出现一次，后面部分零次或多次 
StringCharacter ::= SourceCharacter - '"' // - '"' 代表不包含双引号 ", 即 StringCharacter 是 SourceCharacter 但不包含双引号. (String 要用双引号作为结束/闭合的标记) 
Integer         ::= [0-9]+
Number          ::= Integer Ignored
String          ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
Variable        ::= "$" Name Ignored // 变量 
Assignment      ::= Variable Ignored '=' Ignored ( String | Number ) Ignored
Print           ::= "print" "(" Ignored Variable Ignored ")" Ignored
Statement       ::= Print | Assignment
SourceCode      ::= Statement+ 
Comment         ::= Ignored "#" SourceCharacter Ignored // 注释 

*/

// lexer struct
export interface Lexer {
    sourceCode: string
    lineNum: number
    nextToken: string
    nextTokenType: number
    nextTokenLineNum: number
    hasCache: boolean
}

// token const
export enum Tokens {
    TOKEN_EOF,                // end-of-file
    TOKEN_VAR_PREFIX,         // $
    TOKEN_LEFT_PAREN,         // (
    TOKEN_RIGHT_PAREN,        // )
    TOKEN_EQUAL,              // =
    TOKEN_QUOTE,              // "
    TOKEN_DUOQUOTE,           // ""
    TOKEN_NAME,               // Name ::= [_A-Za-z][_0-9A-Za-z]*
    TOKEN_PRINT,              // print
    TOKEN_IGNORED,            // Ignored  
    INTERGER,                 // [0-9]+
    NUMBER,                   // Integer Ignored
    STRING,                   // String          ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
    COMMENT,                  // Ignored "#" SourceCharacter Ignored
    SourceCharacter,          // 所有代码字符串
}

const { TOKEN_EOF,            // end-of-file
    TOKEN_VAR_PREFIX,         // $
    TOKEN_LEFT_PAREN,         // (
    TOKEN_RIGHT_PAREN,        // )
    TOKEN_EQUAL,              // =
    TOKEN_QUOTE,              // "
    TOKEN_DUOQUOTE,           // ""
    TOKEN_NAME,               // Name ::= [_A-Za-z][_0-9A-Za-z]*
    TOKEN_PRINT,              // print
    TOKEN_IGNORED,            // Ignored  
    INTERGER,                 // [0-9]+
    NUMBER,                   // Integer Ignored
    STRING,                   // String          ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
    COMMENT,                  // Ignored "#" SourceCharacter Ignored
    SourceCharacter,          // 所有代码字符串
} = Tokens

// regex match patterns
const regexName = /^[_\d\w]+/

// 关键字
export const keywords: Keywords = {
    "print": TOKEN_PRINT,
}

export const tokenNameMap: TokenNameMap = {
    [TOKEN_EOF]: "EOF",
    [TOKEN_VAR_PREFIX]: "$",
    [TOKEN_LEFT_PAREN]: "(",
    [TOKEN_RIGHT_PAREN]: ")",
    [TOKEN_EQUAL]: "=",
    [TOKEN_QUOTE]: "\"",
    [TOKEN_DUOQUOTE]: "\"\"",
    [TOKEN_NAME]: "Name",
    [TOKEN_PRINT]: "print",
    [TOKEN_IGNORED]: "Ignored",
    [INTERGER]: "INTERGER",
    [NUMBER]: "NUMBER",
    [STRING]: "STRING",
    [COMMENT]: "COMMENT",
    [SourceCharacter]: "SourceCharacter",
}

export class Lexer {
    constructor(sourceCode: string, lineNum: number, nextToken: string, nextTokenType: number, nextTokenLineNum: number) {
        this.sourceCode = sourceCode;
        this.lineNum = lineNum;
        this.nextToken = nextToken;
        this.nextTokenType = nextTokenType;
        this.hasCache = false;
    }

    /**
    * 断言下一个 Token 是什么
    */
    NextTokenIs(tokenType: number) {
        const {
            lineNum: nowLineNum,
            tokenType: nowTokenType,
            token: nowToken } = this.GetNextToken()
        // syntax error
        if (tokenType != nowTokenType) {
            throw new Error(`NextTokenIs(): syntax error near '${tokenNameMap[nowTokenType]}', expected token: {${tokenNameMap[tokenType]}} but got {${tokenNameMap[nowTokenType]}}.`)
        }
        return { nowLineNum, nowToken }
    }
    // MatchToken() 的封装，每一次调用，都会吃掉相应Token
    GetNextToken(): { lineNum: number, tokenType: number, token: string } {
        // next token already loaded
        if (this.hasCache) {
            // 在LookAhead和LookAheadSkip处对nextTokenLineNum进行了赋值操作
            let lineNum = this.lineNum
            let tokenType = this.nextTokenType
            let token = this.nextToken
            this.hasCache = false
            return {
                lineNum,
                tokenType,
                token
            }
        }
        return this.MatchToken()
    }
    // 匹配Token并跳过匹配的Token
    MatchToken(): { lineNum: number, tokenType: number, token: string } {
        // console.log(this.sourceCode[0], '当前Token')
        // check ignored
        if (this.isIgnored()) {
            return { lineNum: this.lineNum, tokenType: TOKEN_IGNORED, token: "Ignored" }
        }
        // finish
        if (this.sourceCode.length == 0) {
            return { lineNum: this.lineNum, tokenType: TOKEN_EOF, token: tokenNameMap[TOKEN_EOF] }
        }
        // 如果nextTokenType是#，并且字符串能匹配上，则表示是源代码字符串
        // if (this.sourceCode[0].match(/\*/)) {
        //     return { lineNum: this.lineNum, tokenType: SourceCharacter, token: tokenNameMap[SourceCharacter] }
        // }
        // check token
        switch (this.sourceCode[0]) {
            case '$':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: TOKEN_VAR_PREFIX, token: "$" }
            case '(':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: TOKEN_LEFT_PAREN, token: "(" }
            case ')':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: TOKEN_RIGHT_PAREN, token: ")" }
            case '=':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: TOKEN_EQUAL, token: "=" }
            case '"':
                if (this.nextSourceCodeIs("\"\"")) {
                    this.skipSourceCode(2)
                    return { lineNum: this.lineNum, tokenType: TOKEN_DUOQUOTE, token: "\"\"" }
                }
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: TOKEN_QUOTE, token: "\"" }
            case '#':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: COMMENT, token: "#" }
        }
        // check multiple character token
        if (this.sourceCode[0] == '_' || this.isLetter(this.sourceCode[0])) {
            // 扫描关键字
            let token = this.scanName()
            let tokenType = keywords[token];
            let isMatch = tokenType !== undefined ? true : false
            if (isMatch) {
                return { lineNum: this.lineNum, tokenType, token }
            } else {
                return { lineNum: this.lineNum, tokenType: TOKEN_NAME, token }
            }
        }
        if (this.isNumber(this.sourceCode[0])) {
            return { lineNum: this.lineNum, tokenType: NUMBER, token: this.sourceCode[0] }
        }
        // unexpected symbol
        throw new Error(`MatchToken(): unexpected symbol near '${this.sourceCode[0]}'.`);
    }
    isNumber(c: string) {
        return this.isInterger(c)
    }
    isInterger(c: string) {
        return /[0-9]/.test(c)
    }
    isLetter(c: string): boolean {
        return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z'
    }
    skipSourceCode(n: number) {
        this.sourceCode = this.sourceCode.slice(n)
    }
    nextSourceCodeIs(s: string): boolean {
        return this.sourceCode.startsWith(s)
    }
    isNewLine(c: string): boolean {
        return c == '\r' || c == '\n'
    }
    isEmpty() {
        return this.sourceCode.length === 0
    }
    isIgnored(): boolean {
        let isIgnored = false
        // target pattern
        let isNewLine = function (c: string): boolean {
            return c == '\r' || c == '\n'
        }
        let isWhiteSpace = function (c: string): boolean {
            if (['\t', '\n', '\v', '\f', '\r', ' '].includes(c)) {
                return true
            }
            return false
        }
        // matching 匹配isIgnored的情况，把isIgnored的字符都吃掉
        while (this.sourceCode.length > 0) {
            if (this.nextSourceCodeIs("\r\n") || this.nextSourceCodeIs("\n\r")) {
                this.skipSourceCode(2)
                this.lineNum += 1
                isIgnored = true
            } else if (isNewLine(this.sourceCode[0])) {
                this.skipSourceCode(1)
                this.lineNum += 1
                isIgnored = true
            } else if (isWhiteSpace(this.sourceCode[0])) {
                this.skipSourceCode(1)
                isIgnored = true
            } else {
                break
            }
        }
        return isIgnored
    }
    scanName(): string {
        return this.scan(regexName)
    }
    scan(regexp: RegExp): string {
        let token;
        let reg = this.sourceCode.match(regexp)
        if (reg) {
            token = reg[0];
        }
        if (token) {
            this.skipSourceCode(token.length)
            return token
        }
        console.log("unreachable!")
        return ""
    }
    GetLineNum(): number {
        return this.lineNum
    }
    /**
     * LookAhead (向前看) 一个 Token, 告诉我们下一个 Token 是什么
     * @returns
     */
    LookAhead(): { lineNum: number, tokenType: number, token: string } {
        // lexer.nextToken already setted
        if (this.hasCache) {
            return { tokenType: this.nextTokenType, lineNum: this.lineNum, token: this.nextToken }
            // return this.nextTokenType
        }
        // set it
        // 当前行
        let { lineNum, tokenType, token } = this.GetNextToken()
        // *
        // 下一行
        this.hasCache = true
        this.lineNum = lineNum
        this.nextTokenType = tokenType
        this.nextToken = token
        return { tokenType, lineNum, token }
    }

    LookAheadAndSkip(expectedType: number) {
        // get next token
        // 查看看下一个Token信息
        let { lineNum, tokenType, token } = this.GetNextToken()
        // not is expected type, reverse cursor
        if (tokenType != expectedType) {
            this.hasCache = true
            this.lineNum = lineNum
            this.nextTokenType = tokenType
            this.nextToken = token
        }
    }
    // return content before token
    scanBeforeToken(token: string): string {
        // 以单个双引号，划分数组
        // 由于前面已经吃掉了一个单个双引了，此时处理如下 eg: 'aa"后面其他字符串'.split("\"")
        let s = this.sourceCode.split(token)
        if (s.length < 2) {
            console.log("unreachable!")
            return ""
        }
        this.skipSourceCode(s[0].length)
        return s[0]
    }
}


export function NewLexer(sourceCode: string): Lexer {
    return new Lexer(sourceCode, 1, "", 0, 0) // start at line 1 in default.
}

