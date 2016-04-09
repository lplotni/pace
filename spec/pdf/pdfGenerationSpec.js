'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, beforeEach, afterAll, spyOn */

const mockery = require('mockery');
const Q = require('q');
const config = require('config');

describe('pdfGeneration', () => {

  let pdfGeneration, res, participantsMock, documentMock;
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
      end: jasmine.createSpy('end')
    };

    participantsMock = {
      confirmed: jasmine.createSpy(),
      registered: jasmine.createSpy()
    };

    mockery.registerMock('../service/participants', participantsMock);
    pdfGeneration = require('../../pdf/pdfGeneration');

    confirmedParticipant = { firstname: 'Bestaetigte', lastname: 'Person', start_number: 1};
    let unconfirmedParticipant = { firstname: 'Unbestaetigte', lastname: 'Person', start_number: 2};
    participantsMock.getConfirmed.and.returnValue(Q.fcall(() => [confirmedParticipant]));
    participantsMock.getRegistered.and.returnValue(Q.fcall(() => [unconfirmedParticipant]));
  });

  afterAll(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should generate a page for every participant', (done) => {
    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.addPage).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('should add start number, name and payment status', (done) => {
    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.text).toHaveBeenCalledWith(1, 0, 130, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('Bestaetigte', 0, 300, {align: 'center'});

      expect(documentMock.text).toHaveBeenCalledWith(2, 0, 130, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('Unbestaetigte', 0, 300, {align: 'center'});
      done();
    });
  });

  it('should add the barcode three times for easier scanning', (done) => {
    let numberOfOtherImageCalls = 3;

    participantsMock.getConfirmed.and.returnValue(Q.fcall(() => [confirmedParticipant]));
    participantsMock.getRegistered.and.returnValue(Q.fcall(() => []));

    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.image).toHaveBeenCalledTimes(3 + numberOfOtherImageCalls);
      done();
    });
  });

  it('should add the background image and the logos', (done) => {
    participantsMock.confirmed.and.returnValue(Q.fcall(() => [confirmedParticipant]));
    participantsMock.registered.and.returnValue(Q.fcall(() => []));

    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.image.calls.argsFor(0)[0]).toMatch(/pdf\/images\/background_light\.jpg/);
      expect(documentMock.image.calls.argsFor(1)[0]).toMatch(/pdf\/images\/lauf_gegen_rechts_logo\.jpg/);
      expect(documentMock.image.calls.argsFor(2)[0]).toMatch(/pdf\/images\/fc_st_pauli_marathon_logo\.png/);
      done();
    });
  });

  it('should add a checkmark symbol only if the participant has payed', (done) => {
    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.stroke).toHaveBeenCalledTimes(1);
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

});