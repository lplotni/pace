/* jshint node: true */
/* jshint esnext: true */
'use strict';

const PDFDocument = require('pdfkit');
const qr = require('qr-image');
const _ = require('lodash');
const Q = require('q');
const config = require('config');
const participants = require('../service/participants');
const barcodeGeneration = require('./barcodeGeneration');

let pdfGeneration = {};

const fileName = 'start_numbers.pdf';

const checkmarkSymbolSvg = 'M7.375,33.25 c0,0,10,11.375,14.125,11.375S44.875,8,44.875,8';

pdfGeneration.createStartNumberPage = function(startNumber, participant, hasPayed, doc) {
  doc.fontSize(250).text(startNumber, 0, 200, {align: 'center'});
  doc.fontSize(70).text(participant.firstname, 0, 400, {align: 'center'});

  let ean8Code = barcodeGeneration.ean8Code(startNumber);

  doc.image(ean8Code, 300, 50);
  doc.image(ean8Code, 50, 250);
  doc.image(ean8Code, 600, 250);

  if(hasPayed) {
    doc.path(checkmarkSymbolSvg)
      .translate(630, 350)
      .lineWidth(3)
      .stroke();
  }

  doc.addPage();
};

pdfGeneration.getNextStartNumber = function(lastNumber) {
  lastNumber++;
  let excludedNumbers = config.get('startnumbers.excluded');
  if(excludedNumbers.indexOf(lastNumber) > -1) {
    return lastNumber+1;
  } else {
    return lastNumber;
  }
};

pdfGeneration.fillDocument = function(res, doc) {
  let counter = 0;
  const deferred = Q.defer();

  participants.confirmed().then(confirmed =>
    participants.registered().then(unconfirmed => {
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=' + fileName
      });
      doc.pipe(res);
      _.forEach(confirmed, participant => {
        counter = this.getNextStartNumber(counter);
        pdfGeneration.createStartNumberPage(counter, participant, true, doc);
      });
      _.forEach(unconfirmed, participant => {
        counter = this.getNextStartNumber(counter);
        pdfGeneration.createStartNumberPage(counter, participant, false, doc);
      });
      doc.end();
      deferred.resolve(doc);
    }));

  return deferred.promise;
};

pdfGeneration.generate = function(res) {
  let doc = new PDFDocument({layout: 'landscape'});
  return pdfGeneration.fillDocument(res, doc);
};

module.exports = pdfGeneration;
