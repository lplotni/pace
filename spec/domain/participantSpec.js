'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, afterAll, beforeEach, fail */

describe('participant', () => {

  const _ = require('lodash');
  const participant = require('../../domain/participant.js');
  let body;

  beforeEach(function () {
      body = {
        firstname: 'Mark',
        lastname: 'Mueller',
        email: 'm.mueller@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        team: 'Crazy runners',
        visibility: 'public',
        discount: 'yes',
        couponcode: '',
        shirt: 'Yes',
        model: 'Normal fit',
        size: 'M'
      };
    }
  );

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
      couponcode: '',
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


    it('should throw an error if discount is free but coupon code is wrong', function () {
      body.couponcode = 'invalid';
      body.discount = 'free';

      function callWithWrongCouponCode() {
        participant.from(body);
      }

      expect(callWithWrongCouponCode).toThrow();
    });

    it('should extract discount from the request body', () => {
      expect(participant.from(body).discount).toBe('yes');
    });

    it('should not throw an error if no discount can be found, but use NO instead', function () {
      var bodyWithoutDiscout = _.omit(body, 'discount');
      expect(participant.from(bodyWithoutDiscout).discount).toBe('no');
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
