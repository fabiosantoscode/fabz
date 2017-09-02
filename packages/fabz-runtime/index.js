"use strict";

const fs = require("fs");
const babylon = require("babylon");
const babel = require("babel-core");
const transformCode = require("transform-fabz");
const { runExecution, createExecution } = require('./execute.js')

const babelOptions = {};

function commenceExecution({ code, map }) {
  return runExecution(createExecution(code, map))
}

function createModule({ code, ast, map }) {
  if (!(this instanceof createModule)) {
    return new createModule({ code, ast, map });
  }
  Object.assign(this, { code, ast, map });
}

function runModule(module) {
  
}

function requireModule(filename, { isRoot = true } = {}) {
  try {
  const originalCode = fs.readFileSync(filename, { encoding: "utf-8" });
  const parsedCode = babylon.parse(originalCode)
  const onError = error => {
    error.code = originalCode;
    error.filename = filename;
    throw(error);
  };

    const transformedCode = transformCode(parsedCode)

      const babelTransformedCode = babel.transformFromAst(
        transformedCode,
        originalCode,
        babelOptions
      );
      const module = createModule(babelTransformedCode)
    return module
  } catch(e) {
    onError(e)
  }
}


Object.assign(exports, { createModule, runModule, requireModule, commenceExecution, createExecution, runExecution });
