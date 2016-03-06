/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');
const barcode = require("rescode");

let barcodeGeneration = {};

barcodeGeneration.toEightDigits = function (content) {
  return _.padStart(content, 8, '0');
};

barcodeGeneration.ean8Code = function (content) {
  barcode.loadModules(["ean2", "ean5", "ean8", "ean13"]);
  return barcode.create("ean8",barcodeGeneration.toEightDigits(content));
};

module.exports = barcodeGeneration;