import { Assignment, parse, Print } from "./parser"
import { GlobalVariables } from './definition'

let GlobalVariables: GlobalVariables = {
    Variables: {}
}


function NewGlobalVariables() {
    var g = GlobalVariables
    g.Variables = {}
    return g
}


function Execute(code: string) {
    var ast = {}

    let g = NewGlobalVariables()

    // parse
    ast = parse(code)

    // resolve
    resolveAST(g, ast)
}

function resolveAST(g: any, ast: any) {
    if (ast.Statements.length == 0) {
        throw new Error("resolveAST(): no code to execute, please check your input.")
    }
    for (let statement of ast.Statements) {
        resolveStatement(g, statement)
    }
    return null
}

function resolveStatement(g: any, statement: any) {
    if (statement instanceof Assignment) {
        let assignment = statement
        return resolveAssignment(g, assignment)
    } else if (statement instanceof Print) {
        let print = statement
        return resolvePrint(g, print)
    } else {
        throw new Error("resolveStatement(): undefined statement type.")
    }
}

function resolveAssignment(g: any, assignment: any) {
    let varName = ""
    varName = assignment.Variable.Name;
    if (varName == "") {
        throw new Error("resolveAssignment(): variable name can NOT be empty.")
    }
    g.Variables[varName] = assignment.String
    return null
}


function resolvePrint(g: any, print: any) {
    let varName = ""
    varName = print.Variable.Name;
    if (varName == "") {
        throw new Error("resolvePrint(): variable name can NOT be empty.")
    }
    let str = ""
    let ok = false
    str = g.Variables[varName]
    ok = str ? true : false
    if (!ok) {
        throw new Error(`resolvePrint(): variable '$${varName}'not found.`)
    }
    console.log(str)
    return null
}


// test
Execute(`$a = "你好，我是pineapple11"
print($a)
`)
