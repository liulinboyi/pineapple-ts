"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewLexer = exports.Lexer = exports.keywords = exports.tokenNameMap = exports.Tokens = void 0;
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
exports.tokenNameMap = {
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
};
exports.keywords = {
    "print": Tokens.TOKEN_PRINT,
};
// regex match patterns
const regexName = /^[_\d\w]+/;
class Lexer {
    constructor(sourceCode, lineNum, nextToken, nextTokenType, nextTokenLineNum) {
        this.sourceCode = sourceCode;
        this.lineNum = lineNum;
        this.nextToken = nextToken;
        this.nextTokenType = nextTokenType;
        this.nextTokenLineNum = nextTokenLineNum;
    }
    GetNextToken() {
        // next token already loaded
        if (this.nextTokenLineNum > 0) {
            let lineNum = this.nextTokenLineNum;
            let tokenType = this.nextTokenType;
            let token = this.nextToken;
            this.lineNum = this.nextTokenLineNum;
            this.nextTokenLineNum = 0;
            return {
                lineNum,
                tokenType,
                token
            };
        }
        return this.MatchToken();
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
    MatchToken() {
        // check ignored
        if (this.isIgnored()) {
            return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_IGNORED, token: "Ignored" };
        }
        // finish
        if (this.sourceCode.length == 0) {
            return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_EOF, token: exports.tokenNameMap[Tokens.TOKEN_EOF] };
        }
        // check token
        switch (this.sourceCode[0]) {
            case '$':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_VAR_PREFIX, token: "$" };
            case '(':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_LEFT_PAREN, token: "(" };
            case ')':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_RIGHT_PAREN, token: ")" };
            case '=':
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_EQUAL, token: "=" };
            case '"':
                if (this.nextSourceCodeIs("\"\"")) {
                    this.skipSourceCode(2);
                    return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_DUOQUOTE, token: "\"\"" };
                }
                this.skipSourceCode(1);
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_QUOTE, token: "\"" };
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
                return { lineNum: this.lineNum, tokenType: Tokens.TOKEN_NAME, token };
            }
        }
        // unexpected symbol
        throw new Error(`MatchToken(): unexpected symbol near '${this.sourceCode[0]}'.`);
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
    NextTokenIs(tokenType) {
        const { lineNum: nowLineNum, tokenType: nowTokenType, token: nowToken } = this.GetNextToken();
        // syntax error
        if (tokenType != nowTokenType) {
            throw new Error(`NextTokenIs(): syntax error near '${exports.tokenNameMap[nowTokenType]}', expected token: {${exports.tokenNameMap[tokenType]}} but got {${exports.tokenNameMap[nowTokenType]}}.`);
        }
        return { nowLineNum, nowToken };
    }
    GetLineNum() {
        return this.lineNum;
    }
    LookAhead() {
        // lexer.nextToken already setted
        if (this.nextTokenLineNum > 0) {
            return this.nextTokenType;
        }
        // set it
        let nowLineNum = this.lineNum;
        let { lineNum, tokenType, token } = this.GetNextToken();
        this.lineNum = nowLineNum;
        this.nextTokenLineNum = lineNum;
        this.nextTokenType = tokenType;
        this.nextToken = token;
        return tokenType;
    }
    LookAheadAndSkip(expectedType) {
        // get next token
        let nowLineNum = this.lineNum;
        let { lineNum, tokenType, token } = this.GetNextToken();
        // not is expected type, reverse cursor
        if (tokenType != expectedType) {
            this.lineNum = nowLineNum;
            this.nextTokenLineNum = lineNum;
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
// test
// let lexer = NewLexer(`$a = "你好，我是pineapple"
// print($a)
// `)
// console.log(lexer)
//# sourceMappingURL=lexer.js.map