/* jshint node: true */
/* jshint esnext: true */
'use strict';

const PDFDocument = require('pdfkit');
const qr = require('qr-image');
const _ = require('lodash');
const Q = require('q');
const config = require('config');
const participants = require('../service/participants');
const tshirts = require('../service/tshirts');
const barcode = require("rescode");

let pdfGeneration = {};

const fileName = 'start_numbers.pdf';
const pathToBackgroundImage = '/images/background_light.jpg';
const pathToLogoLeft = '/images/lauf_gegen_rechts_logo.jpg';
const pathToLogoRight = '/images/fc_st_pauli_marathon_logo.png';
const checkmarkSymbolSvg = 'M7.375,25 c0,0,10,11.375,14.125,11.375S44.875,8,44.875,8';

pdfGeneration.addCheckmarkSymbol = (doc) => {
  doc.translate(20, 280)
    .path(checkmarkSymbolSvg)
    .lineWidth(3)
    .stroke();
};

pdfGeneration.createStartNumberPage = (doc, participant) => {
  doc.image(__dirname + pathToBackgroundImage, {fit: [800, 800]});
  doc.image(__dirname + pathToLogoLeft, 20, 20, {fit: [130, 130]});
  doc.image(__dirname + pathToLogoRight, 475, 20, {fit: [100, 100]});

  doc.font('Helvetica-Bold').fontSize(200).fillColor('saddlebrown').text(participant.start_number, 0, 130, {align: 'center'});
  doc.fontSize(40).fillColor('red').text(participant.firstname.substring(0, 17), 0, 300, {align: 'center'});
  doc.fontSize(30).fillColor('red').text(participant.team.substring(0, 25), 0, 350, {align: 'center'});

  barcode.loadModules(["code128"], {'includetext': false, 'scaleX': 2});
  let barcodeSvg = barcode.create("code128", String(participant.start_number));

  doc.image(barcodeSvg, 260, 20, {fit: [70, 70]});
  doc.image(barcodeSvg, 20, 330, {fit: [70, 70]});
  doc.image(barcodeSvg, 500, 330, {fit: [70, 70]});

  if(participant.tshirt) {
    doc.fontSize(12).fillColor('black').text(participant.tshirt.size + ' ' + participant.tshirt.model, 500, 315);
  }

  if(participant.has_payed) {
    pdfGeneration.addCheckmarkSymbol(doc);
  }

  doc.addPage();
};

pdfGeneration.fillDocument = (doc, participants) => {
  participants = _.orderBy(participants, ['start_number']);
  _.forEach(participants, participant => pdfGeneration.createStartNumberPage(doc, participant) );
};

pdfGeneration.generateStartNumbers = (res, doc) => {
  const deferred = Q.defer();

  participants.confirmed().then(confirmed =>
    participants.registered().then(unconfirmed => {

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=' + fileName
      });
      doc.pipe(res);

      confirmed.map( (participant) => {
        participant.has_payed = true;
      });

      let allParticipants = confirmed.concat(unconfirmed);

      Q.all(allParticipants.map(tshirts.findAndAddTo))
        .then(() => {
          pdfGeneration.fillDocument(doc, allParticipants);
          doc.end();
          deferred.resolve(doc);
        });
    }));

  return deferred.promise;
};

pdfGeneration.generate = (res) => {
  let doc = new PDFDocument({size: 'A5', layout: 'landscape', margin: 0});
  return pdfGeneration.generateStartNumbers(res, doc);
};

module.exports = pdfGeneration;
