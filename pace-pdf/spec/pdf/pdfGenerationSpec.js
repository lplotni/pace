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
    it('should add the barcode three times for easier scanning', () => {
      let numberOfOtherImageCalls = 3;

      pdfGeneration.createStartNumberPage(documentMock, startNumberData);
      expect(documentMock.image).toHaveBeenCalledTimes(4 + numberOfOtherImageCalls);
    });

    it('should add the background image and the logos', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.image.calls.argsFor(0)[0]).toMatch(/pdf\/images\/background_light\.jpg/);
      expect(documentMock.image.calls.argsFor(1)[0]).toMatch(/pdf\/images\/lauf_gegen_rechts_logo\.jpg/);
      expect(documentMock.image.calls.argsFor(2)[0]).toMatch(/pdf\/images\/fc_st_pauli_marathon_logo\.png/);
    });

    it('should add tshirt details', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.text.calls.argsFor(4)).toEqual(['S unisex', 500, 315]);
    });

    it('should add a checkmark symbol only if the participant has payed', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.stroke).toHaveBeenCalledTimes(1);
    });

    it('should add start number and name', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.text.calls.argsFor(0)).toEqual(['1234', 0, 130, {align: 'center'}]);
      expect(documentMock.text.calls.argsFor(1)).toEqual(['Digital', 0, 300, {align: 'center'}]);
    });

    it('should add the team name if it exits', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.text.calls.argsFor(2)).toEqual(['Unicorns', 0, 350, {align: 'center'}]);
    });

    it('should add the startblock', () => {
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.text.calls.argsFor(3)).toEqual(['Startblock: 1', 200, 20, {align: 'left'}]);
    });

    it('should add the QR code to the self-service link', () => {
      startNumberData.onSiteRegistration = true;
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.fill).toHaveBeenCalledWith('black', 'even-odd');
    });

    it('should not add the payment checkmark if not payed', () => {
      startNumberData.hasPayed = false;
      pdfGeneration.createStartNumberPage(documentMock, startNumberData);

      expect(documentMock.stroke).not.toHaveBeenCalled();
    });
  });

});
