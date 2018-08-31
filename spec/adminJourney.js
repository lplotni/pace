/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, xit*/
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

  let loginAdmin = () => {
    return helper.setUpClient().url(loginUrl)
      .setValue('input#username', config.get('admin.username'))
      .setValue('input#password', config.get('admin.password'))
      .click('button#submit');
  };

  it('should go to admin page, show statistics and generate start number buttons (registered and on-site)', (done) => {
    loginAdmin().url(helper.paceUrl + 'admin')
      .isVisible('canvas#registrationsCtx')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('canvas#regularShirtsCtx')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('canvas#slimShirtsCtx')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('canvas#participantsCtx')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('button#generate-start-numbers')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('button#generate-on-site-participants')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('input#amountOnSite')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .isVisible('span#currentNumOfOnSite')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  it('should close and reopen the registration', (done) => {
    loginAdmin().url(helper.paceUrl + 'admin')
      .click('button#close-registration')
      .isVisible('p#registration-closed-message')
      .then((isVisible) => {
        expect(isVisible).toBe(true);
      })
      .click('button#reopen-registration')
      .isVisible('canvas#registrationsCtx')
      .then((isVisible) => {
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
      .then((isVisible) => {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  let givenAValidUserExists = () => {
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
  };

  it('should go to edit user when clicking edit button (admin is signed in)', (done) => {
    var firstName = 'not set yet';
    var lastName = 'not set yet';

    givenAValidUserExists().then(() => {
      loginAdmin().url(helper.paceUrl + 'admin/participants')
        .getText('.first-name')
        .then((firstNames) => {
          firstName = _.isArray(firstNames) ? firstNames[0] : firstNames;
        })
        .getText('.last-name')
        .then((lastNames) => {
          lastName = _.isArray(lastNames) ? lastNames[0] : lastNames;
        })
        .click('a.edit-button')
        .isVisible('#firstname')
        .then(isVisible => {
          expect(isVisible).toBe(true);
        })
        .getValue('#firstname')
        .then((value) => {
          expect(value).toBe(firstName);
        })
        .getValue('#lastname')
        .then((value) => {
          expect(value).toBe(lastName);
        })
        .end(done);
    });
  });

  it('should redirect to login page when an unauthenticated user requests admin edit page', (done) => {
    givenAValidUserExists().then(() => {
      helper.setUpClient().url(helper.paceUrl + 'admin/editparticipant/secureIdForTheEditLink')
        .isVisible('form#loginForm')
        .then(function (isVisible) {
          expect(isVisible).toBe(true);
        })
        .end(done);
    });
  });

  xit('should be able to define the color, name and start time of a block', (done) => {
    loginAdmin().url(helper.paceUrl + 'admin/after')
      .setValue('input#color0', '#cafe00')
      .setValue('input#name0', 'Startblock Rot')
      .setValue('input#hours0', '10')
      .setValue('input#minutes0', '15')
      .setValue('input#seconds0', '10')
      .click('button#set_race_starttime')
      .isVisible('input#hours1')
      .then(isVisible => {
          expect(isVisible).toBe(true);
        })
      .getValue('input#color1')
      .then((value) => {
        expect(value).toBe('#cafe00');
      })
      .getValue('input#name1')
      .then((value) => {
        expect(value).toBe('Startblock Rot');
      })
      .getValue('input#hours1')
      .then((value) => {
        expect(value).toBe('10');
      })
      .getValue('input#minutes1')
      .then((value) => {
        expect(value).toBe('15');
      })
      .getValue('input#seconds1')
      .then((value) => {
        expect(value).toBe('10');
      })
      .end(done);
  });


});
