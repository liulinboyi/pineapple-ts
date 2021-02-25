# pineapple-ts

## 可以用[在线解析EBNF](https://bottlecaps.de/rr/ui)
## EBNF：
```
SourceCharacter ::=  #x0009 | #x000A | #x000D | [#x0020-#xFFFF] // 大部分的 Unicode 
Name            ::= [_A-Za-z][_0-9A-Za-z]* // 标识符名称第一部分只能出现一次，后面部分零次或多次 
StringCharacter ::= SourceCharacter - '"' // - '"' 代表不包含双引号 ", 即 StringCharacter 是 SourceCharacter 但不包含双引号. (String 要用双引号作为结束/闭合的标记) 
Integer         ::= [0-9]+
Number          ::= Integer Ignored
String          ::= '"' '"' Ignored | '"' StringCharacter '"' Ignored
Variable        ::= "$" Name Ignored // 变量 
Assignment      ::= Variable Ignored '=' Ignored ( String | Number |  Variable) Ignored
Print           ::= "print" "(" Ignored Variable Ignored ")" Ignored
Statement       ::= Print | Assignment
SourceCode      ::= Statement+ 
Comment         ::= Ignored "#" SourceCharacter // 注释 
Expression      ::= Variable Ignored Operator Ignored Variable
Operator        ::= "+" | "-" | "*" | "/"

```

TypeScript implementation of pineapple language (https://github.com/karminski/pineapple) as a personal exercise.

[karminski/pineapple](https://github.com/karminski/pineapple)

## 说明
pineapple lang 是一个简单的编程语言 demo. 它包含了个手写的递归下降解析器和一个简单的解释器. 虽然该语言甚至不是图灵完备的. 但 pineapple 的主要目的是让编译原理初学者有一个预热, 简单了解一个编程语言是怎么构建的.

## 运行
```
npm install
npm run test
```

## Contributors
- [karminski](https://github.com/karminski)
- [liulinboyi](https://github.com/liulinboyi)


# 最后把代码转成JavaScript的AST然后使用[javascript的解释器canjs](https://github.com/jrainlau/canjs)执行代码.
