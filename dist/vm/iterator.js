"use strict";
/**
 * @author Jrainlau
 * @desc 节点遍历器，递归遍历AST内的每一个节点并调用对应的方法进行解析
 *
 * @class
 *
 * 针对AST节点进行解析，根据节点类型调用“节点处理器”（nodeHandler）对应的方法。
 * 在进行解析的时候，会传入节点和节点对应的作用域。
 *
 * 另外也提供了创建作用域的方法（createScope），可用于创建函数作用域或者块级作用域。
 */
// 节点处理器
const nodeHandler = require('./es_versions');
const Scope = require('./scope');
// 节点遍历器
class NodeIterator {
    constructor(node, scope) {
        this.node = node;
        this.scope = scope;
        this.nodeHandler = nodeHandler;
    }
    traverse(node, options = {}) {
        // 作用域
        // 作用域的处理，可以说是整个JS解释器最难的部分
        /*
        // eg:
        const a = 1
        {
          const b = 2
          console.log(a)
        }
        console.log(b)
        */
        /*
        运行结果必然是能够打印出a的值，
        然后报错：Uncaught ReferenceError: b is not defined
        */
        /*
        块级作用域或者函数作用域可以读取其父级作用域当中的变量，
        反之则不行，所以对于作用域我们不能简单地定义一个空对象，
        而是要专门进行处理。
         */
        const scope = options.scope || this.scope;
        const nodeIterator = new NodeIterator(node, scope);
        // 根据节点类型找到节点处理器当中对应的函数
        const _eval = this.nodeHandler[node.type];
        // 若找不到则报错
        if (!_eval) {
            throw new Error(`canjs: Unknown node type "${node.type}".`);
        }
        // 运行处理函数
        return _eval(nodeIterator);
    }
    createScope(blockType = 'block') {
        return new Scope(blockType, this.scope);
    }
}
module.exports = NodeIterator;
//# sourceMappingURL=iterator.js.map