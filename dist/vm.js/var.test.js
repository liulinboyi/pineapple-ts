"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const var_1 = require("./var");
ava_1.default("var", t => {
    const $var = new var_1.Var("var", "name", "hello world", {});
    t.deepEqual($var.kind, "var");
    t.deepEqual($var.name, "name");
    t.deepEqual($var.value, "hello world");
    // set var
    $var.set("hello");
    t.deepEqual($var.value, "hello"); // value have been modify
});
