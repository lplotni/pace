/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

let participants = require('../service/participants');
let pg = require('pg');
let helper = require('./journeyHelper');

describe('participants page', () => {

  let participantsUrl = helper.paceUrl + 'participants';
  let loginUrl = helper.paceUrl + 'login';

  beforeEach((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterEach(() => {
    helper.resetToOriginalTimeout();
    pg.end();
  });

  it('shows full participant list only if logged in as admin', (done) => {
    let fullDetailsHeaderRow = ['Vorname',
      'Nachname',
      'Team name',
      'Email',
      'Kategorie',
      'Geburtsjahr',
      'Bezahlt',
      'Token',
      'Anzahl T-shirts',
      'T-shirt Größen',
      'Bearbeiten'];

    let aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com'
    };
    let aToken = 'a token';

    participants.save(aParticipant, aToken)
      .then(() => {
        helper.setUpClient().url(participantsUrl)
          .elements('li.participant-line')
          .then(function (res) {
            expect(res.value.length).toBe(0);
          })
          .url(loginUrl)
          .setValue('input#username', 'admin')
          .setValue('input#password', 'admin')
          .click('button#submit')
          .url(participantsUrl)
          .elements('tr.participant-line')
          .then(function (res) {
            expect(res.value.length).toBe(1);
          })
          .elements('th')
          .then(function (res) {
            expect(res.value.length).toBe(fullDetailsHeaderRow.length);
          })
          .end(done);
      });
  });

  it('shows registered participants only if they wished to be publicly visible', (done) => {
    let aPublicParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com',
      visibility: 'yes'
    };

    let aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com'
    };

    participants.save(aParticipant, 'a token').then(participants.markPayed)
      .then(() => {
        return participants.save(aPublicParticipant, 'b token');
      })
      .then(participants.markPayed)
        .then(() => {
            helper.setUpClient().url(participantsUrl)
              .elements('li.participant-line')
              .then(function (res) {
                expect(res.value.length).toBe(1);
              })
              .end(done);
        });
  });
describe('admin view', () => {

    let setUpLoggedInClient = () => {
      return helper.setUpClient()
        .url(loginUrl)
        .setValue('input#username', 'admin')
        .setValue('input#password', 'admin')
        .click('button#submit');
    };

    it('should have a link to edit a participant', (done) => {
      let aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      let aToken = 'a token';

      participants.save(aParticipant, aToken)
        .then(() => {
          setUpLoggedInClient().url(participantsUrl)
            .isVisible('a#edit')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .end(done);
        });
    });

    it('should show the amount of tshirts ordered', (done) => {
      let aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      let aToken = 'a token';

      participants.save(aParticipant, aToken)
        .then(() => {
          let loggedInClient = setUpLoggedInClient();

          loggedInClient.url(participantsUrl)
            .elements('td#tshirt-amount')
            .then(function (tshirtFields) {
              loggedInClient.elementIdText(tshirtFields.value[0].ELEMENT)
                .then(function (textObject) {
                  expect(textObject.value).toBe('0');
                  loggedInClient.end(done);
                });
            });
        });
    });
  });
});
