'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const mockery = require('mockery');
const Q = require('q');
const editUrlHelper = require('../../domain/editUrlHelper');
const participant = require('../../domain/participant');

const secureId = 'secureId';


describe('participants service', () => {

    let participants, dbHelperMock, editUrlHelperMock, startNumbersMock, jadeMock, configMock;

    beforeEach(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      mockery.resetCache();

      dbHelperMock = {
        select: jasmine.createSpy(),
        insert: jasmine.createSpy()
      };

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

      mockery.registerMock('../service/util/dbHelper', dbHelperMock);
      mockery.registerMock('../service/startNumbers', startNumbersMock);
      mockery.registerMock('../domain/editUrlHelper', editUrlHelperMock);
      mockery.registerMock('jade', jadeMock);
      mockery.registerMock('config', configMock);

      mockery.registerAllowables(['q', '../../service/util/dbHelper.js', '../../service/editUrlHelper', '../../service/startNumbers', 'jade', 'config']);
      participants = require('../../service/participants');
      dbHelperMock.select.and.returnValue(Q.fcall(() => []));
      dbHelperMock.insert.and.returnValue(Q.fcall(() => 'some id'));
    });

    describe('createUniqueToken', () => {

      beforeEach(() => {
        dbHelperMock.select.and.returnValue(Q.fcall(() => []));
      });

      it('returns a string with 5 upper case characters', (done) => {
        dbHelperMock.select.and.returnValue(Q.fcall(() => []));

        participants.createUniqueToken()
          .then((uniqueToken) => {
            expect(uniqueToken.length).toBe(5);
            expect(uniqueToken).toBe(uniqueToken.toUpperCase());
            done();
          })
          .fail(fail);
      });

      it('checks if the token exists in the DB', (done) => {
        dbHelperMock.select.and.returnValue(Q.fcall(() => []));

        participants.createUniqueToken().then((uniqueToken) => {
          expect(dbHelperMock.select).toHaveBeenCalledWith('select * from participants where paymenttoken like $1', [uniqueToken]);
          done();
        }).fail(fail);
      });

      it('regenerates the token if already present in the DB', (done) => {
        let callCounter = 0;

        function fakeSelect() {
          if (callCounter === 0) {
            callCounter = callCounter + 1;
            return Q.fcall(() => ['someToken']);
          }
          return Q.fcall(() => []);
        }

        dbHelperMock.select.and.callFake(fakeSelect);

        participants.createUniqueToken().then((uniqueToken) => {
          expect(uniqueToken).toBeDefined();
          expect(dbHelperMock.select.calls.count()).toBe(2);
          done();
        });
      });
    });

    describe('register', () => {

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


        participants.register(aParticipant).then(function () {
          const params = dbHelperMock.insert.calls.mostRecent().args[1];
          expect(params[params.length - 2]).toBe(secureId);
          done();
        });

      });
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

      participants.register(aParticipant).then(function () {
        const params = dbHelperMock.insert.calls.mostRecent().args[1];
        expect(params[params.length - 1]).toBe(10);
        done();
      });

    });
  }
);
