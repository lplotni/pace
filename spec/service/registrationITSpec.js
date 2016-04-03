'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, beforeAll, afterAll, spyOn, it, expect, fail */

describe('registration', () => {

  const registration = require('../../service/registration');
  const helper = require('../journeyHelper');

  let originalRegistrationStatus;

  beforeAll((done) => {
    registration.isClosed().then(isClosed => {
      originalRegistrationStatus = isClosed;
      if (isClosed) {
        registration.reopen().then(() => {
          done();
        });
      } else {
        done();
      }
    });
  });

  afterAll((done) => {
    if (!originalRegistrationStatus) {
      registration.reopen().then(() => {
        helper.closeDbConnection(done);
      });
    } else {
      helper.closeDbConnection(done);
    }
  });

  it('should close the registration', (done) => {
    registration.close().then(() => {
      registration.isClosed().then((isClosed) => {
        expect(isClosed).toEqual(true);
        done();
      });
    });
  });
});
