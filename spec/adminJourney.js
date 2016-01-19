/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

let helper = require('./journeyHelper');
let config = require('config');
let crypto = require('crypto');
let pg = require('pg');
let participants = require('../service/participants');
let _ = require('lodash');

describe('admin page', () => {

  let client;
  let loginUrl = helper.paceUrl + 'login';

  beforeEach((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterEach(() => {
    helper.resetToOriginalTimeout();
    pg.end();
  });

  function loginAdmin() {
    return helper.setUpClient().url(loginUrl)
    .setValue('input#username', config.get('admin.username'))
    .setValue('input#password', config.get('admin.password'))
    .click('button#submit')
  }

  it('should go to admin page and show admin links', (done) => {
    loginAdmin().url(helper.paceUrl+'admin')
    .isVisible('a#paymentValidation')
    .then(function (isVisible) {
      expect(isVisible).toBe(true);
    })
    .end(done);
  });

  it('should redirect to login page if the user is not logged in', (done) => {
    helper.setUpClient().url(helper.paceUrl+'admin')
    .isVisible('form#loginForm')
    .then(function (isVisible) {
      expect(isVisible).toBe(true);
    })
    .end(done);
  });

  it('should redirect to the start page after logout', (done) => {
    helper.setUpClient().url(helper.paceUrl+'logout')
    .isVisible('h3*=Online-Anmeldung')
    .then(function (isVisible) {
      expect(isVisible).toBe(true);
    })
    .end(done);
  });

  function givenAValidUserExists() {
    let randomString = crypto.randomBytes(8).toString('hex');

    let aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: randomString + '@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'no'
    };

    return participants.save(aParticipant, randomString)
  }

  it('should go to edit user when clicking edit button (admin is signed in)', (done) => {
    var firstName = 'not set yet';
    var lastName = 'not set yet';

      givenAValidUserExists().then(() => {
        loginAdmin().url(helper.paceUrl+'admin/participants')
        .getText('.first-name')
        .then(function (firstNames) {
          firstName = _.isArray(firstNames) ? firstNames[0] : firstNames;
        })
        .getText('.last-name')
        .then(function (lastNames) {
          lastName = _.isArray(lastNames) ? lastNames[0] : lastNames;
        })
        .click('a.edit-button')
        .getValue('#firstname')
        .then(function (value) {
          expect(value).toBe(firstName);
        })
        .getValue('#lastname')
        .then(function (value) {
          expect(value).toBe(lastName);
        })
        .end(done);
      })
    });
});
