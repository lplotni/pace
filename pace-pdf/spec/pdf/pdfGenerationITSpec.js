'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, afterAll, beforeEach, fail */
const pdfGeneration = require('../../pdf/pdfGeneration');
const config = require('config');
const fs = require('fs');
describe('pdfGeneration', () => {
  const startnumber = '1234';
  let startnumberPath = `${config.get('pdfPath')}/${startnumber}.pdf`;
  let zipfile = `${config.get('pdfPath')}/startnumbers.zip`;

  afterAll( () => {
   fs.unlinkSync(startnumberPath);
   fs.unlinkSync(zipfile);
  });

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

    fs.readFile(startnumberPath, 'utf8', (err, data) => {
      expect(data).toBeDefined();
      done();
    });
  });

  it('generates a zip file', (done) => {
    let output = fs.WriteStream(zipfile);
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

    pdfGeneration.zip(output);
    fs.readFile(zipfile, 'utf8', (err, data) => {
      expect(data).toBeDefined();
      done();
    });
  });

});
