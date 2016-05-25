/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, afterAll, spyOn, it, expect, fail, jasmine */
'use strict';
const mockery = require('mockery');
const Q = require('q');
const participant = require('../../domain/participant');

describe('registration service', () => {

  describe('start()', () => {
    let registration, participantsMock, editUrlHelperMock, startNumbersMock, pugMock, configMock;
    const secureId = 'secureId';

    beforeAll(() => {
      mockery.enable({useCleanCache: true, warnOnReplace: false, warnOnUnregistered: false});

      mockery.resetCache();

      editUrlHelperMock = {
        generateSecureID: jasmine.createSpy(),
        generateUrl: jasmine.createSpy()
      };

      startNumbersMock = {
        next: jasmine.createSpy()
      };

      pugMock = {
        renderFile: jasmine.createSpy()
      };

      configMock = {
        get: jasmine.createSpy()
      };

      participantsMock = {
        createUnique: jasmine.createSpy(),
        save: jasmine.createSpy()
      };

      mockery.registerMock('../service/startNumbers', startNumbersMock);
      mockery.registerMock('../service/participants', participantsMock);
      mockery.registerMock('../domain/editUrlHelper', editUrlHelperMock);
      mockery.registerMock('pug', pugMock);
      mockery.registerMock('config', configMock);


      let dbMock = {
        save: jasmine.createSpy(),
        insert: jasmine.createSpy()
      };

      let tokensMock = {
        createUnique: jasmine.createSpy()
      };

      let mailsMock = {
        sendEmail: jasmine.createSpy(),
        sendStatusEmail: jasmine.createSpy()
      };

      mockery.registerMock('../service/util/dbHelper', dbMock);
      mockery.registerMock('..../service/util/mails', mailsMock);
      mockery.registerMock('../service/tokens', tokensMock);

      mockery.registerAllowables(['q', 'lodash', '../domain/costCalculator', '../../service/registration']);

      registration = require('../../service/registration');

      editUrlHelperMock.generateSecureID.and.returnValue(secureId);
      tokensMock.createUnique.and.returnValue(Q.fcall(() => 'uniqueToken'));
      participantsMock.save.and.returnValue(Q.fcall(() => 10));
      startNumbersMock.next.and.returnValue(Q.fcall(() => 1));
    });

    afterAll(() => {
      mockery.deregisterAll();
      mockery.disable();
    });


    const aParticipant = participant.from({
      firstname: 'Hertha',
      lastname: 'Mustermann',
      email: 'h.mustermann@example.com',
      category: 'Unicorn',
      birthyear: 1980,
      visibility: 'yes',
      team: 'Crazy runners'
    });

    it('passes the newly generated secureId in the DB', (done) => {
      registration.start(aParticipant)
        .then(function (result) {
          expect(result.secureid).toBe(secureId);
          done();
        })
        .catch(done.fail);
    });

    it('passes the newly generated start_number in the DB', (done) => {
      registration.start(aParticipant)
        .then(function (result) {
          expect(result.startnr).toBe(1);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('choseStartBlock', () => {
    let registration = require('../../service/registration');

    it('returns 1 for nr < 1001', () => {
      expect(registration.choseStartBlock(1)).toBe(1);
      expect(registration.choseStartBlock(1000)).toBe(1);
    });

    it('returns 2 for nr > 1000', () => {
      expect(registration.choseStartBlock(1001)).toBe(2);
      expect(registration.choseStartBlock(10000)).toBe(2);
    });
  });

});
