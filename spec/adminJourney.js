/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, afterAll, it, xit, expect */
'use strict';

const helper = require('./journeyHelper');
const config = require('config');
const crypto = require('crypto');
const participants = require('../service/participants');
const registration = require('../service/registration');
const participant = require('../domain/participant');
const _ = require('lodash');

describe('admin page', () => {

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

  afterAll((done) => { //TODO re-anable (together with the test) as soon as we have postgres 9.5 on snap
    // if (originalRegistrationStatus) {
    //   registration.close().then( () => {
    //     done();
    //   });
    // } else {
    //   registration.reopen().then( () => {
    //     done();
    //   });
    // }
  });

  function loginAdmin() {
    return helper.setUpClient().url(loginUrl)
      .setValue('input#username', config.get('admin.username'))
      .setValue('input#password', config.get('admin.password'))
      .click('button#submit');
  }

  it('should go to admin page, show statistics and generate start number button', (done) => {
    loginAdmin().url(helper.paceUrl + 'admin')
      .isVisible('h3#admin_tshirts_count')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('button#generate-start-numbers')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  xit('should close and reopen the registration', (done) => {
    loginAdmin().url(helper.paceUrl + 'admin')
      .click('button#close-registration')
      .isVisible('p#registration-closed-message')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .click('button#reopen-registration')
      .isVisible('h3#admin_tshirts_count')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  it('should redirect to login page if the user is not logged in', (done) => {
    helper.setUpClient().url(helper.paceUrl + 'admin')
      .isVisible('form#loginForm')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  it('should redirect to the start page after logout', (done) => {
    helper.setUpClient().url(helper.paceUrl + 'logout')
      .isVisible('h3*=Online-Anmeldung')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  function givenAValidUserExists() {
    let randomString = crypto.randomBytes(8).toString('hex');

    let aParticipant = participant.from({
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: randomString + '@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'no'
    }).withToken(randomString).withSecureId('secureIdForTheEditLink').withStartNr(10);

    return participants.save(aParticipant);
  }

  it('should go to edit user when clicking edit button (admin is signed in)', (done) => {
    var firstName = 'not set yet';
    var lastName = 'not set yet';

    givenAValidUserExists().then(() => {
      loginAdmin().url(helper.paceUrl + 'admin/participants')
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
    });
  });
});
