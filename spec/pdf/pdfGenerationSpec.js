'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, beforeEach, afterAll, spyOn */

const mockery = require('mockery');
const Q = require('q');

describe('pdfGeneration', () => {

  let pdfGeneration, res, participantsMock, documentMock;

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
      end: jasmine.createSpy('end')
    };

    participantsMock = {
      getConfirmed: jasmine.createSpy(),
      getRegistered: jasmine.createSpy()
    };

    mockery.registerMock('../service/participants', participantsMock);
    pdfGeneration = require('../../pdf/pdfGeneration');

    participantsMock.getConfirmed.and.returnValue(Q.fcall(() => [{ firstname: 'Bestaetigte', lastname: 'Person'}]));
    participantsMock.getRegistered.and.returnValue(Q.fcall(() => [{ firstname: 'Unbestaetigte', lastname: 'Person'}]));
  });

  afterAll(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should generate a page for every participant', function (done) {
    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.addPage).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('should add start number, name and payment status', function (done) {
    pdfGeneration.fillDocument(res, documentMock).then( () => {
      expect(documentMock.text).toHaveBeenCalledWith(1, 0, 150, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('Bestaetigte Person', 0, 400, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('(bestätigt)', {align: 'center'});

      expect(documentMock.text).toHaveBeenCalledWith(2, 0, 150, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('Unbestaetigte Person', 0, 400, {align: 'center'});
      expect(documentMock.text).toHaveBeenCalledWith('(unbestätigt)', {align: 'center'});
      done();
    });
  });

  it('should automatically download a PDF file called start_numbers', function (done) {
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