/**
 * @author Jrainlau
 * @desc Canjs类
 * 
 * @class
 * 
 * 传入字符串形式的es5代码，可选的新增全局变量
 * 运行`.run()`方法即可输出运行结果
 * 
 * eg: new Canjs('console.log("Hello World!")').run()
 */

// const {Parser} = require('acorn')
const NodeIterator = require('./iterator')
const Scope = require('./scope')

class Canjs {
    constructor(ast, code = '', extraDeclaration = {}) {
        this.code = code
        this.extraDeclaration = extraDeclaration
        // this.ast = Parser.parse(code)
        this.ast = ast
        this.nodeIterator = null
        this.init()
    }

    init() { // 定义全局作用域，该作用域类型为函数作用域
        const globalScope = new Scope('function')
        // 根据入参定义标准库之外的全局变量
        Object.keys(this.extraDeclaration).forEach((key) => {
            globalScope.addDeclaration(key, this.extraDeclaration[key])
        })
        this.nodeIterator = new NodeIterator(null, globalScope)
    }

    run() {
        return this.nodeIterator.traverse(this.ast)
    }
}

module.exports = Canjs
