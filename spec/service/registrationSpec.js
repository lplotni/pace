'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const mockery = require('mockery');
const Q = require('q');
const participant = require('../../domain/participant');


describe('registration service', () => {

  let registration, participantsMock, editUrlHelperMock, startNumbersMock, jadeMock, configMock;
  const secureId = 'secureId';

  beforeEach(() => {
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
  });

  describe('start()', () => {

    it('passes the newly generated secureId in the DB', (done) => {
      const aParticipant = participant.from({
        firstname: 'Hertha',
        lastname: 'Mustermann',
        email: 'h.mustermann@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        visibility: 'yes',
        team: 'Crazy runners'
      });

      editUrlHelperMock.generateSecureID.and.returnValue(secureId);
      startNumbersMock.next.and.returnValue(Q.fcall(() => [10]));
      participantsMock.createUniqueToken.and.returnValue(Q.fcall(() => 'uniqueToken'));
      participantsMock.save.and.returnValue(Q.fcall(() =>  10));

      registration.start(aParticipant).then(function () {
        const extendedParticipant = participantsMock.save.calls.mostRecent().args[0];
        expect(extendedParticipant.secureID).toBe(secureId);
        done();
      }).fail(fail);

    });

    it('passes the newly generated start_number in the DB', (done) => {
      const aParticipant = participant.from({
        firstname: 'Hertha',
        lastname: 'Mustermann',
        email: 'h.mustermann@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        visibility: 'yes',
        team: 'Crazy runners'
      });

      editUrlHelperMock.generateSecureID.and.returnValue(secureId);
      startNumbersMock.next.and.returnValue(Q.fcall(() => 10));
      participantsMock.createUniqueToken.and.returnValue(Q.fcall(() => 'uniqueToken'));
      participantsMock.save.and.returnValue(Q.fcall(() =>  10));

      registration.start(aParticipant).then(function () {
        const extendedParticipant = participantsMock.save.calls.mostRecent().args[0];
        expect(extendedParticipant.start_number).toBe(10);
        done();
      }).fail(fail);

    });
  });

  
});
