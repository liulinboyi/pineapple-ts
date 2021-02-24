"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const backend_1 = require("../../src/backend");
const fs_1 = __importDefault(require("fs"));
// const args = process.argv.slice(2)
// if (args[0]) {
//     let code = ''
//     try {
//         code = fs.readFileSync(args[0], { encoding: 'utf-8' })
//     } catch (error) {
//         console.log(`Error reading file: ${args[0]}`)
//     }
//     if (code.length > 0) {
//         Execute(code)
//     }
// }
const path_1 = __importDefault(require("path"));
let code = '';
try {
    code = fs_1.default.readFileSync(path_1.default.resolve(__dirname, './hello-world1.pineapple'), { encoding: 'utf-8' });
    console.log(code, 'code');
}
catch (error) {
    console.log(`${error}`);
}
if (code.length > 0) {
    backend_1.Execute(code);
}
//# sourceMappingURL=main.js.map