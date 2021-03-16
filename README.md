# pineapple-ts

## 敏捷开发，主要是思路，细节不是很完美

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
Assignment      ::= Variable Ignored '=' Ignored ( String | Number |  Variable | Expressions) Ignored
Print           ::= "print" "(" Ignored Variable Ignored ")" Ignored
Statement       ::= Print | Assignment
SourceCode      ::= Statement+ 
Comment         ::= Ignored "#" SourceCharacter // 注释 
// BinaryExpression::= (Variable | Number) Ignored Operator1 Ignored (Variable | Number)
Compare        ::= ">" | "<" | "==" | ">=" | "<="
Operator1        ::= "+" | "-"
Operator2        ::= "*" | "/"
Expressions ::= Term Expressions_tail
Expressions_tail ::= (Operator1 Term)? // 0个或一个
Term            ::= Factor Term_tail
Term_tail       ::= (Operator2 Factor)? // 0个或一个
Factor          ::= Number | "(" Expressions ")"
FunctionDeclaration ::= "func" Ignored Name Ignored "(" Variable ("," Variable)* ")" BlockStatement // eg: 1: func foo ($a) {}  2: func foo ($a[,$b][,$c]) {}   ("," Variable)*这部分是一个或多个
BlockStatement  ::= "{" Ignored (IfStatement | CallFunction | Print | Assignment | ReturnStatement ) Ignored "}"
ReturnStatement ::= "return" (Expressions | Variable)
CallFunction    ::= Name "(" (Variable | Number) ("," (Variable | Number))* ")" Ignored
IfStatement     ::= "if" Ignored "(" Variable Ignored Operator Ignored Variable ")" Ignored BlockStatement Ignored "else" Ignored BlockStatement Ignored

```
pineapple-ts移植于[pineapple language Go语言版本](https://github.com/karminski/pineapple)，后以移植初版(pineapple-ts)为蓝本，实现后续功能。

Pineapple-ts is transplanted to the pineapple language Go language version, and then the original version of pineapple-ts is transplanted as the model to achieve the follow-up functions.

## pineapple(Go 语言版本)
TypeScript implementation of pineapple language (https://github.com/karminski/pineapple) as a personal exercise.

[karminski/pineapple](https://github.com/karminski/pineapple)

## 说明
pineapple lang 是一个简单的编程语言 demo. 它包含了个手写的递归下降解析器. 

该语言现在应该是图灵完备的. 

pineapple 的主要目的是让编译原理初学者有一个预热, 简单了解一个编程语言是怎么构建的.


Pineapple lang is a simple programming language demo. It contains a handwritten recursive descending parser.

The language should now be Turing complete.

The main purpose of pineapple is to give beginners of compilation principles a warm-up and a simple understanding of how a programming language is built.

## 运行
```
npm install
npm run test
```

## Contributors
- [karminski](https://github.com/karminski)
- [liulinboyi](https://github.com/liulinboyi)


# 最后把代码转成[JavaScript的AST](https://astexplorer.net/)，然后使用[javascript的解释器canjs](https://github.com/jrainlau/canjs)执行代码.

# 最后算是完成大部分了，实现了递归调用，解决了求斐波那契数问题。

```
# 求斐波那契数
# 求斐波那契数
func Fibonacci($a) {

	if($a == 0) {
		return 0
	}
	
	if ($a == 1) {
		return 1
	}

	if($a == 2) {
		return 1
	}

	$_a = $a - 1

	$_b = $a - 2

	$aa = Fibonacci($_a)

	$bb = Fibonacci($_b)

	return $aa + $bb
}

$res = Fibonacci(7)

print($res)
```
# 对应JavaScript中的代码如下
```javascript
// 求斐波那契数
function Fibonacci($a) {

	if($a == 0) {
		return 0
	}

	if($a == 1) {
		return 1
	}
	
	if ($a == 2) {
		return 1
	}

	let $_a = $a - 1

	let $_b = $a - 2

	let $aa = Fibonacci($_a)

	let $bb = Fibonacci($_b)

	return $aa + $bb
}

let $res = Fibonacci(7)

console.log($res)
```