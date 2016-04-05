/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, afterAll, spyOn, it, expect, fail, jasmine */
'use strict';
const mockery = require('mockery');
const Q = require('q');
const participant = require('../../domain/participant');

describe('registration service', () => {

  describe('start()', () => {
    let registration, participantsMock, editUrlHelperMock, startNumbersMock, jadeMock, configMock;
    const secureId = 'secureId';

    beforeAll(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      mockery.resetCache();

      editUrlHelperMock = {
        generateSecureID: jasmine.createSpy(),
        generateUrl: jasmine.createSpy()
      };

      startNumbersMock = {
        next: jasmine.createSpy()
      };

      jadeMock = {
        renderFile: jasmine.createSpy()
      };

      configMock = {
        get: jasmine.createSpy()
      };

      participantsMock = {
        createUniqueToken: jasmine.createSpy(),
        save: jasmine.createSpy()
      };

      mockery.registerMock('../service/startNumbers', startNumbersMock);
      mockery.registerMock('../service/participants', participantsMock);
      mockery.registerMock('../domain/editUrlHelper', editUrlHelperMock);
      mockery.registerMock('jade', jadeMock);
      mockery.registerMock('config', configMock);

      mockery.registerAllowables(['q', '../../service/editUrlHelper', '../../service/participants', '../../service/startNumbers', 'jade', 'config']);
      registration = require('../../service/registration');
      editUrlHelperMock.generateSecureID.and.returnValue(secureId);
      participantsMock.createUniqueToken.and.returnValue(Q.fcall(() => 'uniqueToken'));
      participantsMock.save.and.returnValue(Q.fcall(() => 10));
      startNumbersMock.next.and.returnValue(Q.fcall(() => 1));
    });

    afterAll(() => {
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
        .fail(fail);
    });

    it('passes the newly generated start_number in the DB', (done) => {
      registration.start(aParticipant)
        .then(function (result) {
          expect(result.startnr).toBe(1);
          done();
        })
        .fail(fail);
    });
  });

});
