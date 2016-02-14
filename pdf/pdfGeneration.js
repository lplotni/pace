/* jshint node: true */
/* jshint esnext: true */
'use strict';

const PDFDocument = require('pdfkit');
const _ = require('lodash');
const Q = require('q');
const participants = require('../service/participants');

let pdfGeneration = {};

let fileName = 'start_numbers.pdf';

pdfGeneration.generate = function(res) {
  const deferred = Q.defer();
  participants.getConfirmed().then(confirmed =>
    participants.getRegistered().then(unconfirmed => {
      let doc = new PDFDocument();
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=' + fileName
      });
      doc.pipe(res);

      _.forEach(confirmed, participant => {
        let content = participant.firstname + ' ' + participant.lastname;
        doc.text(content, 100, 100);
        doc.text('confirmed', 100, 200);
        doc.addPage();
      });
      _.forEach(unconfirmed, participant => {
        let content = participant.firstname + ' ' + participant.lastname;
        doc.text(content, 100, 100);
        doc.text('unconfirmed', 100, 200);
        doc.addPage();
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
