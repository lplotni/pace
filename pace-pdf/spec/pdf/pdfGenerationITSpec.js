'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, afterAll, beforeEach, fail */
const pdfGeneration = require('../../pdf/pdfGeneration');
const config = require('config');
const fs = require('fs');
describe('pdfGeneration', () => {
  const startnumber = '1234'

  it('writes pdf to disk', (done) => {
    pdfGeneration.generate({
      startNumber: startnumber,
      firstname: 'Digital',
      team: 'Unicorns',
      startBlock: '1',
      tshirt: {
        size: 'S',
        model: 'unisex'
      },
      hasPayed: true,
      onSiteRegistration: false,
      secureUrl: 'https://example.com/asjkd12234'
    });

    fs.readFile('/tmp/' + startnumber +'.pdf', 'utf8', (err, data) => {
      expect(data).toBeDefined();
      done();
    });
  });

  //todo cleanup the file

});
