/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

let participants = require('../service/participants');
let pg = require('pg');
let helper = require('./journeyHelper');
let config = require('config');

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
      'Betrag',
      'Token',
      'Anzahl T-shirts',
      'T-shirt Größen',
      'Registrierung bestätigen',
      'Bearbeiten',
      'L&ouml;schen'];

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
          .setValue('input#username', config.get('admin.username'))
          .setValue('input#password', config.get('admin.password'))
          .click('button#submit')
          .url(helper.paceUrl+'admin/participants')
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
            .elements('tr.participant-line')
            .then(function (res) {
              expect(res.value.length).toBe(1);
            })
            .end(done);
      });
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

    let aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com',
      visibility: 'yes'
    };
    let aToken = 'a token';

    let anotherParticipant = {
      firstname: 'Issac',
      lastname: 'Newton',
      email: 'i.newton@example.com',
      visibility: 'yes'
    }
    let anotherToken = 'another token';
    participants.save(aParticipant, aToken).then(participants.markPayed)

      .then( () => {
        return  participants.save(anotherParticipant, anotherToken);
      })
      .then(participants.markPayed)
      .then( () => {
        helper.setUpClient().url(participantsUrl)
        .setValue('.dataTables_filter input', 'Friedrich')
        .elements('tr.participant-line')
        .then( (res) => {
          expect(res.value.length).toBe(1);
        })
        .end(done);
      })
  })

describe('admin view', () => {

    let setUpLoggedInClient = () => {
      return helper.setUpClient()
        .url(loginUrl)
        .setValue('input#username', config.get('admin.username'))
        .setValue('input#password', config.get('admin.password'))
        .click('button#submit');
    };

    it('shows a search box', (done) => {
    setUpLoggedInClient().url(helper.paceUrl+'admin/participants')
      .isVisible('.dataTables_filter')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
    });

    it('searches for participants', (done) => {

      let aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      let aToken = 'a token';

      let anotherParticipant = {
        firstname: 'Issac',
        lastname: 'Newton',
        email: 'i.newton@example.com'
      }
      let anotherToken = 'another token';
      participants.save(aParticipant, aToken)
        .then( () => {
          return  participants.save(anotherParticipant, anotherToken);
        })
        .then( () => {
          setUpLoggedInClient().url(helper.paceUrl+'admin/participants')
          .setValue('.dataTables_filter input', 'Friedrich')
          .elements('tr.participant-line')
          .then( (res) => {
            expect(res.value.length).toBe(1);
          })
          .end(done);
        })
    })

    it('should have a link to edit a participant', (done) => {
      let aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      let aToken = 'a token';

      participants.save(aParticipant, aToken)
        .then(() => {
          setUpLoggedInClient().url(helper.paceUrl+'admin/participants')
            .isVisible('a#edit')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .end(done);
        });
    });

    it('should show amount to pay - no tshirt', function (done) {
      let aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      let aToken = 'a token';

      participants.save(aParticipant, aToken)
        .then(() => {
          let loggedInClient = setUpLoggedInClient();

          loggedInClient.url(helper.paceUrl+'admin/participants')
            .elements('td#tshirt-amount')
            .then(function (tshirtFields) {
              loggedInClient.elementIdText(tshirtFields.value[0].ELEMENT)
                .then(function (textObject) {
                  expect(textObject.value).toBe('0');
                  loggedInClient.elements('td#amount')
                    .then(function (amountFields) {
                      loggedInClient.elementIdText(amountFields.value[0].ELEMENT)
                        .then(function (textObject) {
                          expect(textObject.value).toBe('15');
                          loggedInClient.end(done);
                        });
                    });
                });
            });
        });
    });

    it('should show amount to pay - one tshirt', function (done) {
      var aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      var aToken = 'a token';
      var aTshirt = {
        size: 'M',
        model: 'normal fit'
      };

      participants.save(aParticipant, aToken)
        .then(function (id) {
          participants.addTShirt(aTshirt, id);
        })
        .then(function () {
          var loggedInClient = setUpLoggedInClient();

          loggedInClient.url(helper.paceUrl+'admin/participants')
            .elements('td#tshirt-amount')
            .then(function (tshirtFields) {
              loggedInClient.elementIdText(tshirtFields.value[0].ELEMENT)
                .then(function (textObject) {
                  expect(textObject.value).toBe('1');
                  loggedInClient.elements('td#amount')
                    .then(function (amountFields) {
                      loggedInClient.elementIdText(amountFields.value[0].ELEMENT)
                        .then(function (textObject) {
                          expect(textObject.value).toBe('35.5');
                          loggedInClient.end(done);
                        });
                    });
                });
            });
        });
    });
  });
});
