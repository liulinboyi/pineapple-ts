"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.es5 = exports.AssignmentExpressionEvaluateMap = exports.BinaryExpressionOperatorEvaluateMap = void 0;
const types = __importStar(require("babel-types"));
const lodash_isfunction_1 = __importDefault(require("lodash.isfunction"));
const error_1 = require("../error");
const runtime_1 = require("../runtime");
const type_1 = require("../type");
const signal_1 = require("../signal");
const constant_1 = require("../constant");
const babel_types_1 = require("../packages/babel-types");
const utils_1 = require("../utils");
const Prototype_1 = require("../Prototype");
const This_1 = require("../This");
function overriteStack(err, stack, node) {
    stack.push({
        filename: constant_1.ANONYMOUS,
        stack: stack.currentStackName,
        location: node.loc
    });
    err.stack = err.toString() + "\n" + stack.raw;
    return err;
}
exports.BinaryExpressionOperatorEvaluateMap = {
    // tslint:disable-next-line
    "==": (a, b) => a == b,
    // tslint:disable-next-line
    "!=": (a, b) => a != b,
    "===": (a, b) => a === b,
    "!==": (a, b) => a !== b,
    "<": (a, b) => a < b,
    "<=": (a, b) => a <= b,
    ">": (a, b) => a > b,
    ">=": (a, b) => a >= b,
    // tslint:disable-next-line
    "<<": (a, b) => a << b,
    // tslint:disable-next-line
    ">>": (a, b) => a >> b,
    // tslint:disable-next-line
    ">>>": (a, b) => a >>> b,
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
    "%": (a, b) => a % b,
    // tslint:disable-next-line
    "|": (a, b) => a | b,
    // tslint:disable-next-line
    "^": (a, b) => a ^ b,
    // tslint:disable-next-line
    "&": (a, b) => a & b,
    // "**": (a, b) => {
    //   throw ErrImplement('**')
    // },
    in: (a, b) => a in b,
    instanceof: (a, b) => a instanceof b
};
exports.AssignmentExpressionEvaluateMap = {
    "=": ($var, v) => {
        $var.set(v);
        return v;
    },
    "+=": ($var, v) => {
        $var.set($var.value + v);
        return $var.value;
    },
    "-=": ($var, v) => {
        $var.set($var.value - v);
        return $var.value;
    },
    "*=": ($var, v) => {
        $var.set($var.value * v);
        return $var.value;
    },
    "**=": ($var, v) => {
        $var.set(Math.pow($var.value, v));
        return $var.value;
    },
    "/=": ($var, v) => {
        $var.set($var.value / v);
        return $var.value;
    },
    "%=": ($var, v) => {
        $var.set($var.value % v);
        return $var.value;
    },
    "<<=": ($var, v) => {
        // tslint:disable-next-line: no-bitwise
        $var.set($var.value << v);
        return $var.value;
    },
    ">>=": ($var, v) => {
        // tslint:disable-next-line: no-bitwise
        $var.set($var.value >> v);
        return $var.value;
    },
    ">>>=": ($var, v) => {
        // tslint:disable-next-line: no-bitwise
        $var.set($var.value >>> v);
        return $var.value;
    },
    "|=": ($var, v) => {
        // tslint:disable-next-line: no-bitwise
        $var.set($var.value | v);
        return $var.value;
    },
    "^=": ($var, v) => {
        // tslint:disable-next-line: no-bitwise
        $var.set($var.value ^ v);
        return $var.value;
    },
    "&=": ($var, v) => {
        // tslint:disable-next-line: no-bitwise
        $var.set($var.value & v);
        return $var.value;
    }
};
exports.es5 = {
    File(path) {
        path.evaluate(path.createChild(path.node.program));
    },
    Program(path) {
        const { node: program, scope } = path;
        // hoisting
        for (const node of program.body) {
            if (babel_types_1.isFunctionDeclaration(node)) {
                path.evaluate(path.createChild(node));
            }
            else if (babel_types_1.isVariableDeclaration(node)) {
                for (const declaration of node.declarations) {
                    if (node.kind === type_1.Kind.Var) {
                        scope.var(declaration.id.name, undefined);
                    }
                }
            }
        }
        for (const node of program.body) {
            if (!babel_types_1.isFunctionDeclaration(node)) {
                path.evaluate(path.createChild(node));
            }
        }
    },
    Identifier(path) {
        const { node, scope, stack } = path;
        if (node.name === constant_1.UNDEFINED) {
            return undefined;
        }
        const $var = scope.hasBinding(node.name);
        if ($var) {
            return $var.value;
        }
        else {
            throw overriteStack(error_1.ErrNotDefined(node.name), stack, node);
        }
    },
    Literal(path) {
        return path.node.value;
    },
    RegExpLiteral(path) {
        const { node } = path;
        return new RegExp(node.pattern, node.flags);
    },
    StringLiteral(path) {
        return path.node.value;
    },
    NumericLiteral(path) {
        return path.node.value;
    },
    BooleanLiteral(path) {
        return path.node.value;
    },
    NullLiteral(path) {
        return null;
    },
    IfStatement(path) {
        const ifScope = path.scope.createChild(type_1.ScopeType.If);
        ifScope.invasive = true;
        ifScope.isolated = false;
        if (path.evaluate(path.createChild(path.node.test, ifScope))) {
            return path.evaluate(path.createChild(path.node.consequent, ifScope));
        }
        else if (path.node.alternate) {
            return path.evaluate(path.createChild(path.node.alternate, ifScope));
        }
    },
    EmptyStatement(path) {
        // do nothing
    },
    BlockStatement(path) {
        const { node: block, scope } = path;
        let blockScope = !scope.isolated
            ? scope
            : scope.createChild(type_1.ScopeType.Block);
        if (scope.isolated) {
            blockScope = scope.createChild(type_1.ScopeType.Block);
            blockScope.invasive = true;
        }
        else {
            blockScope = scope;
        }
        blockScope.isolated = true;
        // hoisting
        for (const node of block.body) {
            if (babel_types_1.isFunctionDeclaration(node)) {
                path.evaluate(path.createChild(node));
            }
            else if (babel_types_1.isVariableDeclaration(node)) {
                for (const declaration of node.declarations) {
                    if (node.kind === type_1.Kind.Var) {
                        if (!scope.isolated && scope.invasive) {
                            const targetScope = (function get(s) {
                                if (s.parent) {
                                    if (s.parent.invasive) {
                                        return get(s.parent);
                                    }
                                    else {
                                        return s.parent;
                                    }
                                }
                                else {
                                    return s;
                                }
                            })(scope);
                            targetScope.parent.var(declaration.id.name, undefined);
                        }
                        else {
                            scope.var(declaration.id.name, undefined);
                        }
                    }
                }
            }
        }
        let tempResult;
        for (const node of block.body) {
            const result = (tempResult = path.evaluate(path.createChild(node, blockScope)));
            if (result instanceof signal_1.Signal) {
                return result;
            }
        }
        // to support do-expression
        // anyway, return the last item
        return tempResult;
    },
    // babylon parse in strict mode and disable WithStatement
    // WithStatement(path) {
    // throw ErrNotSupport(path.node.type);
    // },
    DebuggerStatement(path) {
        // tslint:disable-next-line
        debugger;
    },
    LabeledStatement(path) {
        const label = path.node.label;
        return path.evaluate(path.createChild(path.node.body, path.scope, { labelName: label.name }));
    },
    BreakStatement(path) {
        const label = path.node.label;
        return new signal_1.Signal("break", label ? label.name : undefined);
    },
    ContinueStatement(path) {
        const label = path.node.label;
        return new signal_1.Signal("continue", label ? label.name : undefined);
    },
    ReturnStatement(path) {
        return new signal_1.Signal("return", path.node.argument
            ? path.evaluate(path.createChild(path.node.argument))
            : undefined);
    },
    VariableDeclaration(path) {
        const { node, scope, stack } = path;
        const kind = node.kind;
        for (const declaration of node.declarations) {
            const varKeyValueMap = {};
            /**
             * example:
             *
             * var a = 1
             */
            if (babel_types_1.isIdentifier(declaration.id)) {
                varKeyValueMap[declaration.id.name] = declaration.init
                    ? path.evaluate(path.createChild(declaration.init))
                    : undefined;
            }
            else if (babel_types_1.isObjectPattern(declaration.id)) {
                /**
                 * example:
                 *
                 * const {q,w,e} = {};
                 */
                const vars = [];
                for (const n of declaration.id.properties) {
                    if (babel_types_1.isObjectProperty(n)) {
                        vars.push({
                            key: n.key.name,
                            alias: n.value.name
                        });
                    }
                }
                const obj = path.evaluate(path.createChild(declaration.init));
                for (const $var of vars) {
                    if ($var.key in obj) {
                        varKeyValueMap[$var.alias] = obj[$var.key];
                    }
                }
            }
            else if (babel_types_1.isArrayPattern(declaration.id)) {
                // @es2015 destrucuring
                // @flow
                const initValue = path.evaluate(path.createChild(declaration.init));
                if (!initValue[Symbol.iterator]) {
                    throw overriteStack(error_1.ErrInvalidIterable("{(intermediate value)}"), stack, declaration.init);
                }
                declaration.id.elements.forEach((n, i) => {
                    if (babel_types_1.isIdentifier(n)) {
                        const $varName = n.typeAnnotation
                            ? n.typeAnnotation.typeAnnotation.id.name
                            : n.name;
                        const el = initValue[i];
                        varKeyValueMap[$varName] = el;
                    }
                });
            }
            else {
                throw node;
            }
            // start defned var
            for (const varName in varKeyValueMap) {
                /**
                 * If the scope is penetrating and defined as VAR, it is defined on its parent scope
                 * example:
                 *
                 * {
                 *   var a = 123
                 * }
                 */
                if (scope.invasive && kind === type_1.Kind.Var) {
                    const targetScope = (function get(s) {
                        if (s.parent) {
                            if (s.parent.invasive) {
                                return get(s.parent);
                            }
                            else {
                                return s.parent;
                            }
                        }
                        else {
                            return s;
                        }
                    })(scope);
                    targetScope.declare(kind, varName, varKeyValueMap[varName]);
                }
                else {
                    scope.declare(kind, varName, varKeyValueMap[varName]);
                }
            }
        }
    },
    VariableDeclarator: path => {
        const { node, scope } = path;
        // @es2015 destructuring
        if (babel_types_1.isObjectPattern(node.id)) {
            const newScope = scope.createChild(type_1.ScopeType.Object);
            if (babel_types_1.isObjectExpression(node.init)) {
                path.evaluate(path.createChild(node.init, newScope));
            }
            for (const n of node.id.properties) {
                if (babel_types_1.isObjectProperty(n)) {
                    const propertyName = n.id.name;
                    const $var = newScope.hasBinding(propertyName);
                    const varValue = $var ? $var.value : undefined;
                    scope.var(propertyName, varValue);
                    return varValue;
                }
            }
        }
        else if (babel_types_1.isObjectExpression(node.init)) {
            const varName = node.id.name;
            const varValue = path.evaluate(path.createChild(node.init));
            scope.var(varName, varValue);
            return varValue;
        }
        else {
            throw node;
        }
    },
    FunctionDeclaration(path) {
        const { node, scope } = path;
        const { name: functionName } = node.id;
        let func;
        if (node.async) {
            // FIXME: support async function
            func = function () {
                return runtime_1.__awaiter(this, void 0, void 0, () => {
                    // tslint:disable-next-line
                    const __this = this;
                    // tslint:disable-next-line
                    function handler(_a) {
                        const functionBody = node.body;
                        const block = functionBody.body[_a.label];
                        // the last block
                        if (!block) {
                            return [2, undefined];
                        }
                        const fieldContext = {
                            call: false,
                            value: null
                        };
                        function next(value) {
                            fieldContext.value = value;
                            fieldContext.call = true;
                            _a.sent();
                        }
                        const r = path.evaluate(path.createChild(block, path.scope, { next }));
                        if (signal_1.Signal.isReturn(r)) {
                            return [2 /* return */, r.value];
                        }
                        if (fieldContext.call) {
                            return [4 /* yield */, fieldContext.value];
                        }
                        else {
                            // next block
                            _a.label++;
                            return handler(_a);
                        }
                    }
                    return runtime_1.__generator(__this, handler);
                });
            };
        }
        else if (node.generator) {
            func = function () {
                // tslint:disable-next-line
                const __this = this;
                // tslint:disable-next-line
                function handler(_a) {
                    const functionBody = node.body;
                    const block = functionBody.body[_a.label];
                    // the last block
                    if (!block) {
                        return [2, undefined];
                    }
                    const fieldContext = {
                        call: false,
                        value: null
                    };
                    function next(value) {
                        fieldContext.value = value;
                        fieldContext.call = true;
                        _a.sent();
                    }
                    const r = path.evaluate(path.createChild(block, path.scope, { next }));
                    if (signal_1.Signal.isReturn(r)) {
                        return [2, r.value];
                    }
                    if (fieldContext.call) {
                        return [4, fieldContext.value];
                    }
                    else {
                        // next block
                        _a.label++;
                        return handler(_a);
                    }
                }
                return runtime_1.__generator(__this, handler);
            };
        }
        else {
            func = exports.es5.FunctionExpression(path.createChild(node));
        }
        utils_1.defineFunctionLength(func, node.params.length || 0);
        utils_1.defineFunctionName(func, functionName);
        // Function can repeat declaration
        scope.var(functionName, func);
    },
    ExpressionStatement(path) {
        return path.evaluate(path.createChild(path.node.expression));
    },
    ForStatement(path) {
        const { node, scope, ctx } = path;
        const labelName = ctx.labelName;
        const forScope = scope.createChild(type_1.ScopeType.For);
        forScope.invasive = true; // 有块级作用域
        // init loop
        if (node.init) {
            path.evaluate(path.createChild(node.init, forScope));
        }
        function update() {
            if (node.update) {
                path.evaluate(path.createChild(node.update, forScope));
            }
        }
        function test() {
            return node.test
                ? path.evaluate(path.createChild(node.test, forScope))
                : true;
        }
        for (;;) {
            // every loop will create it's own scope
            // it should inherit from forScope
            const loopScope = forScope.fork(type_1.ScopeType.ForChild);
            loopScope.isolated = false;
            if (!test()) {
                break;
            }
            const signal = path.evaluate(path.createChild(node.body, loopScope, { labelName: undefined }));
            if (signal_1.Signal.isBreak(signal)) {
                if (!signal.value) {
                    break;
                }
                if (signal.value === labelName) {
                    break;
                }
                return signal;
            }
            else if (signal_1.Signal.isContinue(signal)) {
                if (!signal.value) {
                    continue;
                }
                if (signal.value === labelName) {
                    update();
                    continue;
                }
                return signal;
            }
            else if (signal_1.Signal.isReturn(signal)) {
                return signal;
            }
            update();
        }
    },
    ForInStatement(path) {
        const { node, scope, ctx } = path;
        const kind = node.left.kind;
        const decl = node.left.declarations[0];
        const name = decl.id.name;
        const labelName = ctx.labelName;
        const right = path.evaluate(path.createChild(node.right));
        for (const value in right) {
            if (Object.hasOwnProperty.call(right, value)) {
                const forInScope = scope.createChild(type_1.ScopeType.ForIn);
                forInScope.invasive = true;
                forInScope.isolated = false;
                forInScope.declare(kind, name, value);
                const signal = path.evaluate(path.createChild(node.body, forInScope));
                if (signal_1.Signal.isBreak(signal)) {
                    if (!signal.value) {
                        break;
                    }
                    if (signal.value === labelName) {
                        break;
                    }
                    return signal;
                }
                else if (signal_1.Signal.isContinue(signal)) {
                    if (!signal.value) {
                        continue;
                    }
                    if (signal.value === labelName) {
                        continue;
                    }
                    return signal;
                }
                else if (signal_1.Signal.isReturn(signal)) {
                    return signal;
                }
            }
        }
    },
    DoWhileStatement(path) {
        const { node, scope, ctx } = path;
        const labelName = ctx.labelName;
        // do while don't have his own scope
        do {
            const doWhileScope = scope.createChild(type_1.ScopeType.DoWhile);
            doWhileScope.invasive = true;
            doWhileScope.isolated = false;
            const signal = path.evaluate(path.createChild(node.body, doWhileScope));
            if (signal_1.Signal.isBreak(signal)) {
                if (!signal.value) {
                    break;
                }
                if (signal.value === labelName) {
                    break;
                }
                return signal;
            }
            else if (signal_1.Signal.isContinue(signal)) {
                if (!signal.value) {
                    continue;
                }
                if (signal.value === labelName) {
                    continue;
                }
                return signal;
            }
            else if (signal_1.Signal.isReturn(signal)) {
                return signal;
            }
        } while (path.evaluate(path.createChild(node.test)));
    },
    WhileStatement(path) {
        const { node, scope, ctx } = path;
        const labelName = ctx.labelName;
        while (path.evaluate(path.createChild(node.test))) {
            const whileScope = scope.createChild(type_1.ScopeType.While);
            whileScope.invasive = true;
            whileScope.isolated = false;
            const signal = path.evaluate(path.createChild(node.body, whileScope));
            if (signal_1.Signal.isBreak(signal)) {
                if (!signal.value) {
                    break;
                }
                if (signal.value === labelName) {
                    break;
                }
                return signal;
            }
            else if (signal_1.Signal.isContinue(signal)) {
                if (!signal.value) {
                    continue;
                }
                if (signal.value === labelName) {
                    continue;
                }
                return signal;
            }
            else if (signal_1.Signal.isReturn(signal)) {
                return signal;
            }
        }
    },
    ThrowStatement(path) {
        // TODO: rewrite the stack log
        throw path.evaluate(path.createChild(path.node.argument));
    },
    CatchClause(path) {
        return path.evaluate(path.createChild(path.node.body));
    },
    TryStatement(path) {
        const { node, scope } = path;
        try {
            const tryScope = scope.createChild(type_1.ScopeType.Try);
            tryScope.invasive = true;
            tryScope.isolated = false;
            return path.evaluate(path.createChild(node.block, tryScope));
        }
        catch (err) {
            const param = node.handler.param;
            const catchScope = scope.createChild(type_1.ScopeType.Catch);
            catchScope.invasive = true;
            catchScope.isolated = false;
            catchScope.const(param.name, err);
            return path.evaluate(path.createChild(node.handler, catchScope));
        }
        finally {
            if (node.finalizer) {
                const finallyScope = scope.createChild(type_1.ScopeType.Finally);
                finallyScope.invasive = true;
                finallyScope.isolated = false;
                // tslint:disable-next-line
                return path.evaluate(path.createChild(node.finalizer, finallyScope));
            }
        }
    },
    SwitchStatement(path) {
        const { node, scope } = path;
        const discriminant = path.evaluate(path.createChild(node.discriminant)); // switch的条件
        const switchScope = scope.createChild(type_1.ScopeType.Switch);
        switchScope.invasive = true;
        switchScope.isolated = false;
        let matched = false;
        for (const $case of node.cases) {
            // 进行匹配相应的 case
            if (!matched &&
                (!$case.test ||
                    discriminant ===
                        path.evaluate(path.createChild($case.test, switchScope)))) {
                matched = true;
            }
            if (matched) {
                const result = path.evaluate(path.createChild($case, switchScope));
                if (signal_1.Signal.isBreak(result)) {
                    break;
                }
                else if (signal_1.Signal.isContinue(result)) {
                    // SwitchStatement can not use continue keyword
                    // but it can continue parent loop, like for, for-in, for-of, while
                    return result;
                }
                else if (signal_1.Signal.isReturn(result)) {
                    return result;
                }
            }
        }
    },
    SwitchCase(path) {
        const { node } = path;
        for (const stmt of node.consequent) {
            const result = path.evaluate(path.createChild(stmt));
            if (result instanceof signal_1.Signal) {
                return result;
            }
        }
    },
    UpdateExpression(path) {
        const { node, scope, stack } = path;
        const { prefix } = node;
        let $var;
        if (babel_types_1.isIdentifier(node.argument)) {
            const { name } = node.argument;
            const $$var = scope.hasBinding(name);
            if (!$$var) {
                throw overriteStack(error_1.ErrNotDefined(name), stack, node.argument);
            }
            $var = $$var;
        }
        else if (babel_types_1.isMemberExpression(node.argument)) {
            const argument = node.argument;
            const object = path.evaluate(path.createChild(argument.object));
            const property = argument.computed
                ? path.evaluate(path.createChild(argument.property))
                : argument.property.name;
            $var = {
                kind: type_1.Kind.Const,
                set(value) {
                    object[property] = value;
                },
                get value() {
                    return object[property];
                }
            };
        }
        return {
            "--": v => {
                $var.set(v - 1);
                return prefix ? --v : v--;
            },
            "++": v => {
                $var.set(v + 1);
                return prefix ? ++v : v++;
            }
        }[node.operator](path.evaluate(path.createChild(node.argument)));
    },
    ThisExpression(path) {
        const { scope } = path;
        // use this in class constructor it it never call super();
        if (scope.type === type_1.ScopeType.Constructor) {
            if (!scope.hasOwnBinding(constant_1.THIS)) {
                throw overriteStack(error_1.ErrNoSuper(), path.stack, path.node);
            }
        }
        const thisVar = scope.hasBinding(constant_1.THIS);
        return thisVar ? thisVar.value : null;
    },
    ArrayExpression(path) {
        const { node } = path;
        let newArray = [];
        for (const item of node.elements) {
            if (item === null) {
                newArray.push(undefined);
            }
            else if (babel_types_1.isSpreadElement(item)) {
                const arr = path.evaluate(path.createChild(item));
                newArray = [].concat(newArray, runtime_1._toConsumableArray(arr));
            }
            else {
                newArray.push(path.evaluate(path.createChild(item)));
            }
        }
        return newArray;
    },
    ObjectExpression(path) {
        const { node, scope } = path;
        const object = {};
        const newScope = scope.createChild(type_1.ScopeType.Object);
        const computedProperties = [];
        for (const property of node.properties) {
            const tempProperty = property;
            if (tempProperty.computed === true) {
                computedProperties.push(tempProperty);
                continue;
            }
            path.evaluate(path.createChild(property, newScope, { object }));
        }
        // eval the computed properties
        for (const property of computedProperties) {
            path.evaluate(path.createChild(property, newScope, { object }));
        }
        return object;
    },
    ObjectProperty(path) {
        const { node, scope, ctx } = path;
        const { object } = ctx;
        const val = path.evaluate(path.createChild(node.value));
        if (babel_types_1.isIdentifier(node.key)) {
            object[node.key.name] = val;
            scope.var(node.key.name, val);
        }
        else {
            object[path.evaluate(path.createChild(node.key))] = val;
        }
    },
    ObjectMethod(path) {
        const { node, scope, stack } = path;
        const methodName = !node.computed
            ? babel_types_1.isIdentifier(node.key)
                ? node.key.name
                : path.evaluate(path.createChild(node.key))
            : path.evaluate(path.createChild(node.key));
        const method = function () {
            stack.enter("Object." + methodName);
            const args = [].slice.call(arguments);
            const newScope = scope.createChild(type_1.ScopeType.Function);
            newScope.const(constant_1.THIS, this);
            // define arguments
            node.params.forEach((param, i) => {
                newScope.const(param.name, args[i]);
            });
            const result = path.evaluate(path.createChild(node.body, newScope));
            stack.leave();
            if (signal_1.Signal.isReturn(result)) {
                return result.value;
            }
        };
        utils_1.defineFunctionLength(method, node.params.length);
        utils_1.defineFunctionName(method, methodName);
        const objectKindMap = {
            get() {
                Object.defineProperty(path.ctx.object, methodName, { get: method });
                scope.const(methodName, method);
            },
            set() {
                Object.defineProperty(path.ctx.object, methodName, { set: method });
            },
            method() {
                Object.defineProperty(path.ctx.object, methodName, { value: method });
            }
        };
        const definer = objectKindMap[node.kind];
        if (definer) {
            definer();
        }
    },
    FunctionExpression(path) {
        const { node, scope, stack } = path;
        const functionName = node.id ? node.id.name : "";
        const func = function (...args) {
            stack.enter(functionName); // enter the stack
            // Is this function is a constructor?
            // if it's constructor, it should return instance
            const shouldReturnInstance = args.length &&
                args[args.length - 1] instanceof This_1.This &&
                args.pop() &&
                true;
            const funcScope = scope.createChild(type_1.ScopeType.Function);
            for (let i = 0; i < node.params.length; i++) {
                const param = node.params[i];
                if (babel_types_1.isIdentifier(param)) {
                    funcScope.let(param.name, args[i]);
                }
                else if (babel_types_1.isAssignmentPattern(param)) {
                    // @es2015 default parameters
                    path.evaluate(path.createChild(param, funcScope, { value: args[i] }));
                }
                else if (babel_types_1.isRestElement(param)) {
                    // @es2015 rest parameters
                    path.evaluate(path.createChild(param, funcScope, { value: args.slice(i) }));
                }
            }
            funcScope.const(constant_1.THIS, this);
            // support new.target
            funcScope.const(constant_1.NEW, {
                target: this && this.__proto__ && this.__proto__.constructor
                    ? this.__proto__.constructor
                    : undefined
            });
            funcScope.const(constant_1.ARGUMENTS, arguments);
            funcScope.isolated = false;
            const result = path.evaluate(path.createChild(node.body, funcScope));
            stack.leave(); // leave stack
            if (result instanceof signal_1.Signal) {
                return result.value;
            }
            else if (shouldReturnInstance) {
                return this;
            }
            else {
                return result;
            }
        };
        utils_1.defineFunctionLength(func, node.params.length);
        utils_1.defineFunctionName(func, node.id ? node.id.name : ""); // Anonymous function
        return func;
    },
    BinaryExpression(path) {
        const { node } = path;
        return exports.BinaryExpressionOperatorEvaluateMap[node.operator](path.evaluate(path.createChild(node.left)), path.evaluate(path.createChild(node.right)));
    },
    UnaryExpression(path) {
        const { node, scope } = path;
        return {
            "-": () => -path.evaluate(path.createChild(node.argument)),
            "+": () => +path.evaluate(path.createChild(node.argument)),
            "!": () => !path.evaluate(path.createChild(node.argument)),
            // tslint:disable-next-line
            "~": () => ~path.evaluate(path.createChild(node.argument)),
            void: () => void path.evaluate(path.createChild(node.argument)),
            typeof: () => {
                if (babel_types_1.isIdentifier(node.argument)) {
                    const $var = scope.hasBinding(node.argument.name);
                    return $var ? typeof $var.value : constant_1.UNDEFINED;
                }
                else {
                    return typeof path.evaluate(path.createChild(node.argument));
                }
            },
            delete: () => {
                if (babel_types_1.isMemberExpression(node.argument)) {
                    const { object, property, computed } = node.argument;
                    if (computed) {
                        return delete path.evaluate(path.createChild(object))[path.evaluate(path.createChild(property))];
                    }
                    else {
                        return delete path.evaluate(path.createChild(object))[property.name];
                    }
                }
                else if (babel_types_1.isIdentifier(node.argument)) {
                    const $this = scope.hasBinding(constant_1.THIS);
                    if ($this) {
                        return $this.value[node.argument.name];
                    }
                }
            }
        }[node.operator]();
    },
    CallExpression(path) {
        const { node, scope, stack } = path;
        const functionName = babel_types_1.isMemberExpression(node.callee)
            ? (() => {
                if (babel_types_1.isIdentifier(node.callee.property)) {
                    return (node.callee.object.name + "." + node.callee.property.name);
                }
                else if (babel_types_1.isStringLiteral(node.callee.property)) {
                    return (node.callee.object.name +
                        "." +
                        node.callee.property.value);
                }
                else {
                    return "undefined";
                }
            })()
            : node.callee.name;
        const func = path.evaluate(path.createChild(node.callee));
        const args = node.arguments.map(arg => path.evaluate(path.createChild(arg)));
        const isValidFunction = lodash_isfunction_1.default(func);
        let context = null;
        if (babel_types_1.isMemberExpression(node.callee)) {
            if (!isValidFunction) {
                throw overriteStack(error_1.ErrIsNotFunction(functionName), stack, node.callee.property);
            }
            else {
                stack.push({
                    filename: constant_1.ANONYMOUS,
                    stack: stack.currentStackName,
                    location: node.callee.property.loc
                });
            }
            context = path.evaluate(path.createChild(node.callee.object));
        }
        else {
            if (!isValidFunction) {
                throw overriteStack(error_1.ErrIsNotFunction(functionName), stack, node);
            }
            else {
                stack.push({
                    filename: constant_1.ANONYMOUS,
                    stack: stack.currentStackName,
                    location: node.loc
                });
            }
            const thisVar = scope.hasBinding(constant_1.THIS);
            context = thisVar ? thisVar.value : null;
        }
        const result = func.apply(context, args);
        if (result instanceof Error) {
            result.stack = result.toString() + "\n" + stack.raw;
        }
        return result;
    },
    MemberExpression(path) {
        const { node } = path;
        const { object, property, computed } = node;
        const propertyName = computed
            ? path.evaluate(path.createChild(property))
            : property.name;
        const obj = path.evaluate(path.createChild(object));
        if (obj === undefined) {
            throw error_1.ErrCanNotReadProperty(propertyName, "undefined");
        }
        if (obj === null) {
            throw error_1.ErrCanNotReadProperty(propertyName, "null");
        }
        const isPrototype = propertyName === "prototype" && types.isIdentifier(property);
        const target = isPrototype ? new Prototype_1.Prototype(obj) : obj[propertyName];
        return target instanceof Prototype_1.Prototype
            ? target
            : lodash_isfunction_1.default(target)
                ? target.bind(obj)
                : target;
    },
    AssignmentExpression(path) {
        const { node, scope } = path;
        let $var = {
            kind: type_1.Kind.Var,
            set(value) {
                //
            },
            get value() {
                return undefined;
            }
        };
        let rightValue;
        if (babel_types_1.isIdentifier(node.left)) {
            const { name } = node.left;
            const varOrNot = scope.hasBinding(name);
            // right first
            rightValue = path.evaluate(path.createChild(node.right));
            if (!varOrNot) {
                // here to define global var
                const globalScope = scope.global;
                globalScope.var(name, path.evaluate(path.createChild(node.right)));
                const globalVar = globalScope.hasBinding(name);
                if (globalVar) {
                    $var = globalVar;
                }
                else {
                    throw overriteStack(error_1.ErrNotDefined(name), path.stack, node.right);
                }
            }
            else {
                $var = varOrNot;
                /**
                 * const test = 123;
                 * test = 321 // it should throw an error
                 */
                if ($var.kind === type_1.Kind.Const) {
                    throw overriteStack(new TypeError("Assignment to constant variable."), path.stack, node.left);
                }
            }
        }
        else if (babel_types_1.isMemberExpression(node.left)) {
            const left = node.left;
            const object = path.evaluate(path.createChild(left.object));
            // left first
            rightValue = path.evaluate(path.createChild(node.right));
            const property = left.computed
                ? path.evaluate(path.createChild(left.property))
                : left.property.name;
            $var = {
                kind: type_1.Kind.Var,
                set(value) {
                    if (object instanceof Prototype_1.Prototype) {
                        const Constructor = object.constructor;
                        Constructor.prototype[property] = value;
                    }
                    else {
                        object[property] = value;
                    }
                },
                get value() {
                    return object[property];
                }
            };
        }
        return exports.AssignmentExpressionEvaluateMap[node.operator]($var, rightValue);
    },
    LogicalExpression(path) {
        const { node } = path;
        return {
            "||": () => path.evaluate(path.createChild(node.left)) ||
                path.evaluate(path.createChild(node.right)),
            "&&": () => path.evaluate(path.createChild(node.left)) &&
                path.evaluate(path.createChild(node.right))
        }[node.operator]();
    },
    ConditionalExpression(path) {
        return path.evaluate(path.createChild(path.node.test))
            ? path.evaluate(path.createChild(path.node.consequent))
            : path.evaluate(path.createChild(path.node.alternate));
    },
    NewExpression(path) {
        const { node, stack } = path;
        const func = path.evaluate(path.createChild(node.callee));
        const args = node.arguments.map(arg => path.evaluate(path.createChild(arg)));
        func.prototype.constructor = func;
        let entity = /native code/.test(func.toString())
            ? new func(...args)
            : new func(...args, new This_1.This(null));
        // stack track for Error constructor
        if (func === Error || entity instanceof Error) {
            entity = overriteStack(entity, stack, node);
        }
        return entity;
    },
    SequenceExpression(path) {
        let result;
        for (const expression of path.node.expressions) {
            result = path.evaluate(path.createChild(expression));
        }
        return result;
    }
};
