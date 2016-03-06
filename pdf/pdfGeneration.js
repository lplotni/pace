/* jshint node: true */
/* jshint esnext: true */
'use strict';

const PDFDocument = require('pdfkit');
const qr = require('qr-image');
const _ = require('lodash');
const Q = require('q');
const participants = require('../service/participants');

let pdfGeneration = {};

const fileName = 'start_numbers.pdf';

pdfGeneration.createStartNumberPage = function(startNumber, participant, paymentStatus, doc) {
  doc.fontSize(250).text(startNumber, 0, 150, {align: 'center'});
  doc.fontSize(70).text(participant.firstname, 0, 400, {align: 'center'});
  doc.fontSize(20).text('(' + paymentStatus + ')', {align: 'center'});

  doc.scale(5)
    .translate(130, 40)
    .path(qr.svgObject(startNumber).path)
    .fill('black', 'even-odd');

  doc.addPage();
};

pdfGeneration.fillDocument = function(res, doc) {
  let counter = 1;
  const deferred = Q.defer();

  participants.getConfirmed().then(confirmed =>
    participants.getRegistered().then(unconfirmed => {
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=' + fileName
      });
      doc.pipe(res);
      _.forEach(confirmed, participant => {
        pdfGeneration.createStartNumberPage(counter++, participant, 'bestätigt', doc);
      });
      _.forEach(unconfirmed, participant => {
        pdfGeneration.createStartNumberPage(counter++, participant, 'unbestätigt', doc);
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
