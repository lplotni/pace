/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, it, expect */
'use strict';

let helper = require('./journeyHelper');
let pg = require('pg');
let participants = require('../service/participants');
let specHelper = require('./specHelper');
let ParticipantBuilder = specHelper.ParticipantBuilder;

describe('edit participant journey', () => {

  let editParticipantUrl = helper.paceUrl + 'editparticipant';

  beforeEach((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterEach(() => {
    helper.resetToOriginalTimeout();
    pg.end();
  });

  it('allows to edit a participant', (done) => {
    let aParticipant = ParticipantBuilder().initDefault().build()
    let aToken = '23eF67i';

    participants.save(aParticipant, aToken)
      .then(function (id) {

        participants.getFullInfoById(id)
          .then(p => {
            let secureid = p.secureid;

            helper.setUpClient()
              .url(editParticipantUrl + '/?edit=' + secureid)
              .isVisible('form#editParticipantForm')
              .then(function (isVisible) {
                expect(isVisible).toBe(true);
              })
              .getValue('input#firstname')
              .then(function (value) {
                expect(value).toBe(aParticipant.firstname);
              })
              .getValue('input#lastname')
              .then(function (value) {
                expect(value).toBe(aParticipant.lastname);
              })
              .getValue('input#email')
              .then(function (value) {
                expect(value).toBe(aParticipant.email);
              })
              .getValue('select#visibility')
              .then(function (value) {
                expect(value).toBe(aParticipant.visibility);
              }).getValue('select#category')
              .then(function (value) {
                expect(value).toBe(aParticipant.category);
              })
              .getValue('input#birthyear')
              .then(function (value) {
                expect(parseInt(value)).toBe(aParticipant.birthyear);
              })
              .getValue('input#team')
              .then(function (value) {
                expect(value).toBe(aParticipant.team);
              })
              .getText('p#paymentStatus')
              .then(function (value) {
                  expect(value).toBe('Zahlung noch nicht eingegangen');
              }).click("#submit")
              .isVisible('.thanks')
              .then(function (isVisible) {
                expect(isVisible).toBe(true);
              })
              .end(done);
          });
      });
  });

  it('shows an error page when using an invalid edit link', (done) => {
    helper.setUpClient()
      .url(editParticipantUrl + '/?edit=invalidId')
      .getText('h1')
      .then(function (text) {
        expect(text).toBe('Teilnehmer nicht bekannt');
      })
      .getText('h2')
      .then(function (text) {
        expect(text).toBe('Möglicherweise wurde ein falscher Link verwendet');
      })
      .end(done);
  });
});
