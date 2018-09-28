'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, beforeEach, afterAll, spyOn */

const mockery = require('mockery');

describe('pdfGeneration', () => {

  let pdfGeneration, documentMock, qrCodeMock;
  let startNumberData;

  beforeEach(() => {

    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    mockery.resetCache();

    documentMock = {
      pipe: jasmine.createSpy('pipe'),
      fontSize: function () {
        return documentMock;
      },
      font: function () {
        return documentMock;
      },
      fillColor: function () {
        return documentMock;
      },
      text: jasmine.createSpy('text'),
      scale: function () {
        return documentMock;
      },
      translate: function () {
        return documentMock;
      },
      path: function () {
        return documentMock;
      },
      lineWidth: function () {
        return documentMock;
      },
      stroke: jasmine.createSpy('stroke'),
      addPage: jasmine.createSpy('addPage'),
      image: jasmine.createSpy('image'),
      fill: jasmine.createSpy('fill'),
      end: jasmine.createSpy('end')
    };

    qrCodeMock = {
      svgObject: () => {
        return qrCodeMock;
      },
      path: jasmine.createSpy('path')
    };

    mockery.registerMock('qr-image', qrCodeMock);

    pdfGeneration = require('../../pdf/pdfGeneration');

    startNumberData = {
      startNumber: '1234',
      firstname: 'Digital',
      team: 'Unicorns',
      startBlock: '1',
      startBlockColor: '#123456',
      tshirt: {
        size: 'S',
        model: 'unisex'
      },
      hasPayed: true,
      onSiteRegistration: false,
      secureUrl: 'https://example.com/asjkd12234'
    };

    qrCodeMock.path.and.returnValue('some qr code path');
  });

  afterAll(() => {
    mockery.deregisterAll();
    mockery.disable();
  });


  describe('createStartNumberPage', () => {
    it('should add the barcode two times for easier scanning', () => {
      let numberOfOtherImageCalls = 2;

      pdfGeneration.createStartNumberPage(documentMock, startNumberData);
      expect(documentMock.image).toHaveBeenCalledTimes(3 + numberOfOtherImageCalls);
    });

    it('should add the background image and the logos', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);
      expect(documentMock.image.calls.argsFor(0)[0]).toMatch(/pdf\/images\/background_light\.jpg/);
    });

    it('should add start number', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.text.calls.argsFor(0)).toEqual(['1234', 0, 130, {align: 'center'}]);
    });

    it('should add the team name if it exits', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);
      expect(documentMock.text.calls.argsFor(1)).toEqual(['Unicorns', 0, 300, {align: 'center'}]);
    });

    it('should add the QR code to the self-service link', () => {
      startNumberData.onSiteRegistration = true;
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.fill).toHaveBeenCalledWith('black', 'even-odd');
    });
  });

});
