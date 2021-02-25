/**
 * @author Jrainlau
 * @desc 管理作用域
 * 
 * @class
 * 
 * 每次对节点的处理，都要考虑其作用域的问题。Scope实例会定义该作用域为函数作用域（function）或者块级作用域（block）。
 * 每次新建Scope实例，都会为当前节点创建一个全新的“作用域变量空间”（declaration），任何在此作用域内定义的变量都会存放在这个空间当中
 * 此外，新建Scope实例也会保存其父级作用域。
 */
// standardMap对象提供es5所支持的内置对象/方法 JS标准库。
/*
JS标准库就是JS这门语言本身所带有的一系列方法和属性，
如常用的setTimeout，console.log等等。
为了让解析器也能够执行这些方法，所以我们需要为其注入标准库：
*/
const standardMap = require('./standard')
const { SimpleValue } = require('./value')
// 作用域
class Scope {
  constructor (type, parentScope) {
    // 作用域类型，区分函数作用域function和块级作用域block
    this.type = type
    // 父级作用域
    this.parentScope = parentScope
    // 全局作用域
    this.globalDeclaration = standardMap
    // 当前作用域的变量空间
    this.declaration = Object.create(null) // 每次都新建一个全新的作用域
  }

  addDeclaration (name, value) {
    this.globalDeclaration[name] = new SimpleValue(value)
  }

  /*
  get/set方法用于获取/设置当前作用域中对应name的变量值
  符合JS语法规则，优先从当前作用域去找，若找不到则到父级作用域去找，然后到全局作用域找。
  如果都没有，就报错
  */
  get (name) {
    if (this.declaration[name]) {
      return this.declaration[name]
    } else if (this.parentScope) {
      return this.parentScope.get(name)
    } else if (this.globalDeclaration[name]) {
      return this.globalDeclaration[name]
    }
    throw new ReferenceError(`${name} is not defined`)
  }

  set (name, value) {
    if (this.declaration[name]) {
      this.declaration[name].set(value)
    } else if (this.parentScope) {
      this.parentScope.set(name, value)
    } else if (this.globalDeclaration[name]) {
      return this.globalDeclaration.set(name, value)
    } else {
      throw new ReferenceError(`${name} is not defined`)
    }
  }

  /**
  根据变量的kind调用不同的变量定义方法
  */
  declare (name, value, kind = 'var') {
    if (kind === 'var') {
      return this.varDeclare(name, value)
    } else if (kind === 'let') {
      return this.letDeclare(name, value)
    } else if (kind === 'const') {
      return this.constDeclare(name, value)
    } else {
      throw new Error(`canjs: Invalid Variable Declaration Kind of "${kind}"`)
    }
  }

  varDeclare (name, value) {
    let scope = this
    // example
    // ?
    // 如果遇到块级作用域且关键字为var，则需要把这个变量也定义到父级作用域当中，这也就是我们常说的“全局变量污染”。
    // 若当前作用域存在非函数类型的父级作用域时，就把变量定义到父级作用域
    while (scope.parentScope && scope.type !== 'function') {
      scope = scope.parentScope
    }
    scope.declaration[name] = new SimpleValue(value, 'var')
    return scope.declaration[name]
  }

  letDeclare (name, value) {
    // 不允许重复定义
    if (this.declaration[name]) {
      throw new SyntaxError(`Identifier ${name} has already been declared`)
    }
    this.declaration[name] = new SimpleValue(value, 'let')
    return this.declaration[name]
  }

  constDeclare (name, value) {
    // 不允许重复定义
    if (this.declaration[name]) {
      throw new SyntaxError(`Identifier ${name} has already been declared`)
    }
    this.declaration[name] = new SimpleValue(value, 'const')
    return this.declaration[name]
  }
}

module.exports = Scope
