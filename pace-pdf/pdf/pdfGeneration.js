/* jshint node: true */
/* jshint esnext: true */
'use strict';
const winston = require('winston');
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => new Date().toISOString(),
      formatter: (options) => {
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    })
  ]
});

const PDFDocument = require('pdfkit');
const fs = require('fs');
const Q = require('q');
const config = require('config');
const AdmZip = require('adm-zip');
var Archiver = require('archiver');

const qr = require('qr-image');
const barcode = require("rescode");

let pdfGeneration = {};

let createOutputDir = () => {
  let dir = config.get('pdfPath');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
};

const pathToBackgroundImage = '/images/background_light.jpg';

pdfGeneration.addQrCodeWithSelfServiceLink = (doc, selfServiceUrl) => {
  doc.fontSize(10).fillColor('black').text('Registriere dich', 300, 320);
  doc.fontSize(10).fillColor('black').text('nach dem Lauf', 300, 330);
  doc.fontSize(10).fillColor('black').text('unter diesem Link', 300, 340);

  doc.scale(2)
    .translate(100, 150)
    .path(qr.svgObject(selfServiceUrl).path)
    .fill('black', 'even-odd');
};

pdfGeneration.generate = (startNumberData) => {
  let doc = new PDFDocument({size: 'A5', layout: 'landscape', margin: 0});
  createOutputDir();
  let pdfPath = `${config.get('pdfPath')}${startNumberData.startNumber}.pdf`;
  doc.pipe(fs.createWriteStream(pdfPath));
  pdfGeneration.createStartNumberPage(doc, startNumberData);
  doc.end();
  logger.info(`start_number pdf stored: ${pdfPath}`);
};

pdfGeneration.createStartNumberPage = (doc, startNumberData) => {

  doc.image(__dirname + pathToBackgroundImage, {width: 600,height: 420});

  doc.font('Helvetica-Bold').fontSize(200).fillColor('saddlebrown').text(startNumberData.startNumber, 0, 130, {align: 'center'});
  doc.fontSize(30).fillColor('red').text(startNumberData.team.substring(0, 25), 0, 300, {align: 'center'});

  barcode.loadModules(["code128"], {'includetext': false, 'scaleX': 2});
  let barcodeSvg = barcode.create("code128", String(startNumberData.startNumber));

  doc.image(barcodeSvg, 20, 230, {fit: [70, 70]});
  doc.image(barcodeSvg, 20, 250, {fit: [70, 70]});
  doc.image(barcodeSvg, 500, 230, {fit: [70, 70]});
  doc.image(barcodeSvg, 500, 250, {fit: [70, 70]});

  if(startNumberData.onSiteRegistration) {
    pdfGeneration.addQrCodeWithSelfServiceLink(doc, startNumberData.secureUrl);
  }
};

pdfGeneration.zip = (res) => {
    var zip = Archiver('zip');
    createOutputDir();
    zip.pipe(res);
    zip.on('error', function(err) {
      console.log(err)
    })
    zip.glob(`${config.get('pdfPath')}/*.pdf`);
    zip.finalize();
  }

module.exports = pdfGeneration;
