'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, beforeEach, afterAll, spyOn */

const mockery = require('mockery');
const Q = require('q');
const config = require('config');

describe('pdfGeneration', () => {

  let pdfGeneration, res, participantsMock, documentMock, tshirtsMock, qrCodeMock, raceMock;
  let confirmedParticipant;

  beforeEach(() => {

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    mockery.resetCache();

    res = {
      writeHead: jasmine.createSpy('writeHead')
    };

    documentMock = {
      pipe: jasmine.createSpy('pipe'),
      fontSize: function () { return documentMock; },
      font: function () { return documentMock; },
      fillColor: function () { return documentMock; },
      text: jasmine.createSpy('text'),
      scale: function () { return documentMock; },
      translate: function () { return documentMock; },
      path: function () { return documentMock; },
      lineWidth: function () { return documentMock; },
      stroke: jasmine.createSpy('stroke'),
      addPage: jasmine.createSpy('addPage'),
      image: jasmine.createSpy('image'),
      fill: jasmine.createSpy('fill'),
      end: jasmine.createSpy('end')
    };

    participantsMock = {
      confirmed: jasmine.createSpy('confirmed'),
      registered: jasmine.createSpy('registered'),
      saveBlanc: jasmine.createSpy('saveBlanc'),
      byId: jasmine.createSpy('byId'),
      byStartnumber: jasmine.createSpy('byStartnumber'),
      getTime: jasmine.createSpy('getTime'),
      blancParticipants: jasmine.createSpy('blancParticipants'),
      rank: jasmine.createSpy('rank'),
      rankByCategory: jasmine.createSpy('rankByCategory')
    };

    tshirtsMock = {
      findAndAddTo: jasmine.createSpy('findAndAddTo')
    };

    qrCodeMock = {
      svgObject: () => {return qrCodeMock;},
      path: jasmine.createSpy('path')
    };

    raceMock = {
      startTime: jasmine.createSpy('startTime')
    };

    mockery.registerMock('../service/participants', participantsMock);
    mockery.registerMock('../service/tshirts', tshirtsMock);
    mockery.registerMock('../service/race', raceMock);
    mockery.registerMock('qr-image', qrCodeMock);
    pdfGeneration = require('../../pdf/pdfGeneration');

    confirmedParticipant = { firstname: 'Bestaetigte', lastname: 'Person', team: '', start_number: 1};
    const unconfirmedParticipant = { firstname: 'Unbestaetigte', lastname: 'Person', team: 'a team name', start_number: 2};
    participantsMock.confirmed.and.returnValue(Q.fcall(() => [confirmedParticipant]));
    participantsMock.registered.and.returnValue(Q.fcall(() => [unconfirmedParticipant]));
    participantsMock.byStartnumber.and.returnValue(Q.fcall(() => confirmedParticipant));
    participantsMock.getTime.and.returnValue(Q.fcall(() => 10000));
    participantsMock.rank.and.returnValue(Q.fcall(() => 1));
    participantsMock.rankByCategory.and.returnValue(Q.fcall(() => 1));
    qrCodeMock.path.and.returnValue('some qr code path');
    raceMock.startTime.and.returnValue(Q.fcall(() => 101));
  });

  afterAll(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should add the barcode three times for easier scanning', () => {
    let numberOfOtherImageCalls = 3;

    pdfGeneration.createStartNumberPage(documentMock, confirmedParticipant);
    expect(documentMock.image).toHaveBeenCalledTimes(3 + numberOfOtherImageCalls);
  });

  it('should add the background image and the logos', () => {
    pdfGeneration.createStartNumberPage(documentMock, confirmedParticipant);

    expect(documentMock.image.calls.argsFor(0)[0]).toMatch(/pdf\/images\/background_light\.jpg/);
    expect(documentMock.image.calls.argsFor(1)[0]).toMatch(/pdf\/images\/lauf_gegen_rechts_logo\.jpg/);
    expect(documentMock.image.calls.argsFor(2)[0]).toMatch(/pdf\/images\/fc_st_pauli_marathon_logo\.png/);
  });

  it('should automatically download a PDF file called start_numbers', (done) => {
    const fileName = 'start_numbers.pdf';
    pdfGeneration.generateStartNumbers(res, documentMock).then( () => {
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename='+fileName
      });
      done();
    });
  });

  describe('generateStartNumbers', () => {

    it('should generate a page for every participant', (done) => {
      pdfGeneration.generateStartNumbers(res, documentMock).then( () => {
        expect(documentMock.addPage).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should add tshirt details', (done) => {
      participantsMock.confirmed.and.returnValue(Q.fcall(() => [
        { firstname: 'Third', lastname: 'Person', team: '', start_number: 3, tshirt: { size: 'XS', model: 'Normal fit' }}
      ]));

      // why is this mock not having any effect?
      tshirtsMock.findAndAddTo.and.returnValue(Q.fcall(() => [
        { firstname: 'Bestaetigte', lastname: 'Person', team: '', start_number: 1, tshirt: { size: 'XS', model: 'Normal fit' }}
      ]));

      pdfGeneration.generateStartNumbers(res, documentMock).then( () => {
        expect(documentMock.text).toHaveBeenCalledWith('XS Normal fit', 500, 315);
        done();
      });
    });

    it('should add a checkmark symbol only if the participant has payed', (done) => {
      pdfGeneration.generateStartNumbers(res, documentMock).then( () => {
        expect(documentMock.stroke).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should add start number and name', (done) => {
      pdfGeneration.generateStartNumbers(res, documentMock).then( () => {
        expect(documentMock.text).toHaveBeenCalledWith(1, 0, 130, {align: 'center'});
        expect(documentMock.text).toHaveBeenCalledWith('Bestaetigte', 0, 300, {align: 'center'});

        expect(documentMock.text).toHaveBeenCalledWith(2, 0, 130, {align: 'center'});
        expect(documentMock.text).toHaveBeenCalledWith('Unbestaetigte', 0, 300, {align: 'center'});
        done();
      });
    });

    it('should add the team name if it exits', (done) => {
      pdfGeneration.generateStartNumbers(res, documentMock).then( () => {
        expect(documentMock.text).toHaveBeenCalledWith('', 0, 350, {align: 'center'});
        expect(documentMock.text).toHaveBeenCalledWith('a team name', 0, 350, {align: 'center'});
        done();
      });
    });

  });

  describe('fillDocument', () => {

    it('should sort the pdf pages by start number in ascending order', () => {
      let unsortedParticipants = [
        {firstname: 'Third', lastname: 'Person', team: '', start_number: 3},
        {firstname: 'First', lastname: 'Person', team: '', start_number: 1},
        {firstname: 'Second', lastname: 'Person', team: '', start_number: 2}
      ];

      pdfGeneration.fillDocument(documentMock, unsortedParticipants);
      expect(documentMock.text.calls.argsFor(1)[0]).toBe('First');
      expect(documentMock.text.calls.argsFor(4)[0]).toBe('Second');
      expect(documentMock.text.calls.argsFor(7)[0]).toBe('Third');
    });

  });

  describe('generateOnSiteStartNumbers', () => {

    beforeEach(() => {
      let onSiteParticipant = {
        firstname: '',
        lastname: '',
        team: '',
        start_number: 3,
        secureid: 'some secure id',
        is_on_site_registration: true};
      participantsMock.blancParticipants.and.returnValue(Q.fcall(() => [onSiteParticipant]));
      participantsMock.saveBlanc.and.returnValue(Q.fcall(() => []));
    });

    it('should add the start number, blank name and blank team name', (done) => {
      pdfGeneration.generateOnSiteStartNumbers(res, documentMock).then( () => {
        expect(documentMock.text).toHaveBeenCalledWith(3, 0, 130, {align: 'center'});
        expect(documentMock.text).toHaveBeenCalledWith('', 0, 300, {align: 'center'});
        expect(documentMock.text).toHaveBeenCalledWith('', 0, 350, {align: 'center'});
        done();
      });
    });

    it('should not add the payment checkmark', function (done) {
      pdfGeneration.generateOnSiteStartNumbers(res, documentMock).then( () => {
        expect(documentMock.stroke).not.toHaveBeenCalled();
        done();
      });
    });

    it('should add the QR code to the self-service link', function (done) {
      pdfGeneration.generateOnSiteStartNumbers(res, documentMock).then( () => {
        expect(documentMock.fill).toHaveBeenCalledWith('black', 'even-odd');
        done();
      });
    });

    it('should automatically download a PDF file called on_site_start_numbers', (done) => {
      const fileName = 'on_site_start_numbers.pdf';
      pdfGeneration.generateOnSiteStartNumbers(res, documentMock).then( () => {
        expect(res.writeHead).toHaveBeenCalledWith(200, {
          'Content-Type': 'application/pdf',
          'Access-Control-Allow-Origin': '*',
          'Content-Disposition': 'attachment; filename='+fileName
        });
        done();
      });
    });

  });

  describe('generateCertificate', () => {
    it('should generate one certificate', (done) => {
      pdfGeneration.generateCertificateDownload(res, documentMock, '1').then( () => {
        expect(documentMock.text).toHaveBeenCalledWith('Bestaetigte Person', 0, 345, {align: 'center'});
        expect(documentMock.text).toHaveBeenCalledWith('2:44:59', 0, 460, {align: 'center'});
        done();
      });
    });
  });

});
