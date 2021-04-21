"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Var = void 0;
class Var {
    constructor(kind, name, val, scope) {
        this.kind = kind;
        this.name = name;
        this.val = val;
        this.scope = scope;
    }
    get value() {
        return this.val;
    }
    set(value) {
        this.val = value;
    }
}
exports.Var = Var;
