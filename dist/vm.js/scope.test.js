"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const scope_1 = require("./scope");
const context_1 = require("./context");
const error_1 = require("./error");
const type_1 = require("./type");
ava_1.default("root scope", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.deepEqual(scope.type, type_1.ScopeType.Root);
    t.deepEqual(scope.level, 0);
    t.deepEqual(scope.length, 0);
    t.deepEqual(scope.parent, null);
    t.true(scope.isolated);
    t.false(scope.invasive);
    t.deepEqual(scope.raw, {});
    t.deepEqual(scope.length, 0);
    t.deepEqual(scope.origin, null);
});
ava_1.default("setContext()", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    scope.setContext(new context_1.Context());
    // default context
    t.deepEqual(scope.raw, context_1.DEFAULT_CONTEXT);
    scope.setContext(new context_1.Context({ name: "axetroy" }));
    // context
    t.deepEqual(scope.raw, { ...context_1.DEFAULT_CONTEXT, ...{ name: "axetroy" } });
    t.true(!!scope.hasOwnBinding("name"));
});
ava_1.default("hasOwnBinding()", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    scope.setContext(new context_1.Context());
    t.true(!!scope.hasOwnBinding("console"));
});
ava_1.default("hasBinding()", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm"));
    const child = scope.createChild(type_1.ScopeType.Block);
    // can not found the var in the current scope
    t.deepEqual(child.hasOwnBinding("name"), undefined);
    // can found the var in the parent scope
    t.true(!!child.hasBinding("name"));
});
ava_1.default("var()", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm"));
    const $var = scope.hasOwnBinding("name");
    if (!$var) {
        return t.fail("Var should be found");
    }
    t.deepEqual($var.value, "vm");
});
ava_1.default("'var' can be redeclare if variable have been declare with 'var'", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm"));
    const $var = scope.hasOwnBinding("name");
    if (!$var) {
        return t.fail("Var should be found");
    }
    t.deepEqual($var.value, "vm");
    t.true(scope.var("name", "hello")); // redeclare
    const $newVar = scope.hasOwnBinding("name");
    if (!$newVar) {
        return t.fail("Var should be found");
    }
    t.deepEqual($var.value, "vm");
    t.deepEqual($newVar.value, "hello");
});
ava_1.default("let can be redeclare", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm")); // declare
    const $var = scope.hasOwnBinding("name");
    if (!$var) {
        return t.fail("Var should be found");
    }
    t.deepEqual($var.value, "vm");
    t.throws(() => {
        scope.let("name", "hello"); // redeclare
    }, error_1.ErrDuplicateDeclard("name").message);
});
ava_1.default("const can be redeclare", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm")); // declare
    const $var = scope.hasOwnBinding("name");
    if (!$var) {
        return t.fail("Var should be found");
    }
    t.deepEqual($var.value, "vm");
    t.throws(() => {
        scope.const("name", "hello"); // redeclare
    }, error_1.ErrDuplicateDeclard("name").message);
});
ava_1.default("delete variable from a scope", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm")); // declare
    t.deepEqual(scope.length, 1);
    const $var = scope.hasOwnBinding("name");
    if (!$var) {
        return t.fail("Var should be found");
    }
    t.deepEqual($var.value, "vm");
    t.true(scope.del("name"));
    t.deepEqual(scope.hasOwnBinding("name"), undefined);
    t.deepEqual(scope.length, 0);
});
ava_1.default("create child", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm")); // declare
    t.deepEqual(scope.level, 0);
    t.deepEqual(scope.length, 1);
    const child = scope.createChild(type_1.ScopeType.Block);
    t.deepEqual(child.level, 1);
    t.deepEqual(child.length, 0);
    t.deepEqual(child.hasOwnBinding("name"), undefined);
    t.true(!!child.hasBinding("name"));
});
ava_1.default("fork child", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm")); // declare
    t.deepEqual(scope.level, 0);
    t.deepEqual(scope.length, 1);
    t.deepEqual(scope.raw, { name: "vm" });
    const sibling = scope.fork(type_1.ScopeType.Block);
    t.deepEqual(sibling.type, type_1.ScopeType.Block);
    t.deepEqual(sibling.level, 0);
    t.deepEqual(sibling.length, 1);
    t.deepEqual(sibling.raw, { name: "vm" });
    t.true(sibling.origin === scope);
    t.true(!!sibling.hasBinding("name"));
    // fork another
    scope.fork();
});
ava_1.default("locate scope", t => {
    const scope = new scope_1.Scope(type_1.ScopeType.Root, null);
    t.true(scope.var("name", "vm")); // declare
    const child = scope.createChild(type_1.ScopeType.Block);
    const childChild = child.createChild(type_1.ScopeType.Block);
    const target = childChild.locate("name");
    if (!target) {
        t.fail("Can not found the target scope");
    }
    t.true(target === scope);
    t.deepEqual(childChild.locate("customerVarName"), undefined);
});
