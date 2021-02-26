"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewLexer = exports.Lexer = exports.tokenNameMap = exports.keywords = exports.Operator = exports.SourceCharacter = exports.COMMENT = exports.STRING = exports.NUMBER = exports.INTERGER = exports.TOKEN_IGNORED = exports.TOKEN_PRINT = exports.TOKEN_NAME = exports.TOKEN_DUOQUOTE = exports.TOKEN_QUOTE = exports.TOKEN_EQUAL = exports.TOKEN_RIGHT_PAREN = exports.TOKEN_LEFT_PAREN = exports.TOKEN_VAR_PREFIX = exports.TOKEN_EOF = exports.Tokens = void 0;
// token const
var Tokens;
(function (Tokens) {
    Tokens[Tokens["TOKEN_EOF"] = 0] = "TOKEN_EOF";
    Tokens[Tokens["TOKEN_VAR_PREFIX"] = 1] = "TOKEN_VAR_PREFIX";
    Tokens[Tokens["TOKEN_LEFT_PAREN"] = 2] = "TOKEN_LEFT_PAREN";
    Tokens[Tokens["TOKEN_RIGHT_PAREN"] = 3] = "TOKEN_RIGHT_PAREN";
    Tokens[Tokens["TOKEN_EQUAL"] = 4] = "TOKEN_EQUAL";
    Tokens[Tokens["TOKEN_QUOTE"] = 5] = "TOKEN_QUOTE";
    Tokens[Tokens["TOKEN_DUOQUOTE"] = 6] = "TOKEN_DUOQUOTE";
    Tokens[Tokens["TOKEN_NAME"] = 7] = "TOKEN_NAME";
    Tokens[Tokens["TOKEN_PRINT"] = 8] = "TOKEN_PRINT";
    Tokens[Tokens["TOKEN_IGNORED"] = 9] = "TOKEN_IGNORED";
    Tokens[Tokens["INTERGER"] = 10] = "INTERGER";
    Tokens[Tokens["NUMBER"] = 11] = "NUMBER";
    Tokens[Tokens["STRING"] = 12] = "STRING";
    Tokens[Tokens["COMMENT"] = 13] = "COMMENT";
    Tokens[Tokens["SourceCharacter"] = 14] = "SourceCharacter";
    Tokens[Tokens["Operator"] = 15] = "Operator";
})(Tokens = exports.Tokens || (exports.Tokens = {}));
exports.TOKEN_EOF = Tokens.TOKEN_EOF, exports.TOKEN_VAR_PREFIX = Tokens.TOKEN_VAR_PREFIX, exports.TOKEN_LEFT_PAREN = Tokens.TOKEN_LEFT_PAREN, exports.TOKEN_RIGHT_PAREN = Tokens.TOKEN_RIGHT_PAREN, exports.TOKEN_EQUAL = Tokens.TOKEN_EQUAL, exports.TOKEN_QUOTE = Tokens.TOKEN_QUOTE, exports.TOKEN_DUOQUOTE = Tokens.TOKEN_DUOQUOTE, exports.TOKEN_NAME = Tokens.TOKEN_NAME, exports.TOKEN_PRINT = Tokens.TOKEN_PRINT, exports.TOKEN_IGNORED = Tokens.TOKEN_IGNORED, exports.INTERGER = Tokens.INTERGER, exports.NUMBER = Tokens.NUMBER, exports.STRING = Tokens.STRING, exports.COMMENT = Tokens.COMMENT, exports.SourceCharacter = Tokens.SourceCharacter, exports.Operator = Tokens.Operator;
// regex match patterns
const regexName = /^[_\d\w]+/;
// 关键字
exports.keywords = {
    "print": exports.TOKEN_PRINT,
};
exports.tokenNameMap = {
    [exports.TOKEN_EOF]: "EOF",
    [exports.TOKEN_VAR_PREFIX]: "$",
    [exports.TOKEN_LEFT_PAREN]: "(",
    [exports.TOKEN_RIGHT_PAREN]: ")",
    [exports.TOKEN_EQUAL]: "=",
    [exports.TOKEN_QUOTE]: "\"",
    [exports.TOKEN_DUOQUOTE]: "\"\"",
    [exports.TOKEN_NAME]: "Name",
    [exports.TOKEN_PRINT]: "print",
    [exports.TOKEN_IGNORED]: "Ignored",
    [exports.INTERGER]: "INTERGER",
    [exports.NUMBER]: "NUMBER",
    [exports.STRING]: "STRING",
    [exports.COMMENT]: "COMMENT",
    [exports.SourceCharacter]: "SourceCharacter",
    [exports.Operator]: "Operator",
};
class Lexer {
    constructor(sourceCode, lineNum, nextToken, nextTokenType, nextTokenLineNum) {
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
    LookAhead() {
        // lexer.nextToken already setted
        if (this.hasCache) {
            return { tokenType: this.nextTokenType, lineNum: this.lineNum, token: this.nextToken };
            // return this.nextTokenType
        }
        // set it
        // 当前行
        let { lineNum, tokenType, token } = this.GetNextToken();
        // *
        // 下一行
        this.hasCache = true;
        this.lineNum = lineNum;
        this.nextTokenType = tokenType;
        this.nextToken = token;
        return { tokenType, lineNum, token };
    }
    LookAheadAndSkip(expectedType) {
        // get next token
        // 查看看下一个Token信息
        let { lineNum, tokenType, token } = this.GetNextToken();
        // not is expected type, reverse cursor
        if (tokenType != expectedType) {
            this.hasCache = true;
            this.lineNum = lineNum;
            this.nextTokenType = tokenType;
            this.nextToken = token;
        }
    }
    /**
    * 断言下一个 Token 是什么
    */
    NextTokenIs(tokenType) {
        const { lineNum: nowLineNum, tokenType: nowTokenType, token: nowToken } = this.GetNextToken();
        // syntax error
        if (tokenType != nowTokenType) {
            throw new Error(`NextTokenIs(): syntax error near '${exports.tokenNameMap[nowTokenType]}', expected token: {${exports.tokenNameMap[tokenType]}} but got {${exports.tokenNameMap[nowTokenType]}}.`);
        }
        return { nowLineNum, nowToken };
    }
    // MatchToken() 的封装，每一次调用，都会吃掉相应Token
    GetNextToken() {
        // next token already loaded
        if (this.hasCache) {
            // 在LookAhead和LookAheadSkip处对nextTokenLineNum进行了赋值操作
            let lineNum = this.lineNum;
            let tokenType = this.nextTokenType;
            let token = this.nextToken;
            this.hasCache = false;
            return {
                lineNum,
                tokenType,
                token
            };
        }
        return this.MatchToken();
    }
    checkCode(c) {
        // 确保源代码，不包含非法字符，对应着SourceCharacter的EBNF
        if (!/\u0009|\u000A|\u000D|[\u0020-\uFFFF]/.test(this.sourceCode[0])) {
            throw new Error('The source code contains characters that cannot be parsed.');
        }
    }
    // 直接跳过几个字符，返回被跳过的字符
    next(skip) {
        this.checkCode(this.sourceCode[0]);
        const code = this.sourceCode[0];
        this.skipSourceCode(skip);
        return code;
    }
    // 匹配Token并跳过匹配的Token
    MatchToken() {
        this.checkCode(this.sourceCode[0]); // 只做检查，不吃字符
        // console.log(this.sourceCode[0], '当前Token')
        // check ignored
        if (this.isIgnored()) {
            return { lineNum: this.lineNum, tokenType: exports.TOKEN_IGNORED, token: "Ignored" };
        }
        // finish
        if (this.sourceCode.length == 0) {
            return { lineNum: this.lineNum, tokenType: exports.TOKEN_EOF, token: exports.tokenNameMap[exports.TOKEN_EOF] };
        }
        // 如果nextTokenType是#，并且字符串能匹配上，则表示是源代码字符串
        // if (this.sourceCode[0].match(/\*/)) {
        //     return { lineNum: this.lineNum, tokenType: SourceCharacter, token: tokenNameMap[SourceCharacter] }
        // }
        // check token
        switch (this.sourceCode[0]) {
            case '$':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: exports.TOKEN_VAR_PREFIX, token: "$" };
            case '(':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: exports.TOKEN_LEFT_PAREN, token: "(" };
            case ')':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: exports.TOKEN_RIGHT_PAREN, token: ")" };
            case '=':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: exports.TOKEN_EQUAL, token: "=" };
            case '"':
                if (this.nextSourceCodeIs("\"\"")) {
                    this.skipSourceCode(2);
                    return { lineNum: this.lineNum, tokenType: exports.TOKEN_DUOQUOTE, token: "\"\"" };
                }
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: exports.TOKEN_QUOTE, token: "\"" };
            case '#':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: exports.COMMENT, token: "#" };
        }
        // Operator
        if (/\+|\-|\*|\//.test(this.sourceCode[0])) {
            const op = this.sourceCode[0];
            this.skipSourceCode(1);
            return { lineNum: this.lineNum, tokenType: exports.Operator, token: op };
        }
        // check multiple character token
        if (this.sourceCode[0] == '_' || this.isLetter(this.sourceCode[0])) {
            // 扫描关键字
            let token = this.scanName();
            let tokenType = exports.keywords[token];
            let isMatch = tokenType !== undefined ? true : false;
            if (isMatch) {
                return { lineNum: this.lineNum, tokenType, token };
            }
            else {
                return { lineNum: this.lineNum, tokenType: exports.TOKEN_NAME, token };
            }
        }
        if (this.isNumber(this.sourceCode[0])) {
            const num = this.sourceCode[0];
            this.skipSourceCode(1);
            return { lineNum: this.lineNum, tokenType: exports.NUMBER, token: num };
        }
        // unexpected symbol
        throw new Error(`MatchToken(): unexpected symbol near '${this.sourceCode[0]}'.`);
    }
    isNumber(c) {
        return this.isInterger(c);
    }
    isInterger(c) {
        return /[0-9]/.test(c);
    }
    isLetter(c) {
        return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z';
    }
    skipSourceCode(n) {
        this.sourceCode = this.sourceCode.slice(n);
    }
    nextSourceCodeIs(s) {
        return this.sourceCode.startsWith(s);
    }
    isNewLine(c) {
        return c == '\r' || c == '\n';
    }
    isEmpty() {
        return this.sourceCode.length === 0;
    }
    isIgnored() {
        let isIgnored = false;
        // target pattern
        let isNewLine = function (c) {
            return c == '\r' || c == '\n';
        };
        let isWhiteSpace = function (c) {
            if (['\t', '\n', '\v', '\f', '\r', ' '].includes(c)) {
                return true;
            }
            return false;
        };
        // matching 匹配isIgnored的情况，把isIgnored的字符都吃掉
        while (this.sourceCode.length > 0) {
            if (this.nextSourceCodeIs("\r\n") || this.nextSourceCodeIs("\n\r")) {
                this.skipSourceCode(2);
                this.lineNum += 1;
                isIgnored = true;
            }
            else if (isNewLine(this.sourceCode[0])) {
                this.skipSourceCode(1);
                this.lineNum += 1;
                isIgnored = true;
            }
            else if (isWhiteSpace(this.sourceCode[0])) {
                this.skipSourceCode(1);
                isIgnored = true;
            }
            else {
                break;
            }
        }
        return isIgnored;
    }
    scanName() {
        return this.scan(regexName);
    }
    scan(regexp) {
        let token;
        let reg = this.sourceCode.match(regexp);
        if (reg) {
            token = reg[0];
        }
        if (token) {
            this.skipSourceCode(token.length);
            return token;
        }
        console.log("unreachable!");
        return "";
    }
    GetLineNum() {
        return this.lineNum;
    }
    // return content before token
    scanBeforeToken(token) {
        // 以单个双引号，划分数组
        // 由于前面已经吃掉了一个单个双引了，此时处理如下 eg: 'aa"后面其他字符串'.split("\"")
        let s = this.sourceCode.split(token);
        if (s.length < 2) {
            console.log("unreachable!");
            return "";
        }
        this.skipSourceCode(s[0].length);
        return s[0];
    }
}
exports.Lexer = Lexer;
function NewLexer(sourceCode) {
    return new Lexer(sourceCode, 1, "", 0, 0); // start at line 1 in default.
}
exports.NewLexer = NewLexer;
