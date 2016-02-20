/* jshint node: true */
/* jshint esnext: true */
'use strict';

const PDFDocument = require('pdfkit');
const _ = require('lodash');
const Q = require('q');
const participants = require('../service/participants');

let pdfGeneration = {};

let fileName = 'start_numbers.pdf';

const createStartNumberPage = function(startNumber, participant, paymentStatus, doc) {
  doc.fontSize(250).text(startNumber, 0, 150, {align: 'center'});
  let name = participant.firstname + ' ' + participant.lastname;
  doc.fontSize(100).text(name, 0, 400, {align: 'center'});
  doc.fontSize(20).text('(' + paymentStatus + ')', {align: 'center'});
  doc.addPage();
};

pdfGeneration.generate = function(res) {
  const deferred = Q.defer();
  participants.getConfirmed().then(confirmed =>
    participants.getRegistered().then(unconfirmed => {
      let doc = new PDFDocument({layout: 'landscape'});
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=' + fileName
      });
      doc.pipe(res);

      let counter = 1;

      _.forEach(confirmed, participant => {
        createStartNumberPage(counter++, participant, 'bestätigt', doc);
      });
      _.forEach(unconfirmed, participant => {
        createStartNumberPage(counter++, participant, 'unbestätigt', doc);
      });
      doc.end();
      deferred.resolve();
    }));
  return deferred.promise;
};

pdfGeneration.download = function(res) {
  res.download(fileName);
};

module.exports = pdfGeneration;
