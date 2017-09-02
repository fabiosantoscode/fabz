'use strict';

const chalk = require('chalk')
const fs = require('fs');
const path = require('path');
const leftPad = require('left-pad');
const ErrorStackParser = require('error-stack-parser');
const sourcemapFinder = require('./vendor/sourcemap-finder');
const sourcemap = require('source-map');

function takeLines(code, centerLine, pad, extraLines = 1) {
  const lines = code.split(/\n/g);
  centerLine--
  return lines.slice(centerLine - extraLines, centerLine + 1).map((line, i) => (
    chalk.gray(leftPad(i + 1 + ': ', pad)) + line
  )).join('\n')
}

function formatSecondaryStackLine({ functionName, fileName, lineNumber }) {
  const cwd = process.cwd();
  const meths = functionName.split(/\./g)
  const objects = meths.slice(0, -1)
  const method = meths[meths.length - 1]
  return (
    ' ! File ' +
    fileName.replace(cwd, '.') +
    chalk.gray(':' + lineNumber) +
    ' in ' +
    objects.join('.') + ( objects.length ? '.' + chalk.blue(method) : '' )
  );
}

function readSourceMap(
  { functionName, fileName, lineNumber, columnNumber = 0 },
  { getLinePreview = false } = {}
) {
  let linePreview;
  if (fs.existsSync(fileName + '.map')) {
    const { source, line, column } = sourcemapFinder(
      fs.readFileSync(fileName + '.map'),
      { position: [lineNumber, columnNumber] }
    );
    fileName = path.resolve(path.dirname(fileName), source);
    if (getLinePreview) {
      const originalFile = fs.readFileSync(fileName) + '';
      linePreview = '\n' + takeLines(originalFile, line, 8, /*extralines=*/ 2);
    }
    lineNumber = line;
    columnNumber = column;
  }
  return {
    functionName,
    fileName,
    linePreview: linePreview || '',
    lineNumber,
    columnNumber,
  };
}

function formatStackLine(stackLine) {
  const {
    functionName,
    fileName,
    lineNumber,
    linePreview,
    columnNumber = 0,
  } = readSourceMap(stackLine, { getLinePreview: true });
  return (
    formatSecondaryStackLine({
      functionName,
      fileName,
      lineNumber,
      columnNumber,
    }) + linePreview
  );
}

function formatStack(e) {
  const parsed = ErrorStackParser.parse(e);
  parsed.reverse();
  const { length } = parsed;
  const smallFrames = parsed
    .slice(0, length - 3)
    .map(readSourceMap)
    .map(formatSecondaryStackLine);
  const largeFrames = parsed.slice(length - 3, length).map(formatStackLine);
  return [...smallFrames, ...largeFrames].join('\n') + '\n';
}

function formatError(e, pad = 5) {
  const header = 'Traceback (most recent call last): \n';
  let messageText = e.message
  if (e.constructor.name === 'SyntaxError') {
    const { loc, code, filename, stack, message } = e;
    const codeSample = takeLines(code, loc.line, pad);
    const arrow = Array(loc.column + pad + 1).join(' ') + '^' + ' <- ' + message;
    const errorText = e.constructor.name + ' in file ' + filename;

    messageText = [ codeSample, arrow, errorText].join('\n');
  }
  return chalk.red(header) + formatStack(e) + messageText
}

module.exports = formatError;

Object.assign(module.exports, { formatError });
