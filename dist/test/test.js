"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const backend_1 = require("../src/backend");
let code = fs.readFileSync(path.resolve(__dirname, '../demo/hello-world-15.pineapple'), { encoding: 'utf-8' });
console.log(code, 'code');
if (code.length > 0) {
    backend_1.Execute(code);
}
