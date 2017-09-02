'use strict';

const objectWalk = require('object-walk-x');

module.exports = parsedCode => {
  objectWalk(parsedCode, Object.keys, (value, prop, object, depth) => {
    if (object.type === 'RequireExpression') {
      return Object.assign(object, {
        type: 'CallExpression',
        argument: null,
        callee: {
          type: 'Identifier',
          name: 'require'
        },
        arguments: [object.argument],
      });
    }
  });
  return parsedCode;
};
