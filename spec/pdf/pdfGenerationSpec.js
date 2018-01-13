'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, xit, expect, beforeEach, afterAll, spyOn */

const mockery = require('mockery');
const Q = require('q');
const _ = require('lodash');
const config = require('config');

describe('pdfGeneration', () => {

  let pdfGeneration, res, participantsMock, documentMock, tshirtsMock, startblocksMock, qrCodeMock, raceMock;
  let confirmedParticipant, unconfirmedParticipant,blancParticipant;

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

    participantsMock = {
      get: {
        byId: jasmine.createSpy('byId'),
        byStartnumber: jasmine.createSpy('byStartnumber'),
        all: jasmine.createSpy('all')
      },
      distributeIntoStartblocks: jasmine.createSpy('distributeIntoStartBlocks'),
      assign: jasmine.createSpy('assign'),
      saveBlanc: jasmine.createSpy('saveBlanc'),
      getTime: jasmine.createSpy('getTime'),
      rank: jasmine.createSpy('rank'),
      rankByCategory: jasmine.createSpy('rankByCategory')
    };

    startblocksMock = {
      all: jasmine.createSpy('all')
    };

    tshirtsMock = {
      findAndAddTo: (p) => {
        return Q.fcall(() => p);
      }
    };

    qrCodeMock = {
      svgObject: () => {
        return qrCodeMock;
      },
      path: jasmine.createSpy('path')
    };

    raceMock = {
      startTime: jasmine.createSpy('startTime')
    };

    mockery.registerMock('../service/participants', participantsMock);
    mockery.registerMock('../service/tshirts', tshirtsMock);
    mockery.registerMock('../service/race', raceMock);
    mockery.registerMock('../service/startblocks', startblocksMock);
    mockery.registerMock('qr-image', qrCodeMock);
    pdfGeneration = require('../../pdf/pdfGeneration');

    confirmedParticipant = {
      secureid: 'adasdj12',
      firstname: 'Bestaetigte',
      lastname: 'Person',
      team: 'My Team',
      seconds: '1922',
      start_number: 1,
      start_block: 0,
      tshirt: {
        size: 'S',
        model: 'Unisex'
      },
      is_on_site_registration: false,
      has_payed: true
    };
    unconfirmedParticipant = {
      firstname: 'Unbestaetigte',
      lastname: 'Person',
      team: 'a team name',
      seconds: '1823',
      start_number: 2,
      start_block: 1,
      start_block_color: '#123456',
    };
    blancParticipant = {
      firstname: '',
      lastname: '',
      team: '',
      start_number: 4,
      start_block: 0
    };

    participantsMock.get.all.and.returnValue(Q.fcall(() => [confirmedParticipant, unconfirmedParticipant,blancParticipant]));

    participantsMock.get.byStartnumber.and.returnValue(Q.fcall(() => confirmedParticipant));
    participantsMock.distributeIntoStartblocks.and.returnValue([1,2]);
    participantsMock.assign.and.returnValue(Q.fcall(() => [1]));
    participantsMock.getTime.and.returnValue(Q.fcall(() => 10000));
    participantsMock.rank.and.returnValue(Q.fcall(() => 1));
    participantsMock.rankByCategory.and.returnValue(Q.fcall(() => 1));

    startblocksMock.all.and.returnValue(Q.fcall(() => [{}, {}]));

    qrCodeMock.path.and.returnValue('some qr code path');
    raceMock.startTime.and.returnValue(Q.fcall(() => 101));
  });

  afterAll(() => {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('extractData', () => {

    it('should get start number and name', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.startNumber).toEqual('1');
      expect(data.firstname).toEqual('Bestaetigte');
    });

    it('should get team', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.team).toEqual('My Team');
    });

    it('should get startBlock', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));
      expect(data.startBlock).toEqual('1');
    });

    xit('should get startBlockColor', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));
      expect(data.startBlockColor).toEqual('#123456');
    });

    it('should get tshirt details', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.tshirt.size).toEqual('S');
      expect(data.tshirt.model).toEqual('Unisex');
    });

    it('should get the payment inforamtion', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.hasPayed).toEqual(true);
    });

    it('should get the onSiteRegistration info', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.onSiteRegistration).toEqual(false);
    });

    it('should get the secureUrl link', () => {
      let data = JSON.parse(pdfGeneration.extractData(confirmedParticipant));

      expect(data.secureUrl).toEqual('http://localhost:3000/editparticipant/adasdj12');
    });
  });

  describe('generateStartNumbers', () => {

    it('should request a start number for every participant', (done) => {
      let redis = {
        publish: jasmine.createSpy('publish')
      };

      pdfGeneration.generateStartNumbers(redis).then(() => {
        expect(redis.publish.calls.count()).toEqual(3);
        expect(redis.publish.calls.argsFor(0)).toEqual(['pace-pdf', pdfGeneration.extractData(confirmedParticipant)]);
        expect(redis.publish.calls.argsFor(1)).toEqual(['pace-pdf', pdfGeneration.extractData(unconfirmedParticipant)]);
        expect(redis.publish.calls.argsFor(2)).toEqual(['pace-pdf', pdfGeneration.extractData(blancParticipant)]);
        done();
      });
    });

  });

  describe('generateCertificate', () => {
    it('should generate one certificate', (done) => {
      pdfGeneration.generateCertificateDownload(res, documentMock, '1').then(() => {
        expect(documentMock.text).toHaveBeenCalledWith('Bestaetigte Person', 0, 365, {align: 'center'});
        expect(documentMock.text).toHaveBeenCalledWith('00:32:02', 0, 487, {align: 'center'});
        done();
      });
    });
  });

});
