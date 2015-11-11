'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, it, expect */
describe('participant', function () {

  var participant = require('../../domain/participant.js');

  const body = {
    firstname: 'Mark',
    lastname: 'Mueller',
    email: 'm.mueller@example.com',
    gender: 'Unicorn',
    birthyear: 1980,
    team: 'Crazy runners'
  };

  it('should read firstname from the request body', function () {
    expect(participant.from(body).firstname).toBe('Mark');
  });

  it('should throw an error if no firstname can be found', function () {
    function callWithNoFirstname() {
      participant.from({lastname: 'XX', email: 'test@example.com', gender: 'male', birthyear: 2000});
    }

    expect(callWithNoFirstname).toThrow();
  });

  it('should throw an error if no lastname can be found', function () {
    function callWithNoLastname() {
      participant.from({firstName: 'XX', email: 'test@example.com', gender: 'male', birthyear: 2000});
    }

    expect(callWithNoLastname).toThrow();
  });

  it('should read lastname from the request body', function () {
    expect(participant.from(body).lastname).toBe('Mueller');
  });

  it('should throw an error if no email can be found', function () {
    function callWithNoEmail() {
      participant.from({firstName: 'XX', lastName: 'YY', gender: 'male', birthyear: 2000});
    }

    expect(callWithNoEmail).toThrow();
  });

  it('should read email from the request body', function () {
    expect(participant.from(body).email).toBe('m.mueller@example.com');
  });

  it('should throw an error if no gender can be found', function () {
    function callWithNoGender() {
      participant.from({firstName: 'XX', lastName: 'YY', email: 'test@example.com', birthyear: 2000});
    }

    expect(callWithNoGender).toThrow();
  });

  it('should read gender form the request body', function () {
    expect(participant.from(body).gender).toBe('Unicorn');
  });

  it('should read team name form the request body', function () {
    expect(participant.from(body).team).toBe('Crazy runners');
  });

  it('should throw an error if no birthyear can be found', function () {
    function callWithNoBirthyear() {
      participant.from({firstName: 'XX', lastName: 'YY', email: 'test@example.com', gender: 'male'});
    }

    expect(callWithNoBirthyear).toThrow();
  });

  it('should read birthyear form the request body', function () {
    expect(participant.from(body).birthyear).toBe(1980);
  });
});