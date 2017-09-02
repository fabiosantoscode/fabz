// https://raw.githubusercontent.com/oroce/sourcemap-finder/master/index.js

var SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = function findPosition(content, program) {
  var mapping;
  try {
    mapping = JSON.parse('' + content);
  } catch (x) {
    return null;
  }
  var smc = new SourceMapConsumer(mapping);
  var originalPosition = smc.originalPositionFor({
    line: program.row || program.position[0],
    column: program.column || program.position[1],
  });
  return originalPosition;
};
