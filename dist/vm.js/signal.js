"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signal = void 0;
class Signal {
    constructor(kind, value) {
        this.kind = kind;
        this.value = value;
    }
    static is(v, type) {
        return v instanceof Signal && v.kind === type;
    }
    static isContinue(v) {
        return Signal.is(v, "continue");
    }
    static isBreak(v) {
        return Signal.is(v, "break");
    }
    static isReturn(v) {
        return Signal.is(v, "return");
    }
}
exports.Signal = Signal;
