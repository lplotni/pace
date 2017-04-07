/* jshint node: true */
/* jshint esnext: true */
'use strict';

const PDFDocument = require('pdfkit');
const qr = require('qr-image');
const _ = require('lodash');
const Q = require('q');
const config = require('config');
const moment = require('moment');
require("moment-duration-format");
const participants = require('../service/participants');
const tshirts = require('../service/tshirts');
const editUrlHelper = require('../domain/editUrlHelper');
const timeCalculator = require('../domain/timeCalculator');
const race = require('../service/race');

let pdfGeneration = {};

const fileName = 'start_numbers.pdf';
const pathToCertificateBackgroundImage = '/images/certificate_background.jpg';

pdfGeneration.createCertificatePage = (doc,participant) => {
  const deferred = Q.defer();
  participants.rankByCategory(participant.start_number).then (category_rank => {
    participants.rank(participant.start_number).then (rank => {
      participants.getTime(participant.start_number).then(time => {
        if (_.isNull(time)) { 
          deferred.reject();
        } else {
              let timestring = moment.duration(_.toNumber(participant.seconds),'seconds').format("hh:mm:ss", { trim: false});
              doc.image(__dirname + pathToCertificateBackgroundImage, {fit: [595, 842]});
              doc.fontSize(30).fillColor('black').text(participant.firstname.substring(0, 30)+' '+ participant.lastname.substring(0, 30), 0, 365, {align: 'center'});
              doc.fontSize(25).fillColor('black').text(participant.team.substring(0, 60), 0, 400, {align: 'center'});
              doc.fontSize(30).fillColor('black').text(timestring, 0, 487, {align: 'center'});
              doc.fontSize(30).fillColor('black').text(rank, 0, 558, {align: 'center'});
              doc.fontSize(30).fillColor('black').text(category_rank, 0, 628, {align: 'center'});
              deferred.resolve();
        };
      });
    });
  });
  return deferred.promise;
};

pdfGeneration.generateStartNumbers = (res, doc) => {
  const deferred = Q.defer();

  participants.get.confirmed().then(confirmed =>
    participants.get.registered().then(unconfirmed => {

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
          // pdfGeneration.fillDocument(doc, allParticipants); todo
          doc.end();
          deferred.resolve(doc);
        });
    }));

  return deferred.promise;
};

pdfGeneration.generateOnSiteStartNumbers = (res, doc) => {
  const deferred = Q.defer();

  participants.get.blancParticipants().then( participants => {
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
  participants.get.byStartnumber(startnumber).then( participant => {
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
