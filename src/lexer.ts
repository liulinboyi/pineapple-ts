import { Keywords, TokenNameMap } from "./definition";

// lexer struct
export interface Lexer {
    sourceCode: string
    lineNum: number
    nextToken: string
    nextTokenType: number
    nextTokenLineNum: number
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
}

export const tokenNameMap: TokenNameMap = {
    [Tokens.TOKEN_EOF]: "EOF",
    [Tokens.TOKEN_VAR_PREFIX]: "$",
    [Tokens.TOKEN_LEFT_PAREN]: "(",
    [Tokens.TOKEN_RIGHT_PAREN]: ")",
    [Tokens.TOKEN_EQUAL]: "=",
    [Tokens.TOKEN_QUOTE]: "\"",
    [Tokens.TOKEN_DUOQUOTE]: "\"\"",
    [Tokens.TOKEN_NAME]: "Name",
    [Tokens.TOKEN_PRINT]: "print",
    [Tokens.TOKEN_IGNORED]: "Ignored",
}

export const keywords: Keywords = {
    "print": Tokens.TOKEN_PRINT,
}

// regex match patterns
const regexName = /^[_\d\w]+/



export class Lexer {
    constructor(sourceCode: string, lineNum: number, nextToken: string, nextTokenType: number, nextTokenLineNum: number) {
        this.sourceCode = sourceCode;
        this.lineNum = lineNum;
        this.nextToken = nextToken;
        this.nextTokenType = nextTokenType;
        this.nextTokenLineNum = nextTokenLineNum;
    }
    GetNextToken(): { lineNum: number, tokenType: number, token: string } {
        // next token already loaded
        if (this.nextTokenLineNum > 0) {
            let lineNum = this.nextTokenLineNum
            let tokenType = this.nextTokenType
            let token = this.nextToken
            this.lineNum = this.nextTokenLineNum
            this.nextTokenLineNum = 0
            return {
                lineNum,
                tokenType,
                token
            }
        }
        return this.MatchToken()
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
        // matching
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
    MatchToken(): { lineNum: number, tokenType: number, token: string } {
        // check ignored
        if (this.isIgnored()) {
            return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_IGNORED, token: "Ignored" }
        }
        // finish
        if (this.sourceCode.length == 0) {
            return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_EOF, token: tokenNameMap[Tokens.TOKEN_EOF] }
        }
        // check token
        switch (this.sourceCode[0]) {
            case '$':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_VAR_PREFIX, token: "$" }
            case '(':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_LEFT_PAREN, token: "(" }
            case ')':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_RIGHT_PAREN, token: ")" }
            case '=':
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_EQUAL, token: "=" }
            case '"':
                if (this.nextSourceCodeIs("\"\"")) {
                    this.skipSourceCode(2)
                    return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_DUOQUOTE, token: "\"\"" }
                }
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_QUOTE, token: "\"" }
        }
        // check multiple character token
        if (this.sourceCode[0] == '_' || this.isLetter(this.sourceCode[0])) {
            let token = this.scanName()
            let tokenType = keywords[token];
            let isMatch = tokenType !== undefined ? true : false
            if (isMatch) {
                return { lineNum: this.lineNum, tokenType, token }
            } else {
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_NAME, token }
            }
        }
        // unexpected symbol
        throw new Error(`MatchToken(): unexpected symbol near '${this.sourceCode[0]}'.`);
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
    GetLineNum(): number {
        return this.lineNum
    }
    LookAhead(): number {
        // lexer.nextToken already setted
        if (this.nextTokenLineNum > 0) {
            return this.nextTokenType
        }
        // set it
        let nowLineNum = this.lineNum
        let { lineNum, tokenType, token } = this.GetNextToken()
        this.lineNum = nowLineNum
        this.nextTokenLineNum = lineNum
        this.nextTokenType = tokenType
        this.nextToken = token
        return tokenType
    }

    LookAheadAndSkip(expectedType: number) {
        // get next token
        let nowLineNum = this.lineNum
        let { lineNum, tokenType, token } = this.GetNextToken()
        // not is expected type, reverse cursor
        if (tokenType != expectedType) {
            this.lineNum = nowLineNum
            this.nextTokenLineNum = lineNum
            this.nextTokenType = tokenType
            this.nextToken = token
        }
    }
    // return content before token
    scanBeforeToken(token: string): string {
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

// test

// let lexer = NewLexer(`$a = "你好，我是pineapple"
// print($a)
// `)
// console.log(lexer)

