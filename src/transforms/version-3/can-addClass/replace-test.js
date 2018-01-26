require('mocha');
const utils = require('../../../../test/utils');
const transforms = require('../../../../');

const toTest = transforms.filter(function(transform) {
  return transform.name === 'can-addClass/replace.js';
})[0];

describe('can-addClass-replace', function() {

  it('replaces all references and adds import dependency', function() {
    const fn = require(toTest.file);
    const inputPath = `fixtures/version-3/${toTest.fileName.replace('.js', '-import-input.js')}`;
    const outputPath = `fixtures/version-3/${toTest.fileName.replace('.js', '-import-output.js')}`;
    utils.diffFiles(fn, inputPath, outputPath);
  });

  it('replaces all references and adds require dependency', function() {
    const fn = require(toTest.file);
    const inputPath = `fixtures/version-3/${toTest.fileName.replace('.js', '-require-input.js')}`;
    const outputPath = `fixtures/version-3/${toTest.fileName.replace('.js', '-require-output.js')}`;
    utils.diffFiles(fn, inputPath, outputPath);
  });
});
