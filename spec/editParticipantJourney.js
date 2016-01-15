/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, it, expect */
'use strict';

let helper = require('./journeyHelper');
let pg = require('pg');
let participants = require('../service/participants');
let editUrlGenerator = require('../domain/editUrlGenerator');

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
    let aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'no'
    };
    let aToken = '23eF67i';

    participants.save(aParticipant, aToken)
      .then(function (id) {
        let editUrl = editUrlGenerator.generateEncryptedUrl(id.toString());
        helper.setUpClient()
          .url(editParticipantUrl + '/?edit=' + editUrl)
          .isVisible('form#editParticipantForm')
          .then(function (isVisible) {
            expect(isVisible).toBe(true);
          })
          .getValue('input#firstname')
          .then(function (value) {
            expect(value).toBe('Friedrich');
          })
          .getValue('input#lastname')
          .then(function (value) {
            expect(value).toBe('Schiller');
          })
          .getValue('input#email')
          .then(function (value) {
            expect(value).toBe('f.schiller@example.com');
          })
          .getValue('select#visibility')
          .then(function (value) {
            expect(value).toBe('no');
          }).getValue('select#category')
          .then(function (value) {
            expect(value).toBe('f');
          })
          .getValue('input#birthyear')
          .then(function (value) {
            expect(value).toBe('1980');
          })
          .getValue('input#team')
          .then(function (value) {
            expect(value).toBe('Crazy runners');
          })
          .getText('p#paymentStatus')
          .then(function (value) {
              expect(value).toBe('Zahlung noch nicht eingegangen');
          })
          .end(done);
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
