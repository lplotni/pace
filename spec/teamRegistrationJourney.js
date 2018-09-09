/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, afterAll, xit, it, expect */
'use strict';

const helper = require('./journeyHelper');
const config = require('config');
const registration = require('../service/registration');
const couponcodes = require('../service/couponcodes');

describe('registration journey', () => {

  let client, originalRegistrationStatus;

  beforeAll((done) => {
    registration.isClosed().then(isClosed => {
      originalRegistrationStatus = isClosed;
      if(isClosed) {
        registration.reopen().then( () => {
          done();
        });
      } else {
        done();
      }
    });
  });

  beforeEach((done) => {
    helper.changeOriginalTimeout();
    client = helper.setUpClient(done);
  });

  afterEach(() => {
    helper.resetToOriginalTimeout();
  });

  afterAll((done) => {
    if (originalRegistrationStatus) {
      registration.close().then( () => {
        done();
      });
    } else {
      done();
    }
  });

  xit('shows the team registration page', (done) => {
    client.url(helper.paceUrl)
      .click('a#teamsregistration')
      .isVisible('form#teamRegistrationForm')
      .setValue('input#team', 'ein cooles Team Name')
      .selectByValue('select#category', 'mixed')
      // .click('button#submit')
      // .isVisible('div.thanks')
      // .then((isVisible) => {
      //   expect(isVisible).toBe(true);
      // })
      .end(done);
  });
});
