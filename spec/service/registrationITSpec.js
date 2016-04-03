'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, beforeAll, afterAll, spyOn, xit, expect, fail */

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

  //TODO as soon as we can use postgres 9.5 on snap -> re-enable
  xit('should close the registration', (done) => {
    registration.close()
      .then(() => {
        registration.isClosed()
          .then((isClosed) => {
            expect(isClosed).toEqual(true);
            done();
          })
          .fail(fail);
      })
      .fail(fail);
  });
});
