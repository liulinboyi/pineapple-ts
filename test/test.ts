const fs = require('fs')
const path = require('path')
import { Execute } from '../src/backend'

let code = fs.readFileSync(path.resolve(__dirname, '../demo/hello-world-15.pineapple'), { encoding: 'utf-8' })
console.log(code, 'code')
if (code.length > 0) {
    Execute(code)
}
