"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImportSpecifier = exports.isImportDefaultSpecifier = exports.isCallExpression = exports.isClassProperty = exports.isClassMethod = exports.isRestElement = exports.isAssignmentPattern = exports.isSpreadElement = exports.isMemberExpression = exports.isArrayPattern = exports.isObjectProperty = exports.isObjectPattern = exports.isIdentifier = exports.isVariableDeclaration = exports.isFunctionDeclaration = exports.isObjectExpression = exports.isArrayExpression = exports.isStringLiteral = void 0;
function is(node, type) {
    return node.type === type;
}
function isStringLiteral(node) {
    return is(node, "StringLiteral");
}
exports.isStringLiteral = isStringLiteral;
function isArrayExpression(node) {
    return is(node, "ArrayExpression");
}
exports.isArrayExpression = isArrayExpression;
function isObjectExpression(node) {
    return is(node, "ObjectExpression");
}
exports.isObjectExpression = isObjectExpression;
function isFunctionDeclaration(node) {
    return is(node, "FunctionDeclaration");
}
exports.isFunctionDeclaration = isFunctionDeclaration;
function isVariableDeclaration(node) {
    return is(node, "VariableDeclaration");
}
exports.isVariableDeclaration = isVariableDeclaration;
function isIdentifier(node) {
    return is(node, "Identifier");
}
exports.isIdentifier = isIdentifier;
function isObjectPattern(node) {
    return is(node, "ObjectPattern");
}
exports.isObjectPattern = isObjectPattern;
function isObjectProperty(node) {
    return is(node, "ObjectProperty");
}
exports.isObjectProperty = isObjectProperty;
function isArrayPattern(node) {
    return is(node, "ArrayPattern");
}
exports.isArrayPattern = isArrayPattern;
function isMemberExpression(node) {
    return is(node, "MemberExpression");
}
exports.isMemberExpression = isMemberExpression;
function isSpreadElement(node) {
    return is(node, "SpreadElement");
}
exports.isSpreadElement = isSpreadElement;
function isAssignmentPattern(node) {
    return is(node, "AssignmentPattern");
}
exports.isAssignmentPattern = isAssignmentPattern;
function isRestElement(node) {
    return is(node, "RestElement");
}
exports.isRestElement = isRestElement;
function isClassMethod(node) {
    return is(node, "ClassMethod");
}
exports.isClassMethod = isClassMethod;
function isClassProperty(node) {
    return is(node, "ClassProperty");
}
exports.isClassProperty = isClassProperty;
function isCallExpression(node) {
    return is(node, "CallExpression");
}
exports.isCallExpression = isCallExpression;
function isImportDefaultSpecifier(node) {
    return is(node, "ImportDefaultSpecifier");
}
exports.isImportDefaultSpecifier = isImportDefaultSpecifier;
function isImportSpecifier(node) {
    return is(node, "ImportSpecifier");
}
exports.isImportSpecifier = isImportSpecifier;
