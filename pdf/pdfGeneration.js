/* jshint node: true */
/* jshint esnext: true */
'use strict';

const PDFDocument = require('pdfkit');
const qr = require('qr-image');
const _ = require('lodash');
const Q = require('q');
const config = require('config');
const participants = require('../service/participants');
const barcode = require("rescode");

let pdfGeneration = {};

const fileName = 'start_numbers.pdf';

const checkmarkSymbolSvg = 'M7.375,33.25 c0,0,10,11.375,14.125,11.375S44.875,8,44.875,8';

pdfGeneration.createStartNumberPage = function(startNumber, participant, hasPayed, doc) {
  doc.image(__dirname + '/images/background_light.jpg', {fit: [800, 800]});
  doc.image(__dirname + '/images/lauf_gegen_rechts_logo.jpg', 20, 20, {fit: [150, 150]});
  doc.image(__dirname + '/images/fc_st_pauli_marathon_logo.png', 450, 20, {fit: [130, 130]});

  doc.font('Helvetica-Bold').fontSize(200).fillColor('saddlebrown').text(startNumber, 0, 130, {align: 'center'});
  doc.fontSize(40).fillColor('red').text(participant.firstname, 0, 300, {align: 'center'});
  doc.fontSize(30).fillColor('red').text(participant.team, 0, 350, {align: 'center'});

  barcode.loadModules(["code128"]);
  let ean8Code = barcode.create("code128", String(startNumber));

  doc.image(ean8Code, 260, 20, {fit: [70, 70]});
  doc.image(ean8Code, 50, 220, {fit: [70, 70]});
  doc.image(ean8Code, 470, 220, {fit: [70, 70]});

  if(hasPayed) {
    doc.translate(500, 300)
      .path(checkmarkSymbolSvg)
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
  let doc = new PDFDocument({size: 'A5', layout: 'landscape', margin: 0});
  return pdfGeneration.fillDocument(res, doc);
};

module.exports = pdfGeneration;
