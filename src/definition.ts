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

export interface Variable {
    LineNum?: number,
    Name?: string,
}
