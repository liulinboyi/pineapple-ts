import { Assignment } from "./parser/Assignment";
import { Print } from "./parser/Print";

export interface GlobalVariables {
    Variables: {
        [index: string]: string
    }
}


export interface Keywords {
    print: number,
    [index: string]: any
}

export interface TokenNameMap {
    [index: number]: any
}

export type Variable = Print | Assignment | Comment | undefined

// export interface Variable {
//     LineNum?: number,
//     Name?: string,
//     [x: string]: any
// }
