"use strict";
const fs = require('fs');
const path = require('path');
const Execute = require('../dist/src/backend.js').Execute;
code = fs.readFileSync(path.resolve(__dirname, '../demo/hello-world-10.pineapple'), { encoding: 'utf-8' });
console.log(code, 'code');
if (code.length > 0) {
    Execute(code);
}
