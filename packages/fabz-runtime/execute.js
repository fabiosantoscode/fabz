'use strict'

function createExecution(code, map) {
  if (!(this instanceof createExecution)) return new createExecution(...arguments);
  console.log('creating execution for code ' + JSON.stringify(code))
  ;(1, eval)(code)
}

function runExecution() {
  
}

Object.assign(exports, { createExecution, runExecution })
