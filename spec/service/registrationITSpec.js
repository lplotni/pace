'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('registration', () => {

  const registration = require('../../service/registration');

  let originalRegistrationStatus;

  beforeAll((done) => {
    registration.isClosed().then(isClosed => {
      originalRegistrationStatus = isClosed;
      if(isClosed === 'yes') {
        registration.reopen().then( () => {
          done();
        });
      } else {
        done();
      }
    });
  });

  afterAll((done) => {
    if (originalRegistrationStatus === 'no') {
      registration.reopen().then( () => {
          done();
        });
    }
  });

  it('should close the registration', (done) => {
    registration.close().then( () => {
      registration.isClosed().then( (isClosed) => {
        expect(isClosed).toEqual('yes');
        done();
      });
    });
  });
});
