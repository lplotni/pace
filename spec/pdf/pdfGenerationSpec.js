'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, beforeEach, spyOn */

const mockery = require('mockery');
const Q = require('q');
const config = require('config');

describe('pdfGeneration', () => {

  let pdfGeneration, res, participantsMock, documentMock;
  let confirmedParticipant, unconfirmedParticipant;

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
      text: jasmine.createSpy('text'),
      scale: function () { return documentMock; },
      translate: function () { return documentMock; },
      path: function () { return documentMock; },
      fill: jasmine.createSpy('fill'),
      addPage: jasmine.createSpy('addPage'),
      image: jasmine.createSpy('image'),
      end: jasmine.createSpy('end')
    };

    participantsMock = {
      getConfirmed: jasmine.createSpy(),
      getRegistered: jasmine.createSpy()
    };

    mockery.registerMock('../service/participants', participantsMock);
    pdfGeneration = require('../../pdf/pdfGeneration');

    confirmedParticipant = { firstname: 'Bestaetigte', lastname: 'Person'};
    unconfirmedParticipant = { firstname: 'Unbestaetigte', lastname: 'Person'};
    participantsMock.getConfirmed.and.returnValue(Q.fcall(() => [confirmedParticipant]));
    participantsMock.getRegistered.and.returnValue(Q.fcall(() => [unconfirmedParticipant]));
  });

  it('should generate a page for every participant', (done) => {
    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.addPage).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('should add start number, name and payment status', (done) => {
    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.text).toHaveBeenCalledWith(1, 0, 150, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('Bestaetigte', 0, 400, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('(bestätigt)', {align: 'center'});

      expect(documentMock.text).toHaveBeenCalledWith(2, 0, 150, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('Unbestaetigte', 0, 400, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('(unbestätigt)', {align: 'center'});
      done();
    });
  });

  it('should add the barcode three times for easier scanning', (done) => {
    participantsMock.getConfirmed.and.returnValue(Q.fcall(() => [confirmedParticipant]));
    participantsMock.getRegistered.and.returnValue(Q.fcall(() => []));

    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.image).toHaveBeenCalledTimes(3);
      done();
    });
  });

  it('should automatically download a PDF file called start_numbers', (done) => {
    const fileName = 'start_numbers.pdf';
    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(res.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename='+fileName
      });
      done();
    });
  });

  describe('isExcludedStartNumber', function() {

    it('should return the next start number excluding the numbers from the config', () => {
      expect(pdfGeneration.getNextStartNumber(1)).toBe(2);

      config.get('startnumbers.excluded').map(function(number) {
        expect(pdfGeneration.getNextStartNumber(number)).toBe(number+1);
      });
    });

  });

});