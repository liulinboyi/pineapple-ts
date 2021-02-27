import { Keywords, TokenNameMap } from "./definition";

/*
SourceCharacter ::=  #x0009 | #x000A | #x000D | [#x0020-#xFFFF] // 大部分的 Unicode 
Name            ::= [_A-Za-z][_0-9A-Za-z]* // 标识符名称第一部分只能出现一次，后面部分零次或多次 
StringCharacter ::= SourceCharacter - '"' // - '"' 代表不包含双引号 ", 即 StringCharacter 是 SourceCharacter 但不包含双引号. (String 要用双引号作为结束/闭合的标记) 
Integer         ::= [0-9]+
Number          ::= Integer Ignored
String          ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
Variable        ::= "$" Name Ignored // 变量 
Assignment      ::= Variable Ignored '=' Ignored ( String | Number |  Variable | BinaryExpression) Ignored
Print           ::= "print" "(" Ignored Variable Ignored ")" Ignored
Statement       ::= Print | Assignment
SourceCode      ::= Statement+ 
Comment         ::= Ignored "#" SourceCharacter // 注释 
BinaryExpression::= (Variable | Number) Ignored Operator Ignored (Variable | Number)
Operator        ::= "+" | "-" | "*" | "/" | ">" | "<" | "==" | ">=" | "<="
BinaryExpressions ::= (BinaryExpression Operator)+ Ignored (Variable | Number) // eg: 1: (2 + 1 +) 3   2: ((2 + 1 +) (5 + 6 -)) 3
FunctionDeclaration ::= "func" Ignored Name Ignored "(" Variable ("," Variable)* ")" BlockStatement // eg: 1: func foo ($a) {}  2: func foo ($a[,$b][,$c]) {}   ("," Variable)*这部分是一个或多个
BlockStatement  ::= "{" Ignored (IfStatement | CallFunction | Print | Assignment | ReturnStatement ) Ignored "}"
ReturnStatement ::= "return" (BinaryExpression | Variable)
CallFunction    ::= Name "(" (Variable | Number) ("," (Variable | Number))* ")" Ignored
IfStatement     ::= "if" Ignored "(" Variable Ignored Operator Ignored Variable ")" Ignored BlockStatement Ignored "else" Ignored BlockStatement Ignored

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
    Operator,                 // +-*/ Operator
    TOKEN_FUNC,               // func
    BLOCK_START,              // {
    BLOCK_END,                // }
    TOKEN_RETURN,             // return
    TOKEN_FUNC_PARAMS_DIV,     // ,
    TOKEN_IF,                  // if
}

export const {
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
    Operator,                 // +-*/ Operator
    TOKEN_FUNC,               // func
    BLOCK_START,              // {
    BLOCK_END,                // }
    TOKEN_RETURN,             // return
    TOKEN_FUNC_PARAMS_DIV,    // ,
    TOKEN_IF,                  // if
} = Tokens

// regex match patterns
const regexName = /^[_\d\w]+/

// 关键字
export const keywords: Keywords = {
    "print": TOKEN_PRINT,
    "if": TOKEN_IF,
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
    [Operator]: "Operator",
    [TOKEN_FUNC]: "TOKEN_FUNC",
    [BLOCK_START]: "BLOCK_START",
    [BLOCK_END]: "BLOCK_END",
    [TOKEN_RETURN]: "TOKEN_RETURN",
    [TOKEN_FUNC_PARAMS_DIV]: "TOKEN_FUNC_PARAMS_DIV",
    [TOKEN_IF]: "if",
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
    checkCode(c: string) {
        // 确保源代码，不包含非法字符，对应着SourceCharacter的EBNF
        if (!/\u0009|\u000A|\u000D|[\u0020-\uFFFF]/.test(this.sourceCode[0])) {
            throw new Error('The source code contains characters that cannot be parsed.')
        }
    }
    // 直接跳过几个字符，返回被跳过的字符
    next(skip: number) {
        this.checkCode(this.sourceCode[0])
        const code = this.sourceCode[0]
        this.skipSourceCode(skip)
        return code
    }
    // 匹配Token并跳过匹配的Token
    MatchToken(): { lineNum: number, tokenType: number, token: string } {
        this.checkCode(this.sourceCode[0]) // 只做检查，不吃字符
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
            case '=': // =
                if (this.sourceCode[1] === "=") { // ==
                    this.skipSourceCode(2)
                    return { lineNum: this.lineNum, tokenType: Operator, token: "==" }
                }
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
            case ",":
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: TOKEN_FUNC_PARAMS_DIV, token: "," }
            case "{":
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: BLOCK_START, token: "{" }
            case "}":
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: BLOCK_END, token: "}" }
        }
        // return
        if (this.sourceCode[0] === 'r' && this.sourceCode.slice(0, 6) === 'return') {
            this.skipSourceCode(6)
            return { lineNum: this.lineNum, tokenType: TOKEN_RETURN, token: "return" }
        }
        // func
        if (this.sourceCode[0] === 'f' && this.sourceCode.slice(0, 4) === "func") {
            this.skipSourceCode(4)
            return { lineNum: this.lineNum, tokenType: TOKEN_FUNC, token: "func" }
        }
        // Operator
        const regexpResult = /\+|\-|\*|\//.exec(this.sourceCode[0])
        if (regexpResult) {
            const op = regexpResult[0]
            this.skipSourceCode(1)
            return { lineNum: this.lineNum, tokenType: Operator, token: op }
        }
        // Compare > < = >= <= ==
        const Compare = /\>|\<|\=/.exec(this.sourceCode[0])
        if (Compare) {
            const co = Compare[0]
            this.skipSourceCode(1)
            if (this.sourceCode[0] === "=") {
                this.skipSourceCode(1)
                return { lineNum: this.lineNum, tokenType: Operator, token: `${co}=` }
            } else {
                return { lineNum: this.lineNum, tokenType: Operator, token: co }
            }
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
            const num = this.sourceCode[0]
            this.skipSourceCode(1)
            return { lineNum: this.lineNum, tokenType: NUMBER, token: num }
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

