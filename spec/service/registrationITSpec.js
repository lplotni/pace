'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, beforeAll, afterAll, spyOn, it, expect, fail */

describe('registration', () => {

  const registration = require('../../service/registration');

  let originalRegistrationStatus;

  beforeAll((done) => {
    registration.isClosed().then(isClosed => {
      originalRegistrationStatus = isClosed;
      if(isClosed  === 'true') {
        registration.reopen().then( () => {
          done();
        });
      } else {
        done();
      }
    });
  });

  afterAll((done) => {
    if (originalRegistrationStatus === 'false') {
      registration.reopen().then( () => {
          done();
        });
    }
  });

  it('should close the registration', (done) => {
    registration.close().then( () => {
      registration.isClosed().then( (isClosed) => {
        expect(isClosed).toEqual('true');
        done();
      });
    });
  });
});
