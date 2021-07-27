"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined)
        k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
}) : (function (o, m, k, k2) {
    if (k2 === undefined)
        k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule)
        return mod;
    var result = {};
    if (mod != null)
        for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.es2015 = void 0;
const isFunction = __importStar(require("lodash.isfunction"));
const error_1 = require("../error");
const runtime_1 = require("../runtime");
const type_1 = require("../type");
const signal_1 = require("../signal");
const constant_1 = require("../constant");
const babel_types_1 = require("../packages/babel-types");
const utils_1 = require("../utils");
function overriteStack(err, stack, node) {
    stack.push({
        filename: constant_1.ANONYMOUS,
        stack: stack.currentStackName,
        location: node.loc
    });
    err.stack = err.toString() + "\n" + stack.raw;
    return err;
}
exports.es2015 = {
    ArrowFunctionExpression(path) {
        const { node, scope } = path;
        const func = (...args) => {
            const newScope = scope.createChild(type_1.ScopeType.Function);
            for (let i = 0; i < node.params.length; i++) {
                const { name } = node.params[i];
                newScope.const(name, args[i]);
            }
            const lastThis = scope.hasBinding(constant_1.THIS);
            newScope.const(constant_1.THIS, lastThis ? lastThis.value : null);
            newScope.const(constant_1.ARGUMENTS, args);
            const result = path.evaluate(path.createChild(node.body, newScope));
            if (signal_1.Signal.isReturn(result)) {
                return result.value;
            }
            else {
                return result;
            }
        };
        utils_1.defineFunctionLength(func, node.params.length);
        utils_1.defineFunctionName(func, node.id ? node.id.name : "");
        return func;
    },
    TemplateLiteral(path) {
        const { node } = path;
        return []
            .concat(node.expressions, node.quasis)
            .sort((a, b) => a.start - b.start)
            .map(element => path.evaluate(path.createChild(element)))
            .join("");
    },
    TemplateElement(path) {
        return path.node.value.raw;
    },
    ForOfStatement(path) {
        const { node, scope, ctx, stack } = path;
        const labelName = ctx.labelName;
        const entity = path.evaluate(path.createChild(node.right));
        const SymbolConst = (() => {
            const $var = scope.hasBinding("Symbol");
            return $var ? $var.value : undefined;
        })();
        // not support for of, it mean not support native for of
        if (SymbolConst) {
            if (!entity || !entity[SymbolConst.iterator]) {
                // FIXME: how to get function name
                // for (let value of get()){}
                throw overriteStack(error_1.ErrInvalidIterable(node.right.name), stack, node.right);
            }
        }
        if (babel_types_1.isVariableDeclaration(node.left)) {
            /**
             * for (let value in array){ // value should define in block scope
             *
             * }
             */
            const declarator = node.left.declarations[0];
            const varName = declarator.id.name;
            for (const value of entity) {
                const forOfScope = scope.createChild(type_1.ScopeType.ForOf);
                forOfScope.invasive = true;
                forOfScope.isolated = false;
                forOfScope.declare(node.left.kind, varName, value); // define in current scope
                const signal = path.evaluate(path.createChild(node.body, forOfScope));
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
        else if (babel_types_1.isIdentifier(node.left)) {
            /**
             * for (value in array){  // value should define in parent scope
             *
             * }
             */
            const varName = node.left.name;
            for (const value of entity) {
                const forOfScope = scope.createChild(type_1.ScopeType.ForOf);
                forOfScope.invasive = true;
                scope.var(varName, value); // define in parent scope
                const signal = path.evaluate(path.createChild(node.body, forOfScope));
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
    ClassDeclaration(path) {
        const ClassConstructor = path.evaluate(path.createChild(path.node.body, path.scope.createChild(type_1.ScopeType.Class)));
        // support class decorators
        const classDecorators = (path.node.decorators || [])
            .map(node => path.evaluate(path.createChild(node)))
            .reverse(); // revers decorators
        // TODO: support class property decorator
        // support class method decorators
        // const propertyDecorators = path.node.body.body.filter(
        //   node => node.decorators && node.decorators.length
        // );
        for (const decorator of classDecorators) {
            decorator(ClassConstructor);
        }
        path.scope.const(path.node.id.name, ClassConstructor);
    },
    ClassBody(path) {
        const { node, scope, stack } = path;
        const constructor = node.body.find(n => babel_types_1.isClassMethod(n) && n.kind === "constructor");
        const methods = node.body.filter(n => babel_types_1.isClassMethod(n) && n.kind !== "constructor");
        const properties = node.body.filter(n => babel_types_1.isClassProperty(n));
        const parentNode = path.parent.node;
        const Class = (SuperClass => {
            if (SuperClass) {
                runtime_1._inherits(ClassConstructor, SuperClass);
            }
            function ClassConstructor(...args) {
                stack.enter(parentNode.id.name + ".constructor");
                runtime_1._classCallCheck(this, ClassConstructor);
                const classScope = scope.createChild(type_1.ScopeType.Constructor);
                // define class property
                properties.forEach(p => {
                    this[p.key.name] = path.evaluate(path.createChild(p.value, classScope));
                });
                if (constructor) {
                    // defined the params
                    constructor.params.forEach((param, i) => {
                        classScope.const(param.name, args[i]);
                    });
                    if (!SuperClass) {
                        classScope.const(constant_1.THIS, this);
                    }
                    classScope.const(constant_1.NEW, {
                        target: ClassConstructor
                    });
                    for (const n of constructor.body.body) {
                        path.evaluate(path.createChild(n, classScope, {
                            SuperClass,
                            ClassConstructor,
                            ClassConstructorArguments: args,
                            ClassEntity: this,
                            classScope
                        }));
                    }
                }
                else {
                    classScope.const(constant_1.THIS, this);
                    // apply super if constructor not exist
                    runtime_1._possibleConstructorReturn(this, (ClassConstructor.__proto__ ||
                        Object.getPrototypeOf(ClassConstructor)).apply(this, args));
                }
                if (!classScope.hasOwnBinding(constant_1.THIS)) {
                    throw overriteStack(error_1.ErrNoSuper(), path.stack, node);
                }
                stack.leave();
                return this;
            }
            // define class name and length
            utils_1.defineFunctionLength(ClassConstructor, constructor ? constructor.params.length : 0);
            utils_1.defineFunctionName(ClassConstructor, parentNode.id.name);
            const classMethods = methods
                .map((method) => {
                const methodName = method.id
                    ? method.id.name
                    : method.computed
                        ? path.evaluate(path.createChild(method.key))
                        : method.key.name;
                const methodScope = scope.createChild(type_1.ScopeType.Function);
                const func = function (...args) {
                    stack.enter(parentNode.id.name + "." + methodName);
                    methodScope.const(constant_1.THIS, this);
                    methodScope.const(constant_1.NEW, { target: undefined });
                    // defined the params
                    method.params.forEach((p, i) => {
                        if (babel_types_1.isIdentifier(p)) {
                            methodScope.const(p.name, args[i]);
                        }
                    });
                    const result = path.evaluate(path.createChild(method.body, methodScope, {
                        SuperClass,
                        ClassConstructor,
                        ClassMethodArguments: args,
                        ClassEntity: this
                    }));
                    stack.leave();
                    if (signal_1.Signal.isReturn(result)) {
                        return result.value;
                    }
                };
                utils_1.defineFunctionLength(func, method.params.length);
                utils_1.defineFunctionName(func, methodName);
                return {
                    key: method.key.name,
                    [method.kind === "method" ? "value" : method.kind]: func
                };
            })
                .concat([{ key: "constructor", value: ClassConstructor }]);
            // define class methods
            runtime_1._createClass(ClassConstructor, classMethods);
            return ClassConstructor;
        })(parentNode.superClass
            ? (() => {
                const $var = scope.hasBinding(parentNode.superClass.name);
                return $var ? $var.value : null;
            })()
            : null);
        return Class;
    },
    ClassMethod(path) {
        return path.evaluate(path.createChild(path.node.body));
    },
    // refactor class
    ClassExpression(path) {
        //
    },
    Super(path) {
        const { ctx } = path;
        const { SuperClass, ClassConstructor, ClassEntity } = ctx;
        const classScope = ctx.classScope;
        const ClassBodyPath = path.findParent("ClassBody");
        // make sure it include in ClassDeclaration
        if (!ClassBodyPath) {
            throw new Error("super() only can use in ClassDeclaration");
        }
        const parentPath = path.parent;
        if (parentPath) {
            // super()
            if (babel_types_1.isCallExpression(parentPath.node)) {
                if (classScope && !classScope.hasOwnBinding(constant_1.THIS)) {
                    classScope.const(constant_1.THIS, ClassEntity);
                }
                return function inherits(...args) {
                    runtime_1._possibleConstructorReturn(ClassEntity, (ClassConstructor.__proto__ ||
                        Object.getPrototypeOf(ClassConstructor)).apply(ClassEntity, args));
                }.bind(ClassEntity);
            }
            else if (babel_types_1.isMemberExpression(parentPath.node)) {
                // super.eat()
                // then return the superclass prototype
                return SuperClass.prototype;
            }
        }
    },
    SpreadElement(path) {
        return path.evaluate(path.createChild(path.node.argument));
    },
    ImportDeclaration(path) {
        const { node, scope, stack } = path;
        let defaultImport = ""; // default import object
        const otherImport = []; // import property
        const moduleName = path.evaluate(path.createChild(node.source));
        node.specifiers.forEach(n => {
            if (babel_types_1.isImportDefaultSpecifier(n)) {
                // defaultImport = visitors.ImportDefaultSpecifier(path.createChild(n));
                defaultImport = path.evaluate(path.createChild(n));
            }
            else if (babel_types_1.isImportSpecifier(n)) {
                otherImport.push(path.evaluate(path.createChild(n)));
                // otherImport.push(visitors.ImportSpecifier(path.createChild(n)));
            }
            else {
                throw n;
            }
        });
        const requireVar = scope.hasBinding(constant_1.REQUIRE);
        if (requireVar === undefined) {
            throw overriteStack(error_1.ErrNotDefined(constant_1.REQUIRE), stack, node);
        }
        const requireFunc = requireVar.value;
        if (!isFunction(requireFunc)) {
            throw overriteStack(error_1.ErrIsNotFunction(constant_1.REQUIRE), stack, node);
        }
        const targetModule = requireFunc(moduleName) || {};
        if (defaultImport) {
            scope.const(defaultImport, targetModule.default ? targetModule.default : targetModule);
        }
        for (const varName of otherImport) {
            scope.const(varName, targetModule[varName]);
        }
    },
    ExportDefaultDeclaration(path) {
        const { node, scope } = path;
        const moduleVar = scope.hasBinding(constant_1.MODULE);
        if (moduleVar) {
            const moduleObject = moduleVar.value;
            moduleObject.exports = {
                ...moduleObject.exports,
                ...path.evaluate(path.createChild(node.declaration))
            };
        }
    },
    ExportNamedDeclaration(path) {
        const { node } = path;
        node.specifiers.forEach(n => path.evaluate(path.createChild(n)));
    },
    AssignmentPattern(path) {
        const { node, scope, ctx } = path;
        const { value } = ctx;
        scope.const(node.left.name, value === undefined ? path.evaluate(path.createChild(node.right)) : value);
    },
    RestElement(path) {
        const { node, scope, ctx } = path;
        const { value } = ctx;
        scope.const(node.argument.name, value);
    },
    YieldExpression(path) {
        const { next } = path.ctx;
        next(path.evaluate(path.createChild(path.node.argument))); // call next
    },
    TaggedTemplateExpression(path) {
        const str = path.node.quasi.quasis.map(v => v.value.cooked);
        const raw = path.node.quasi.quasis.map(v => v.value.raw);
        const templateObject = runtime_1._taggedTemplateLiteral(str, raw);
        const func = path.evaluate(path.createChild(path.node.tag));
        const expressionResultList = path.node.quasi.expressions.map(n => path.evaluate(path.createChild(n))) || [];
        return func(templateObject, ...expressionResultList);
    },
    MetaProperty(path) {
        const obj = path.evaluate(path.createChild(path.node.meta));
        return obj[path.node.property.name];
    }
};
