/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, beforeAll, afterAll, it, expect, fail */
'use strict';

const tshirts = require('../service/tshirts');
const participants = require('../service/participants');
const participant = require('../domain/participant');
const editUrlHelper = require('../domain/editUrlHelper');
const helper = require('./journeyHelper');
const config = require('config');

describe('participants page', () => {

  let participantsUrl = helper.paceUrl + 'participants';
  let loginUrl = helper.paceUrl + 'login';

  let aParticipant = participant.from({
    firstname: 'Friedrich',
    lastname: 'Schiller',
    email: 'f.schiller@example.com',
    category: 'f',
    birthyear: 1980,
    team: 'Crazy runners',
    visibility: 'yes',
    discount: 'no'
  }).withSecureId(editUrlHelper.generateSecureID());


  beforeAll(() => {
    helper.changeOriginalTimeout();
  });

  beforeEach((done) => {
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    helper.resetToOriginalTimeout();
    helper.closeDbConnection(done);
  });

  it('shows full participant list only if logged in as admin', (done) => {
    let adminsListElements = [
      'Startnummer',
      'Vorname',
      'Nachname',
      'Bezahlt',
      'Betrag',
      'Token',
      'Anzahl T-shirts',
      'T-shirt Größen',
      'Bestätigen button',
      'Löschen button',
      'Edit button'];

    participants.save(aParticipant.withToken('a Token').withStartNr(42))
      .then(() => {
        helper.setUpClient().url(participantsUrl)
          .elements('li.participant-line')
          .then(function (res) {
            expect(res.value.length).toBe(0);
          })
          .url(loginUrl)
          .setValue('input#username', config.get('admin.username'))
          .setValue('input#password', config.get('admin.password'))
          .click('button#submit')
          .url(helper.paceUrl + 'admin/participants')
          .elements('tr.participant-line')
          .then(function (res) {
            expect(res.value.length).toBe(1);
          })
          .elements('th')
          .then(function (res) {
            expect(res.value.length).toBe(adminsListElements.length);
          })
          .end(done);
      });
  });

  it('shows registered participants only if they wished to be publicly visible', (done) => {
    let hiddenParticipant = participant.from({
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'no',
      discount: 'yes'
    }).withSecureId(editUrlHelper.generateSecureID()).withToken('c Token').withStartNr(100);

    participants.save(aParticipant.withToken('b Token').withStartNr(43))
      .then(participants.markPayed)
      .then(() => {
        return participants.save(hiddenParticipant);
      })
      .then(participants.markPayed)
      .then(() => {
        helper.setUpClient().url(participantsUrl)
          .elements('tr.participant-line')
          .then(function (res) {
            expect(res.value.length).toBe(1);
          })
          .end(done);
      })
      .fail(fail);
  });

  it('shows a search box', (done) => {
    helper.setUpClient().url(participantsUrl)
      .isVisible('.dataTables_filter')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  it('searches for participants', (done) => {
    let anotherParticipant = participant.from({
      firstname: 'Issac',
      lastname: 'Newton',
      email: 'i.newton@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners',
      visibility: 'no',
      discount: 'yes'
    }).withSecureId(editUrlHelper.generateSecureID()).withToken('another token').withStartNr(1000);

    participants.save(aParticipant.withToken('d Token').withStartNr(431))
      .then(participants.markPayed)
      .then(() => {
        return participants.save(anotherParticipant);
      })
      .then(participants.markPayed)
      .then(() => {
        helper.setUpClient().url(participantsUrl)
          .setValue('.dataTables_filter input', 'Friedrich')
          .elements('tr.participant-line')
          .then((res) => {
            expect(res.value.length).toBe(1);
          })
          .end(done);
      })
      .fail(fail);
  });

  describe('admin view', () => {

    let setUpLoggedInClient = () => {
      return helper.setUpClient()
        .url(loginUrl)
        .setValue('input#username', config.get('admin.username'))
        .setValue('input#password', config.get('admin.password'))
        .click('button#submit');
    };

    it('shows a search box', (done) => {
      setUpLoggedInClient().url(helper.paceUrl + 'admin/participants')
        .isVisible('.dataTables_filter')
        .then(function (isVisible) {
          expect(isVisible).toBe(true);
        })
        .end(done);
    });

    it('searches for participants', (done) => {

      let anotherParticipant = participant.from({
        firstname: 'Issac',
        lastname: 'Newton',
        email: 'i.newton@example.com',
        category: 'f',
        birthyear: 1980,
        team: 'Crazy runners',
        visibility: 'no',
        discount: 'yes'
      }).withSecureId(editUrlHelper.generateSecureID()).withToken('z Token').withStartNr(1010);

      participants.save(aParticipant.withToken('e Token').withStartNr(451))
        .then(() => {
          return participants.save(anotherParticipant);
        })
        .then(() => {
          setUpLoggedInClient().url(helper.paceUrl + 'admin/participants')
            .setValue('.dataTables_filter input', 'Friedrich')
            .elements('tr.participant-line')
            .then((res) => {
              expect(res.value.length).toBe(1);
            })
            .end(done);
        })
        .fail(fail);
    });

    it('should have a link to edit a participant', (done) => {
      participants.save(aParticipant.withToken('f Token').withStartNr(551))
        .then(() => {
          setUpLoggedInClient().url(helper.paceUrl + 'admin/participants')
            .isVisible('a#edit.edit-button')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .end(done);
        })
        .fail(fail);
    });

    it('should be able to confirm a participant participant', (done) => {
      participants.save(aParticipant.withToken('f Token').withStartNr(555))
        .then(() => {
          setUpLoggedInClient().url(helper.paceUrl + 'admin/participants')
            .click('button#confirm-registration')
            .isVisible('#confirm-registration-done')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .end(done);
        })
        .fail(fail);
    });

    it('should show amount to pay - no tshirt', function (done) {
      participants.save(aParticipant.withToken('g Token').withStartNr(651))
        .then(() => {
          let loggedInClient = setUpLoggedInClient();

          loggedInClient.url(helper.paceUrl + 'admin/participants')
            .elements('td#tshirt-amount')
            .then(function (tshirtFields) {
              loggedInClient.elementIdText(tshirtFields.value[0].ELEMENT)
                .then(function (textObject) {
                  expect(textObject.value).toBe('0');
                  loggedInClient.elements('td#amount')
                    .then(function (amountFields) {
                      loggedInClient.elementIdText(amountFields.value[0].ELEMENT)
                        .then(function (textObject) {
                          expect(textObject.value).toBe('10');
                          loggedInClient.end(done);
                        });
                    });
                });
            });
        })
        .fail(fail);
    });

    it('should show amount to pay - one tshirt', function (done) {
      let tshirt = {
        size: 'M',
        model: 'normal fit'
      };

      participants.save(aParticipant.withToken('h Token').withStartNr(751))
        .then(function (id) {
          tshirts.addFor(tshirt, id);
        })
        .then(function () {
          var loggedInClient = setUpLoggedInClient();

          loggedInClient.url(helper.paceUrl + 'admin/participants')
            .elements('td#tshirt-amount')
            .then(function (tshirtFields) {
              loggedInClient.elementIdText(tshirtFields.value[0].ELEMENT)
                .then(function (textObject) {
                  expect(textObject.value).toBe('1');
                  loggedInClient.elements('td#amount')
                    .then(function (amountFields) {
                      loggedInClient.elementIdText(amountFields.value[0].ELEMENT)
                        .then(function (textObject) {
                          expect(textObject.value).toBe('20');
                          loggedInClient.end(done);
                        });
                    });
                });
            });
        })
        .fail(fail);
    });
  });
});
