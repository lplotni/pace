'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, afterAll, beforeEach */

const mockery = require('mockery');
const Q = require('q');

describe('participant', () => {

  const _ = require('lodash');
  const participant = require('../../domain/participant.js');
  const body = {
    firstname: 'Mark',
    lastname: 'Mueller',
    email: 'm.mueller@example.com',
    category: 'Unicorn',
    birthyear: 1980,
    team: 'Crazy runners',
    visibility: 'public',
    discount: 'yes',
    shirt: 'Yes',
    model: 'Normal fit',
    size: 'M'
  };

  describe('from()', () => {
    const invalid_email_body = {
      firstname: 'Mark',
      lastname: 'Mueller',
      email: 'invalid',
      category: 'Unicorn',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'public',
      discount: 'no',
      shirt: 'Yes',
      model: 'Normal fit',
      size: 'M'
    };

    it('should extract firstname from the request body', () => {
      expect(participant.from(body).firstname).toBe('Mark');
    });

    it('should throw an error if no firstname can be found', () => {
      function callWithNoFirstname() {
        participant.from(_.omit(body, 'firstname'));
      }

      expect(callWithNoFirstname).toThrow();
    });

    it('should throw an error if no lastname can be found', () => {
      function callWithNoLastname() {
        participant.from(_.omit(body, 'lastname'));
      }

      expect(callWithNoLastname).toThrow();
    });

    it('should extract lastname from the request body', () => {
      expect(participant.from(body).lastname).toBe('Mueller');
    });

    it('should throw an error if no email can be found', () => {
      function callWithNoEmail() {
        participant.from(_.omit(body, 'email'));
      }

      expect(callWithNoEmail).toThrow();
    });

    it('should throw an error if email format is invalid', () => {
      function callWithInvalidEmail() {
        participant.from(invalid_email_body);
      }

      expect(callWithInvalidEmail).toThrow();
    });

    it('should extract email from the request body', () => {
      expect(participant.from(body).email).toBe('m.mueller@example.com');
    });

    it('should throw an error if no category can be found', () => {
      function callWithNoCategory() {
        participant.from(_.omit(body, 'category'));
      }

      expect(callWithNoCategory).toThrow();
    });

    it('should extract gender form the request body', () => {
      expect(participant.from(body).category).toBe('Unicorn');
    });

    it('should extract team name form the request body', () => {
      expect(participant.from(body).team).toBe('Crazy runners');
    });

    it('should throw an error if no birthyear can be found', () => {
      function callWithNoBirthyear() {
        participant.from(_.omit(body, 'birthyear'));
      }

      expect(callWithNoBirthyear).toThrow();
    });

    it('should extract birthyear form the request body', () => {
      expect(participant.from(body).birthyear).toBe(1980);
    });

    it('should extract tshirt form the request body if shirt is ordered', () => {
      expect(participant.from(body).tshirt.model).toBe('Normal fit');
      expect(participant.from(body).tshirt.size).toBe('M');
    });

    it('should not extract tshirt form the request body if shirt is not ordered', () => {
      expect(participant.from(_.omit(body, 'shirt')).tshirt).toEqual({});
    });

    it('should extract visibility from the request body', () => {
      expect(participant.from(body).visibility).toBe('public');
    });

    it('should throw an error if no visibility can be found', function () {
      function callWithNoVisibility() {
        participant.from(_.omit(body, 'visibility'));
      }

      expect(callWithNoVisibility).toThrow();
    });

    it('should extract discount from the request body', () => {
      expect(participant.from(body).discount).toBe('yes');
    });

    it('should not throw an error if no discount can be found, but use NO instead', function () {
      var bodyWithoutDiscout = _.omit(body, 'discount');
      expect(participant.from(bodyWithoutDiscout).discount).toBe('no');
    });
  });

  describe('addTshirtDetailsTo()', () => {

    let participant, participantsMock;

    let returnPromiseAndResolveWith = function (data) {
      function successResolve() {
        return Q.fcall(function () {
          return data;
        });
      }

      return successResolve;
    };

    let setupMocks = function () {

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

    beforeEach(() => {
      setupMocks();
    });

    afterAll(() => {
      mockery.deregisterAll();
      mockery.disable();
    });

    let anySize = 'M';
    let anyModel = 'normal';
    let tshirtDetails = {id: 0, size: anySize, model: anyModel, participantId: 0};
    let anyParticipant = {};

    it('should not add tshirt details if the participant did not order a tshirt', function (done) {
      let anyParticipant = {};
      participantsMock.getTShirtFor.and.callFake(returnPromiseAndResolveWith([]));

      participant.addTshirtDetailsTo(anyParticipant).then(() => {
        expect(anyParticipant.tshirt).toBeUndefined();
        done();
      });
    });

    it('should add the tshirt details to a participant', function (done) {
      participantsMock.getTShirtFor.and.callFake(returnPromiseAndResolveWith([tshirtDetails]));

      participant.addTshirtDetailsTo(anyParticipant).then(() => {
        expect(anyParticipant.tshirt.amount).toBe(1);
        expect(anyParticipant.tshirt.details).toEqual([{size: anySize, model: anyModel}]);
        done();
      });
    });

    it('should add multiple tshirt details to a participant', function (done) {
      participantsMock.getTShirtFor.and.callFake(returnPromiseAndResolveWith([tshirtDetails, tshirtDetails]));

      participant.addTshirtDetailsTo(anyParticipant).then(() => {
        expect(anyParticipant.tshirt.amount).toBe(2);
        expect(anyParticipant.tshirt.details).toEqual([{size: anySize, model: anyModel},
          {size: anySize, model: anyModel}]);
        done();
      });
    });
  });

  describe('with()', () => {

    const p = participant.from({
      firstname: 'Mark',
      lastname: 'Mueller',
      email: 'm.mueller@example.com',
      category: 'Unicorn',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'public',
      discount: 'yes',
      shirt: 'Yes',
      model: 'Normal fit',
      size: 'M'
    });

    it('adds the property to the participant', () => {
      let pWithNewProperty = p.with({paymentToken: 'token'}).with({otherProperty: 'x'});

      expect(pWithNewProperty.paymentToken).toBe('token');
      expect(pWithNewProperty.otherProperty).toBe('x');
      expect(pWithNewProperty.firstname).toBe('Mark');
      expect(pWithNewProperty.tshirt).toBe(p.tshirt);
    });

  });
});
