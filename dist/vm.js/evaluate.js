"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es5_1 = require("./standard/es5");
const es2015_1 = require("./standard/es2015");
const es2016_1 = require("./standard/es2016");
const es2017_1 = require("./standard/es2017");
const experimental_1 = require("./standard/experimental");
const visitors = {
    ...es5_1.es5,
    ...es2015_1.es2015,
    ...es2016_1.es2016,
    ...es2017_1.es2017,
    ...experimental_1.experimental
};
function evaluate(path) {
    path.evaluate = evaluate;
    const handler = visitors[path.node.type];
    return handler(path);
}
exports.default = evaluate;
