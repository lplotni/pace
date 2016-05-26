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
const editUrlHelper = require('../domain/editUrlHelper');
const timeCalculator = require('../domain/timeCalculator');
const race = require('../service/race');

let pdfGeneration = {};

const fileName = 'start_numbers.pdf';
const pathToBackgroundImage = '/images/background_light.jpg';
const pathToCertificateBackgroundImage = '/images/certificate_background.jpg';
const pathToLogoLeft = '/images/lauf_gegen_rechts_logo.jpg';
const pathToLogoRight = '/images/fc_st_pauli_marathon_logo.png';
const checkmarkSymbolSvg = 'M7.375,25 c0,0,10,11.375,14.125,11.375S44.875,8,44.875,8';

pdfGeneration.addCheckmarkSymbol = (doc) => {
  doc.translate(20, 280)
    .path(checkmarkSymbolSvg)
    .lineWidth(3)
    .stroke();
};

pdfGeneration.addQrCodeWithSelfServiceLink = (doc, selfServiceUrl) => {
  doc.fontSize(10).fillColor('black').text('Registriere dich', 300, 320);
  doc.fontSize(10).fillColor('black').text('nach dem Lauf', 300, 330);
  doc.fontSize(10).fillColor('black').text('unter diesem Link', 300, 340);

  doc.scale(2)
    .translate(100, 150)
    .path(qr.svgObject(selfServiceUrl).path)
    .fill('black', 'even-odd');
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

  if(participant.is_on_site_registration) {
    pdfGeneration.addQrCodeWithSelfServiceLink(doc, editUrlHelper.generateUrl(participant.secureid));
  }

  doc.addPage();
};

pdfGeneration.createCertificatePage = (doc,participant) => {
  const deferred = Q.defer();
  participants.rankByCategory(participant.start_number).then (category_rank => {
    participants.rank(participant.start_number).then (rank => {
      participants.getTime(participant.start_number).then(time => {
        if (_.isNull(time)) { 
          deferred.reject();
        } else {
          race.startTime().then( (starttime) => { 
              let timearray = timeCalculator.relativeTime(starttime,time, participant.start_block);
              doc.image(__dirname + pathToCertificateBackgroundImage, {fit: [595, 842]});
              doc.fontSize(30).fillColor('black').text(participant.firstname.substring(0, 30)+' '+ participant.lastname.substring(0, 30), 0, 365, {align: 'center'});
              doc.fontSize(25).fillColor('black').text(participant.team.substring(0, 60), 0, 400, {align: 'center'});
              doc.fontSize(30).fillColor('black').text(timearray[0]+':'+timearray[1]+':'+timearray[2], 0, 487, {align: 'center'});
              doc.fontSize(30).fillColor('black').text(rank, 0, 558, {align: 'center'});
              doc.fontSize(30).fillColor('black').text(category_rank, 0, 628, {align: 'center'});
              deferred.resolve();
          });
        };
      });
    });
  });
  return deferred.promise;
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

pdfGeneration.generateOnSiteStartNumbers = (res, doc) => {
  const deferred = Q.defer();

  participants.blancParticipants().then( participants => {
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=' + 'on_site_start_numbers.pdf'
      });
      doc.pipe(res);

      pdfGeneration.fillDocument(doc, participants);

      doc.end();

      deferred.resolve(doc);
    });

  return deferred.promise;
};

pdfGeneration.generateCertificateDownload = (res, doc, startnumber) => {
  const deferred = Q.defer();
  participants.byStartnumber(startnumber).then( participant => {
    pdfGeneration.createCertificatePage(doc, participant)
      .then(() => {
        res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=' + 'urkunde.pdf'
        });
        doc.pipe(res);
        doc.end();
        deferred.resolve(doc);
      }).catch(deferred.reject);
  }).catch(deferred.reject);
  return deferred.promise;
};

pdfGeneration.generateRegistered = (res) => {
  let doc = new PDFDocument({size: 'A5', layout: 'landscape', margin: 0});
  return pdfGeneration.generateStartNumbers(res, doc);
};

pdfGeneration.generateOnSite = (res) => {
  let doc = new PDFDocument({size: 'A5', layout: 'landscape', margin: 0});
  return pdfGeneration.generateOnSiteStartNumbers(res, doc);
};

pdfGeneration.generateCertificate = (res,startnumber) => {
  let doc = new PDFDocument({size: 'A4', margin: 0});
  return pdfGeneration.generateCertificateDownload(res, doc, startnumber);
};
module.exports = pdfGeneration;
