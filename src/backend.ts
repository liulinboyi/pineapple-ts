import { parse } from "./parser"
import { GlobalVariables } from './definition'
import { Assignment } from "./parser/Assignment"
import { Print } from "./parser/Print"
import { Comment } from "./parser/Comment"
// import Canjs from '../vm/index.js'
import vm from "../vm.js/vm";

let GlobalVariables: GlobalVariables = {
    Variables: {}
}


function NewGlobalVariables() {
    var g = GlobalVariables
    g.Variables = {}
    return g
}


export function Execute(code: string) {
    var ast: any = {}

    let g = NewGlobalVariables()

    // parse
    ast = parse(code)

    for (let i = 0; i < ast.body.length; i++) {
        if (ast.body[i].type === "COMMENT") { // 如果是注释，删除
            ast.body.splice(i, 1)
            i--;
        }
    }

    // console.log(JSON.stringify(ast, null, 4), '\r\rAST')
    // console.log("--------------------------------------------")

    // resolve
    // const vm = new Canjs(ast);
    // vm.run()

    ast.sourceType = "module"
    let outast = {
        program: ast,
        type: "File"
    }

    const sanbox = { console: console };

    const context = vm.createContext(sanbox);

    try {
        vm.runInContext(outast, "", context);
    } catch (err) {
        console.error(err);
    }

    // resolveAST(g, ast)
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
    } else if (statement instanceof Comment) {
        // 注释，什么也不做
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
    if (assignment.Literal) {
        g.Variables[varName] = assignment.Literal.value
    } else {
        throw new Error("Ivalie value.");
    }
    // if (assignment.String !== null && assignment.String !== undefined) {
    //     g.Variables[varName] = assignment.String
    // } else if (assignment.Number !== null && assignment.Number !== undefined) {
    //     g.Variables[varName] = assignment.Number
    // } else {
    //     throw new Error("Ivalie value.");
    // }

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
    ok = str !== null && str !== undefined ? true : false
    if (!ok) {
        throw new Error(`resolvePrint(): variable '$${varName}'not found.`)
    }
    return null
}
