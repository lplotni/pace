/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterEach, it, expect */
'use strict';

const helper = require('./journeyHelper');
const pg = require('pg');
const participants = require('../service/participants');
const participant = require('../domain/participant');
const editUrlHelper = require('../domain/editUrlHelper');

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
    let aParticipant = participant.from({
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'no',
      discount: 'yes'
    }).withToken('23eF67i').withStartNr(42).withSecureId(editUrlHelper.generateSecureID());

    participants.save(aParticipant)
      .then(() => {
        helper.setUpClient()
          .url(editParticipantUrl + '/' + aParticipant.secureID)
          .isVisible('form#editParticipantForm')
          .then((isVisible) => {
            expect(isVisible).toBe(true);
          })
          .getValue('input#firstname')
          .then((value) => {
            expect(value).toBe('Friedrich');
          })
          .getValue('input#lastname')
          .then((value) => {
            expect(value).toBe('Schiller');
          })
          .getValue('input#email')
          .then((value) => {
            expect(value).toBe('f.schiller@example.com');
          })
          .getValue('select#visibility')
          .then((value) => {
            expect(value).toBe('no');
          })
          .getValue('select#category')
          .then((value) => {
            expect(value).toBe('f');
          })
          .getValue('input#birthyear')
          .then((value) => {
            expect(value).toBe('1980');
          })
          .getValue('input#team')
          .then((value) => {
            expect(value).toBe('Crazy runners');
          })
          .getText('p#paymentStatus')
          .then((value) => {
            expect(value).toBe('Zahlung noch nicht eingegangen');
          })
          .getText('p#startNumber')
          .then((value) => {
            expect(value).toBe('42');
          })
          .click("#submit")
          .isVisible('.thanks')
          .then((isVisible) => {
            expect(isVisible).toBe(true);
          })
          .end(done);
      });
  });

  it('shows an error page when using an invalid edit link', (done) => {
    helper.setUpClient()
      .url(editParticipantUrl + '/invalidId')
      .getText('h1')
      .then((text) => {
        expect(text).toBe('Teilnehmer nicht bekannt');
      })
      .getText('h2')
      .then((text) => {
        expect(text).toBe('Möglicherweise wurde ein falscher Link verwendet');
      })
      .end(done);
  });
});
