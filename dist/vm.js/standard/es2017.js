"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.es2017 = void 0;
exports.es2017 = {
    AwaitExpression(path) {
        const { next } = path.ctx;
        next(path.evaluate(path.createChild(path.node.argument))); // call next
    }
};
