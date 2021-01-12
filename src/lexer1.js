"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewLexer = exports.Lexer = exports.tokenNameMap = exports.keywords = exports.Tokens = void 0;
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
})(Tokens = exports.Tokens || (exports.Tokens = {}));
const { TOKEN_EOF, // end-of-file
TOKEN_VAR_PREFIX, // $
TOKEN_LEFT_PAREN, // (
TOKEN_RIGHT_PAREN, // )
TOKEN_EQUAL, // =
TOKEN_QUOTE, // "
TOKEN_DUOQUOTE, // ""
TOKEN_NAME, // Name ::= [_A-Za-z][_0-9A-Za-z]*
TOKEN_PRINT, // print
TOKEN_IGNORED, } = Tokens;
// regex match patterns
const regexName = /^[_\d\w]+/;
exports.keywords = {
    "print": TOKEN_PRINT,
};
exports.tokenNameMap = {
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
    // 匹配Token并跳过匹配的Token
    MatchToken() {
        // console.log(this.sourceCode[0], '当前Token')
        // check ignored
        if (this.isIgnored()) {
            return { lineNum: this.lineNum, tokenType: TOKEN_IGNORED, token: "Ignored" };
        }
        // finish
        if (this.sourceCode.length == 0) {
            return { lineNum: this.lineNum, tokenType: TOKEN_EOF, token: exports.tokenNameMap[TOKEN_EOF] };
        }
        // check token
        switch (this.sourceCode[0]) {
            case '$':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: TOKEN_VAR_PREFIX, token: "$" };
            case '(':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: TOKEN_LEFT_PAREN, token: "(" };
            case ')':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: TOKEN_RIGHT_PAREN, token: ")" };
            case '=':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: TOKEN_EQUAL, token: "=" };
            case '"':
                if (this.nextSourceCodeIs("\"\"")) {
                    this.skipSourceCode(2);
                    return { lineNum: this.lineNum, tokenType: TOKEN_DUOQUOTE, token: "\"\"" };
                }
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: TOKEN_QUOTE, token: "\"" };
        }
        // check multiple character token
        if (this.sourceCode[0] == '_' || this.isLetter(this.sourceCode[0])) {
            let token = this.scanName();
            let tokenType = exports.keywords[token];
            let isMatch = tokenType !== undefined ? true : false;
            if (isMatch) {
                return { lineNum: this.lineNum, tokenType, token };
            }
            else {
                return { lineNum: this.lineNum, tokenType: TOKEN_NAME, token };
            }
        }
        // unexpected symbol
        throw new Error(`MatchToken(): unexpected symbol near '${this.sourceCode[0]}'.`);
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
        // matching
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
    /**
     * LookAhead (向前看) 一个 Token, 告诉我们下一个 Token 是什么
     * @returns
     */
    LookAhead() {
        // lexer.nextToken already setted
        if (this.hasCache) {
            return this.nextTokenType;
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
        return tokenType;
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
    // return content before token
    scanBeforeToken(token) {
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
//# sourceMappingURL=lexer1.js.map