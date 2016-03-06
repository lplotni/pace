'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, beforeEach, spyOn */

const barcodeGeneration = require('../../pdf/barcodeGeneration');

describe('barcodeGeneration', () => {

  // FIXME: somehow jasmine can not load some functions
  //it('should generate a barcode', function () {
  //  let ean8Code = barcodeGeneration.ean8Code("");
  //  expect(ean8Code).toBeDefined();
  //});

  it('should transform to eight digits', function () {
    let zeroPadded = barcodeGeneration.toEightDigits("1");
    expect(zeroPadded).toBe("00000001");
  });

});