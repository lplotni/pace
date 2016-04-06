/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');
const barcode = require("rescode");

let barcodeGeneration = {};

barcodeGeneration.ean8Code = function (content) {
  barcode.loadModules(["code128"]);
  return barcode.create("code128", String(content));
};

module.exports = barcodeGeneration;