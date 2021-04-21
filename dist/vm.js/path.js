"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = void 0;
class Path {
    constructor(node, parent, scope, ctx, stack) {
        this.node = node;
        this.parent = parent;
        this.scope = scope;
        this.ctx = ctx;
        this.stack = stack;
    }
    /**
     * Generate child scope
     * @template Child
     * @param {Child} node
     * @param {(ScopeType | Scope)} [scope]
     * @param {ICtx} [ctx={}]
     * @returns {Path<Child>}
     * @memberof Path
     */
    createChild(node, scope, ctx) {
        const path = new Path(node, this, scope
            ? typeof scope === "number"
                ? this.scope.createChild(scope)
                : scope
            : this.scope, { ...this.ctx, ...ctx }, this.stack);
        path.evaluate = this.evaluate;
        path.preset = this.preset;
        return path;
    }
    /**
     * Find scope scope with type
     * @param {string} type
     * @returns {(Path<Node> | null)}
     * @memberof Path
     */
    findParent(type) {
        return this.parent
            ? this.parent.node.type === type
                ? this.parent
                : this.parent.findParent(type)
            : null;
    }
}
exports.Path = Path;
