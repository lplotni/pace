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

let specHelper = require('./specHelper');
let ParticipantBuilder = specHelper.ParticipantBuilder;

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

  function givenAValidUserExists(participant) {
    let randomString = crypto.randomBytes(8).toString('hex');
    return participants.save(participant, randomString)
  }

  it('should go to edit user when clicking edit button (admin is signed in)', (done) => {
      var firstName = 'not set yet';
      var lastName = 'not set yet';

      let participant = ParticipantBuilder().initDefault().withFirstname('Foo').build();

      givenAValidUserExists(participant).then((id) => {
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
        .getValue('#shirt')
        .then(function (value) {
          expect(value).toBe('no')
        })
        .end(done);
      }).catch((e) => console.log(e))
    });

    it('should change participant\'s information after editing', (done) =>{
      let participant = ParticipantBuilder().initDefault()
                        .withFirstname('Bob')
                        .withTshirt('L', 'Normal fit').build();

      givenAValidUserExists(participant).then((id) => {
        loginAdmin().url(helper.paceUrl+'admin/participants')
        .click('a.edit-button')
        .setValue('#firstname', 'Bill')
        .click('//*[@id="size"]/option[3]')
        .click('.button-primary')
        .then(() => {
          participants.getFullInfoById(id)
          .then((participant) => {
            expect(participant.firstname).toBe('Bill')
            expect(participant.tshirt.details[0].size).toBe('M')
          })
        })
        .end(done);
      }).catch((e) => console.log(e))
    })

    it('should add tshirt to participant\'s after editing', (done) =>{
      let participant = ParticipantBuilder().initDefault()
                        .withFirstname('Bob').build();

      givenAValidUserExists(participant).then((id) => {
        loginAdmin().url(helper.paceUrl+'admin/participants')
        .click('a.edit-button')
        .setValue('#firstname', 'Bill')
        .click('//*[@id="shirt"]/option[1]')
        .click('//*[@id="size"]/option[3]')
        .click('.button-primary')
        .then(() => {
          participants.getFullInfoById(id)
          .then((participant) => {
            expect(participant.firstname).toBe('Bill')
            expect(participant.tshirt.details[0].size).toBe('M')
          })
        })
        .end(done);
      }).catch((e) => console.log(e))
    })


});
