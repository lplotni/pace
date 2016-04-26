/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, afterAll, it, expect */
'use strict';

const helper = require('./journeyHelper');
const config = require('config');
const crypto = require('crypto');
const registration = require('../service/registration');
const participant = require('../domain/participant');
const _ = require('lodash');

describe('admin/couponcodes page', () => {

  let loginUrl = helper.paceUrl + 'login';
  let originalRegistrationStatus;

  beforeAll((done) => {
    registration.isClosed().then(isClosed => {
      originalRegistrationStatus = isClosed;
      done();
    });
  });

  beforeEach((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterEach((done) => {
    helper.resetToOriginalTimeout();
    helper.closeDbConnection(done);
  });

  afterAll((done) => {
    if (originalRegistrationStatus) {
      registration.close().then(() => {
        done();
      });
    } else {
      registration.reopen().then(() => {
        done();
      });
    }
  });

  function loginAdmin() {
    return helper.setUpClient().url(loginUrl)
      .setValue('input#username', config.get('admin.username'))
      .setValue('input#password', config.get('admin.password'))
      .click('button#submit');
  }

  it('should go to admin page, and then to generate code page', (done) => {
    loginAdmin().url(helper.paceUrl + 'admin')
      .isVisible('button#goto-couponcodes')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .click('button#goto-couponcodes')
      .isVisible('button#generate-code')
      .then(isVisible => {
        expect(isVisible).toBe(true);
      })
       .isVisible('td.code')
      .then(isVisible => {
        expect(isVisible).toBe(false);
      })
      .click('button#generate-code')
      .isVisible('td.code')
      .then(isVisible => {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });
});

