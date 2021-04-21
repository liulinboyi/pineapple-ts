"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const signal_1 = require("./signal");
ava_1.default("signal check", t => {
    t.false(signal_1.Signal.isBreak(undefined));
    t.false(signal_1.Signal.isReturn(null));
    t.false(signal_1.Signal.isContinue(0));
    const returnSignal = new signal_1.Signal("return", "signal value");
    t.true(signal_1.Signal.isReturn(returnSignal));
    t.deepEqual(returnSignal.value, "signal value");
});
