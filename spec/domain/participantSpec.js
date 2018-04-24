'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, afterAll, beforeEach, fail */

describe('participant', () => {
  const _ = require('lodash');
  const participant = require('../../domain/participant.js');

  describe('from()', () => {
    const validBody = {
      firstname: 'Mark',
      lastname: 'Mueller',
      email: 'm.mueller@example.com',
      category: 'Unicorn',
      birthyear: '1980',
      team: 'Crazy runners',
      visibility: 'public',
      discount: 'yes',
      couponcode: '',
      shirt: 'Yes',
      model: 'Normal fit',
      size: 'M',
      goal: 'ambitious'
    };

    describe('valid body', () => {
      let parsedParticipant;

      beforeEach(() => {
        parsedParticipant = participant.from(validBody);
      });

      it('should extract firstname from the request body', () => {
        expect(parsedParticipant.firstname).toBe('Mark');
      });

      it('should extract lastname from the request body', () => {
        expect(parsedParticipant.lastname).toBe('Mueller');
      });

      it('should extract email from the request body', () => {
        expect(parsedParticipant.email).toBe('m.mueller@example.com');
      });

      it('should extract gender form the request body', () => {
        expect(parsedParticipant.category).toBe('Unicorn');
      });

      it('should extract team name form the request body', () => {
        expect(parsedParticipant.team).toBe('Crazy runners');
      });

      it('should extract birthyear form the request body', () => {
        expect(parsedParticipant.birthyear).toBe(1980);
      });

      it('should extract tshirt form the request body if shirt is ordered', () => {
        expect(parsedParticipant.tshirt.model).toBe('Normal fit');
        expect(parsedParticipant.tshirt.size).toBe('M');
      });

      it('should extract discount from the request body', () => {
        expect(parsedParticipant.discount).toBe('yes');
      });

      it('should extract goal from the request body', () => {
        expect(parsedParticipant.goal).toBe('ambitious');
      });

      it('should extract visibility from the request body', () => {
        expect(parsedParticipant.visibility).toBe('public');
      });
    });

    describe('valid partial body', () => {
      it('should not extract tshirt form the request body if shirt is not ordered', () => {
        expect(participant.from(_.omit(validBody, 'shirt')).tshirt).toEqual({});
      });

      it('should default birthyear to 0 if value missing', () => {
        expect(participant.from(_.set(_.cloneDeep(validBody), 'birthyear', '')).birthyear).toEqual(0);
      });

      it('should not throw an error if no discount can be found, but use NO instead', () => {
        const bodyWithoutDiscout = _.omit(validBody, 'discount');
        expect(participant.from(bodyWithoutDiscout).discount).toBe('no');
      });
    });

    describe('invalid body', () => {
      const invalid_email_body = {
        firstname: 'Mark',
        lastname: 'Mueller',
        email: 'invalid',
        category: 'Unicorn',
        birthyear: '1980',
        team: 'Crazy runners',
        visibility: 'public',
        discount: 'no',
        couponcode: '',
        shirt: 'Yes',
        model: 'Normal fit',
        size: 'M'
      };

      it('should throw an error if email format is invalid', () => {
        function callWithInvalidEmail() {
          participant.from(invalid_email_body);
        }

        expect(callWithInvalidEmail).toThrow();
      });

      it('should throw an error if no category can be found', () => {
        function callWithNoCategory() {
          participant.from(_.omit(validBody, 'category'));
        }

        expect(callWithNoCategory).toThrow();
      });

      it('should throw an error if no visibility can be found', () => {
        function callWithNoVisibility() {
          participant.from(_.omit(validBody, 'visibility'));
        }

        expect(callWithNoVisibility).toThrow();
      });

      it('should throw an error if negative birthyear is given', () => {
        function callWithNegativeBirthyear() {
          participant.from(_.set(_.cloneDeep(validBody), 'birthyear', '-1990'));
        }

        expect(callWithNegativeBirthyear).toThrow();
      });

      it('should throw an error if whole date is given instead of year', () => {
        function callWithFullDate() {
          participant.from(_.set(_.cloneDeep(validBody), 'birthyear', '02-12-1990'));
        }

        expect(callWithFullDate).toThrow();
      });
    });
  });

  describe('with()', () => {

    const p = participant.from({
      firstname: 'Mark',
      lastname: 'Mueller',
      email: 'm.mueller@example.com',
      category: 'Unicorn',
      birthyear: '1980',
      team: 'Crazy runners',
      visibility: 'public',
      discount: 'yes',
      shirt: 'Yes',
      model: 'Normal fit',
      size: 'M'
    });

    it('adds the property to the participant', () => {
      const pWithNewProperty = p.with({paymentToken: 'token'}).with({otherProperty: 'x'});

      expect(pWithNewProperty.paymentToken).toBe('token');
      expect(pWithNewProperty.otherProperty).toBe('x');
      expect(pWithNewProperty.firstname).toBe('Mark');
      expect(pWithNewProperty.tshirt).toBe(p.tshirt);
    });
  });

  describe('anonymous registration', () => {

    const almost_empty_body = {
      category: 'Unicorn',
      visibility: 'public',
      email: '',
    };

    it('should handle almost empty body', () => {
      expect(participant.invalidData(almost_empty_body)).toBe(false);
    });
  });
});
