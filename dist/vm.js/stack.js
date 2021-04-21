"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
class Stack {
    constructor(limitSize = Error.stackTraceLimit || 10) {
        this.limitSize = limitSize;
        this.stackList = [];
        this.items = [];
    }
    enter(stackName) {
        this.stackList.push(stackName);
    }
    leave() {
        this.stackList.pop();
        this.items.pop();
    }
    push(item) {
        if (this.size > this.limitSize) {
            this.items.shift();
        }
        this.items.push(item);
    }
    get currentStackName() {
        return this.stackList.length
            ? this.stackList[this.stackList.length - 1]
            : "";
    }
    peek() {
        return this.items[this.items.length - 1];
    }
    isEmpty() {
        return this.items.length === 0;
    }
    clear() {
        this.items = [];
    }
    get raw() {
        return this.items
            .reverse()
            .map(v => {
            const meta = `<${v.filename}>:${v.location.start.line}:${v.location.start.column + 1 // while + 1 ? because the stack track diffrent with babylon parser
            }`;
            return v.stack ? `at ${v.stack} (${meta})` : `at ${meta}`;
        })
            .map(v => "    " + v)
            .join("\n");
    }
    get size() {
        return this.items.length;
    }
}
exports.Stack = Stack;
