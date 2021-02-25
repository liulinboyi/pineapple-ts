/**
 * @author Jrainlau
 * @desc 节点处理器，处理AST当中的节点
 */

// 关键字判断工具
// 判断JS语句当中的return，break，continue关键字。
const Signal = require('../signal')
const { MemberValue } = require('../value')
// 节点处理器
const NodeHandler = {
  Program (nodeIterator) {
    for (const node of nodeIterator.node.body) {
      nodeIterator.traverse(node)
    }
  },
  // 这里做作用域处理
  // 变量定义节点处理器
  VariableDeclaration (nodeIterator) {
    const kind = nodeIterator.node.kind
    // nodeIterator.node.declarations 是一个数组，里面存放着VariableDeclarator
    for (const declaration of nodeIterator.node.declarations) {
      const { name/* Identifier name */ } = declaration.id // 标识符Identifier
      // declaration.init 可能是Literal或者CallExpression等类型，需要再次进行处理
      const value = declaration.init ? nodeIterator.traverse(declaration.init) : undefined
      // 问题来了，拿到了变量的名称和值，然后把它保存到哪里去呢？
      /*
      处理完变量声明节点以后，理应把这个变量保存起来。
      按照JS语言特性，这个变量应该存放在一个作用域当中。
      在JS解析器的实现过程中，这个作用域可以被定义为一个scope对象。
      */
      // 在作用域当中定义变量
      // 若为块级作用域且关键字为var，则需要做全局污染
      if (nodeIterator.scope.type === 'block' && kind === 'var') {
        nodeIterator.scope.parentScope.declare(name, value, kind)
      } else {
        nodeIterator.scope.declare(name, value, kind)
      }
    }
  },
  // 标识符节点处理器
  Identifier (nodeIterator) {
    if (nodeIterator.node.name === 'undefined') {
      return undefined
    }
    return nodeIterator.scope.get(nodeIterator.node.name).value
  },
  // 字符节点处理器
  Literal (nodeIterator) {
    return nodeIterator.node.value
  },

  ExpressionStatement (nodeIterator) {
    return nodeIterator.traverse(nodeIterator.node.expression)
  },
  // 表达式调用节点处理器
  // 用于处理表达式调用节点的处理器，如处理func()，console.log()等。
  CallExpression (nodeIterator) {
    // 遍历callee获取函数体
    const func = nodeIterator.traverse(nodeIterator.node.callee)
    // 获取参数
    const args = nodeIterator.node.arguments.map(arg => nodeIterator.traverse(arg))

    let value
    if (nodeIterator.node.callee.type === 'MemberExpression') {
      value = nodeIterator.traverse(nodeIterator.node.callee.object)
    }
    // 返回函数运行结果
    return func.apply(value, args)
  },
  // 表达式节点处理器
  // 表达式节点指的是person.say，console.log这种函数表达式。
  MemberExpression (nodeIterator) {
    // 获取对象，如console
    const obj = nodeIterator.traverse(nodeIterator.node.object)
    // 获取对象的方法，如log
    const name = nodeIterator.node.property.name
    // 返回表达式，如console.log
    return obj[name]
  },
  ObjectExpression (nodeIterator) {
    const obj = {}
    for (const prop of nodeIterator.node.properties) {
      let key
      if (prop.key.type === 'Literal') {
        key = `${prop.key.value}`
      } else if (prop.key.type === 'Identifier') {
        key = prop.key.name
      } else {
        throw new Error(`canjs: [ObjectExpression] Unsupported property key type "${prop.key.type}"`)
      }
      obj[key] = nodeIterator.traverse(prop.value)
    }
    return obj
  },
  ArrayExpression (nodeIterator) {
    return nodeIterator.node.elements.map(ele => nodeIterator.traverse(ele))
  },
  // 块级声明节点处理器
  // 非常常用的处理器，专门用于处理块级声明节点，如函数、循环、try...catch...当中的情景。
  BlockStatement (nodeIterator) {
    // 先定义一个块级作用域
    let scope = nodeIterator.createScope('block')

    // 处理块级节点内的每一个节点
    for (const node of nodeIterator.node.body) {
      if (node.type === 'FunctionDeclaration') {
        nodeIterator.traverse(node, { scope })
      } else if (node.type === 'VariableDeclaration' && node.kind === 'var') {
        /*
        var a = 1,d = 3; 这种定义变量，declarations数组会有两个元素
         */
        for (const declaration of node.declarations) {
          /*
          var a = 1,d = 3,e; e的变量声明，没有赋值，那么AST中init就是null
          */
          if (declaration.init) {
            scope.declare(declaration.id.name, nodeIterator.traverse(declaration.init, { scope }), node.kind)
          } else {
            scope.declare(declaration.id.name, undefined, node.kind)
          }
        }
      }
    }

    // 提取关键字（return, break, continue）
    for (const node of nodeIterator.node.body) {
      if (node.type === 'FunctionDeclaration') {
        continue
      }
      const signal = nodeIterator.traverse(node, { scope })
      if (Signal.isSignal(signal)) {
        return signal
      }
    }
    /*
    两个for...of循环。
    第一个用于处理块级内语句，
    第二个专门用于识别关键字，
    如循环体内部的break，continue或者函数体内部的return。
    */
  },
  // 函数定义节点处理器
  // 向作用域当中声明一个和函数名相同的变量，值为所定义的函数
  FunctionDeclaration (nodeIterator) {
    const fn = NodeHandler.FunctionExpression(nodeIterator)
    nodeIterator.scope.varDeclare(nodeIterator.node.id.name, fn)
    return fn
  },
  // 函数表达式节点处理器
  FunctionExpression (nodeIterator) {
    const node = nodeIterator.node
    /**
     * 1、定义函数需要先为其定义一个函数作用域，且允许继承父级作用域
     * 2、注册`this`, `arguments`和形参到作用域的变量空间
     * 3、检查return关键字
     * 4、定义函数名和长度
     */
    const fn = function () {
      // 创建函数作用域
      const scope = nodeIterator.createScope('function')
      scope.constDeclare('this', this)
      scope.constDeclare('arguments', arguments)

      node.params.forEach((param, index) => {
        const name = param.name
        scope.varDeclare(name, arguments[index])
      })

      const signal = nodeIterator.traverse(node.body, { scope })
      if (Signal.isReturn(signal)) {
        return signal.value
      }
    }

    Object.defineProperties(fn, {
      name: { value: node.id ? node.id.name : '' },
      length: { value: node.params.length }
    })

    return fn
  },
  // this表达式处理器
  // 直接使用JS语言自身的特性，把this关键字从作用域中取出即可。
  ThisExpression (nodeIterator) {
    const value = nodeIterator.scope.get('this')
    return value ? value.value : null
  },
  // 沿用JS的语言特性，获取函数和参数之后，通过bind关键字生成一个构造函数，并返回。
  NewExpression (nodeIterator) {
    const func = nodeIterator.traverse(nodeIterator.node.callee)
    const args = nodeIterator.node.arguments.map(arg => nodeIterator.traverse(arg))
    return new (func.bind(null, ...args))
  },

  UpdateExpression (nodeIterator) {
    const { operator, prefix } = nodeIterator.node
    const { name } = nodeIterator.node.argument
    let val = nodeIterator.scope.get(name).value

    operator === "++" ? nodeIterator.scope.set(name, val + 1) : nodeIterator.scope.set(name, val - 1)

    if (operator === "++" && prefix) {
      return ++val
    } else if (operator === "++" && !prefix) {
      return val++
    } else if (operator === "--" && prefix) {
      return --val
    } else {
      return val--
    }
  },
  AssignmentExpressionOperatortraverseMap: {
    '=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] = v : value.value = v,
    '+=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] += v : value.value += v,
    '-=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] -= v : value.value -= v,
    '*=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] *= v : value.value *= v,
    '/=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] /= v : value.value /= v,
    '%=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] %= v : value.value %= v,
    '**=': () => { throw new Error('canjs: es5 doen\'t supports operator "**=') },
    '<<=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] <<= v : value.value <<= v,
    '>>=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] >>= v : value.value >>= v,
    '>>>=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] >>>= v : value.value >>>= v,
    '|=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] |= v : value.value |= v,
    '^=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] ^= v : value.value ^= v,
    '&=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] &= v : value.value &= v
  },
  AssignmentExpression (nodeIterator) {
    const node = nodeIterator.node
    const value = getIdentifierOrMemberExpressionValue(node.left, nodeIterator)
    return NodeHandler.AssignmentExpressionOperatortraverseMap[node.operator](value, nodeIterator.traverse(node.right))
  },
  UnaryExpressionOperatortraverseMap: {
    '-': (nodeIterator) => -nodeIterator.traverse(nodeIterator.node.argument),
    '+': (nodeIterator) => +nodeIterator.traverse(nodeIterator.node.argument),
    '!': (nodeIterator) => !nodeIterator.traverse(nodeIterator.node.argument),
    '~': (nodeIterator) => ~nodeIterator.traverse(nodeIterator.node.argument),
    'typeof': (nodeIterator) => {
      if (nodeIterator.node.argument.type === 'Identifier') {
        try {
          const value = nodeIterator.scope.get(nodeIterator.node.argument.name)
          return value ? typeof value.value : 'undefined'
        } catch (err) {
          if (err.message === `${nodeIterator.node.argument.name} is not defined`) {
            return 'undefined'
          } else {
            throw err
          }
        }
      } else {
        return typeof nodeIterator.traverse(nodeIterator.node.argument)
      }
    },
    'void': (nodeIterator) => void nodeIterator.traverse(nodeIterator.node.argument),
    'delete': (nodeIterator) => {
      const argument = nodeIterator.node.argument
      if (argument.type === 'MemberExpression') {
        const obj = nodeIterator.traverse(argument.object)
        const name = getPropertyName(argument, nodeIterator)
        return delete obj[name]
      } else if (argument.type === 'Identifier') {
        return false
      } else if (argument.type === 'Literal') {
        return true
      }
    }
  },
  UnaryExpression (nodeIterator) {
    return NodeHandler.UnaryExpressionOperatortraverseMap[nodeIterator.node.operator](nodeIterator)
  },
  BinaryExpressionOperatortraverseMap: {
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
    '===': (a, b) => a === b,
    '!==': (a, b) => a !== b,
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '<<': (a, b) => a << b,
    '>>': (a, b) => a >> b,
    '>>>': (a, b) => a >>> b,
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '%': (a, b) => a % b,
    '**': (a, b) => { throw new Error('canjs: es5 doesn\'t supports operator "**"') },
    '|': (a, b) => a | b,
    '^': (a, b) => a ^ b,
    '&': (a, b) => a & b,
    'in': (a, b) => a in b,
    'instanceof': (a, b) => a instanceof b
  },
  BinaryExpression (nodeIterator) {
    const a = nodeIterator.traverse(nodeIterator.node.left)
    const b = nodeIterator.traverse(nodeIterator.node.right)
    return NodeHandler.BinaryExpressionOperatortraverseMap[nodeIterator.node.operator](a, b)
  },
  LogicalExpressionOperatortraverseMap: {
    '||': (a, b) => a || b,
    '&&': (a, b) => a && b
  },
  LogicalExpression (nodeIterator) {
    const a = nodeIterator.traverse(nodeIterator.node.left)
    if (a) {
      if (nodeIterator.node.operator == '||') {
        return true;
      }
    }
    else if (nodeIterator.node.operator == '&&') {
      return false;
    }
    
    const b = nodeIterator.traverse(nodeIterator.node.right)
    return NodeHandler.LogicalExpressionOperatortraverseMap[nodeIterator.node.operator](a, b)
  },

  // For循环节点处理器
  /*
  For循环的三个参数对应着节点的init，test，update属性，
  对着三个属性分别调用节点处理器处理，
  并放回JS原生的for循环当中即可。
  */
  ForStatement (nodeIterator) {
    const node = nodeIterator.node
    let scope = nodeIterator.scope
    if (node.init && node.init.type === 'VariableDeclaration' && node.init.kind !== 'var') {
      scope = nodeIterator.createScope('block')
    }

    for (
      node.init && nodeIterator.traverse(node.init, { scope });
      node.test ? nodeIterator.traverse(node.test, { scope }) : true;
      node.update && nodeIterator.traverse(node.update, { scope })
    ) {
      const signal = nodeIterator.traverse(node.body, { scope })
      
      if (Signal.isBreak(signal)) {
        break
      } else if (Signal.isContinue(signal)) {
        continue
      } else if (Signal.isReturn(signal)) {
        return signal
      }
    }
  },
  ForInStatement (nodeIterator) {
    const { left, right, body } = nodeIterator.node
    let scope = nodeIterator.scope

    let value
    if (left.type === 'VariableDeclaration') {
      const id = left.declarations[0].id
      value = scope.declare(id.name, undefined, left.kind)
    } else if (left.type === 'Identifier') {
      value = scope.get(left.name, true)
    } else {
      throw new Error(`canjs: [ForInStatement] Unsupported left type "${left.type}"`)
    }

    for (const key in nodeIterator.traverse(right)) {
      value.value = key
      const signal = nodeIterator.traverse(body, { scope })

      if (Signal.isBreak(signal)) {
        break
      } else if (Signal.isContinue(signal)) {
        continue
      } else if (Signal.isReturn(signal)) {
        return signal
      }
    }
  },
  WhileStatement (nodeIterator) {
    while (nodeIterator.traverse(nodeIterator.node.test)) {
      const signal = nodeIterator.traverse(nodeIterator.node.body)
      
      if (Signal.isBreak(signal)) {
        break
      } else if (Signal.isContinue(signal)) {
        continue
      } else if (Signal.isReturn(signal)) {
        return signal
      }
    }
  },
  DoWhileStatement (nodeIterator) {
    do {
      const signal = nodeIterator.traverse(nodeIterator.node.body)
      
      if (Signal.isBreak(signal)) {
        break
      } else if (Signal.isContinue(signal)) {
        continue
      } else if (Signal.isReturn(signal)) {
        return signal
      }
    } while (nodeIterator.traverse(nodeIterator.node.test))
  },

  ReturnStatement (nodeIterator) {
    let value
    if (nodeIterator.node.argument) {
      value = nodeIterator.traverse(nodeIterator.node.argument)
    }
    return Signal.Return(value)
  },
  BreakStatement (nodeIterator) {
    let label
    if (nodeIterator.node.label) {
      label = nodeIterator.node.label.name
    }
    return Signal.Break(label)
  },
  ContinueStatement (nodeIterator) {
    let label
    if (nodeIterator.node.label) {
      label = nodeIterator.node.label.name
    }
    return Signal.Continue(label)
  },

  // If声明节点处理器
  IfStatement (nodeIterator) {
    if (nodeIterator.traverse(nodeIterator.node.test)) {
      return nodeIterator.traverse(nodeIterator.node.consequent)
    } else if (nodeIterator.node.alternate) {
      return nodeIterator.traverse(nodeIterator.node.alternate)
    }
  },
  SwitchStatement (nodeIterator) {
    const discriminant = nodeIterator.traverse(nodeIterator.node.discriminant)
    
    for (const theCase of nodeIterator.node.cases) {
      if (!theCase.test || discriminant === nodeIterator.traverse(theCase.test)) {
        const signal = nodeIterator.traverse(theCase)

        if (Signal.isBreak(signal)) {
          break
        } else if (Signal.isContinue(signal)) {
          continue
        } else if (Signal.isReturn(signal)) {
          return signal
        }
      }
    }
  },
  SwitchCase (nodeIterator) {
    for (const node of nodeIterator.node.consequent) {
      const signal = nodeIterator.traverse(node)
      if (Signal.isSignal(signal)) {
        return signal
      }
    }
  },
  ConditionalExpression (nodeIterator) {
    return nodeIterator.traverse(nodeIterator.node.test)
      ? nodeIterator.traverse(nodeIterator.node.consequent)
      : nodeIterator.traverse(nodeIterator.node.alternate)
  },

  ThrowStatement(nodeIterator) {
    throw nodeIterator.traverse(nodeIterator.node.argument)
  },
  TryStatement(nodeIterator) {
    const { block, handler, finalizer } = nodeIterator.node
    try {
      return nodeIterator.traverse(block)
    } catch (err) {
      if (handler) {
        const param = handler.param
        const scope = nodeIterator.createScope('block')
        scope.letDeclare(param.name, err)
        return nodeIterator.traverse(handler, { scope })
      }
      throw err
    } finally {
      if (finalizer) {
        return nodeIterator.traverse(finalizer)
      }
    }
  },
  CatchClause(nodeIterator) {
    return nodeIterator.traverse(nodeIterator.node.body);
  }
}

function getPropertyName (node, nodeIterator) {
  if (node.computed) {
    return nodeIterator.traverse(node.property)
  } else {
    return node.property.name
  }
}

function getIdentifierOrMemberExpressionValue(node, nodeIterator) {
  if (node.type === 'Identifier') {
    return nodeIterator.scope.get(node.name)
  } else if (node.type === 'MemberExpression') {
    const obj = nodeIterator.traverse(node.object)
    const name = getPropertyName(node, nodeIterator)
    return new MemberValue(obj, name)
  } else {
    throw new Error(`canjs: Not support to get value of node type "${node.type}"`)
  }
}

module.exports = NodeHandler
