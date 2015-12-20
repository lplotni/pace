'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, it, expect */
var mockery = require('mockery');
var Q = require('q');

describe('participant', function () {

  describe('from()', function () {
    var participant = require('../../domain/participant.js');

    const body = {
      firstname: 'Mark',
      lastname: 'Mueller',
      email: 'm.mueller@example.com',
      category: 'Unicorn',
      birthyear: 1980,
      team: 'Crazy runners',
      shirt: 'Yes',
      model: 'Normal fit',
      size: 'M'
    };

    it('should extract firstname from the request body', function () {
      expect(participant.from(body).firstname).toBe('Mark');
    });

    it('should throw an error if no firstname can be found', function () {
      function callWithNoFirstname() {
        participant.from({lastname: 'XX', email: 'test@example.com', category: 'male', birthyear: 2000});
      }

      expect(callWithNoFirstname).toThrow();
    });

    it('should throw an error if no lastname can be found', function () {
      function callWithNoLastname() {
        participant.from({firstName: 'XX', email: 'test@example.com', category: 'male', birthyear: 2000});
      }

      expect(callWithNoLastname).toThrow();
    });

    it('should extract lastname from the request body', function () {
      expect(participant.from(body).lastname).toBe('Mueller');
    });

    it('should throw an error if no email can be found', function () {
      function callWithNoEmail() {
        participant.from({firstName: 'XX', lastName: 'YY', category: 'male', birthyear: 2000});
      }

      expect(callWithNoEmail).toThrow();
    });

    it('should extract email from the request body', function () {
      expect(participant.from(body).email).toBe('m.mueller@example.com');
    });

    it('should throw an error if no gender can be found', function () {
      function callWithNoGender() {
        participant.from({firstName: 'XX', lastName: 'YY', email: 'test@example.com', birthyear: 2000});
      }

      expect(callWithNoGender).toThrow();
    });

    it('should extract gender form the request body', function () {
      expect(participant.from(body).category).toBe('Unicorn');
    });

    it('should extract team name form the request body', function () {
      expect(participant.from(body).team).toBe('Crazy runners');
    });

    it('should throw an error if no birthyear can be found', function () {
      function callWithNoBirthyear() {
        participant.from({firstName: 'XX', lastName: 'YY', email: 'test@example.com', category: 'male'});
      }

      expect(callWithNoBirthyear).toThrow();
    });

    it('should extract birthyear form the request body', function () {
      expect(participant.from(body).birthyear).toBe(1980);
    });

    it('should extract tshirt form the request body if shirt is ordered', function () {
      expect(participant.from(body).tshirt.model).toBe('Normal fit');
      expect(participant.from(body).tshirt.size).toBe('M');
    });

    it('should not extract tshirt form the request body if shirt is not ordered', function () {
      expect(participant.from({
        firstname: 'Mark',
        lastname: 'Mueller',
        email: 'm.mueller@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        team: 'Crazy runners'
      }).tshirt).toEqual({});
    });
  });

  describe('addTshirtDetailsTo', function () {

    var participant, participantsMock;

    var returnPromiseAndResolveWith = function(data) {
      function successResolve() {
        return Q.fcall(function() { return data;});
      }
      return successResolve;
    };

    var returnPromiseAndThrowError = function() {
      function errorResolve() {
        return Q.fcall(function() { throw new Error();});
      }
      return errorResolve;
    };

    var setupMocks = function() {

      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
      mockery.resetCache();
      mockery.registerAllowables(['q', '../../domain/participant.js']);

      participantsMock = {
        getTShirtFor: jasmine.createSpy()
      };

      mockery.registerMock('../service/participants', participantsMock);

      participant = require('../../domain/participant.js');
    };

    beforeEach(function () {
      setupMocks();
    });

    it('should set the amount to 0 if the participant did not order a tshirt', function (done) {
      var anyParticipant = {};
      participantsMock.getTShirtFor.and.callFake(returnPromiseAndThrowError());

      participant.addTshirtDetailsTo(anyParticipant).then(function () {
        expect(anyParticipant.tshirt.amount).toBe(0);
        done();
      });
    });

    it('should add the tshirt details to a participant', function (done) {
      var anySize = 'M';
      var anyModel = 'normal';
      var anyParticipant = {};
      participantsMock.getTShirtFor.and.callFake(returnPromiseAndResolveWith([{size: anySize, model: anyModel}]));

      participant.addTshirtDetailsTo(anyParticipant).then(function () {
        expect(anyParticipant.tshirt.amount).toBe(1);
        expect(anyParticipant.tshirt.size).toBe(anySize);
        expect(anyParticipant.tshirt.model).toBe(anyModel);
        done();
      });
    });
  });
});