/* jshint node: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var participants = require('../service/participants');
var pg = require('pg');
var helper = require('./journeyHelper');

describe('participants page', function () {

  var participantsUrl = helper.paceUrl + 'participants';
  var loginUrl = helper.paceUrl + 'login';

  beforeEach(function (done) {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterEach(function () {
    helper.resetToOriginalTimeout();
    pg.end();
  });

  it('shows full participant list only if logged in as admin', function (done) {
    var fullDetailsHeaderRow = ['Vorname',
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

    var aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com'
    };
    var aToken = 'a token';

    participants.save(aParticipant, aToken)
      .then(function () {
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

  describe('admin view', function () {

    var setUpLoggedInClient = function () {
      return helper.setUpClient()
        .url(loginUrl)
        .setValue('input#username', 'admin')
        .setValue('input#password', 'admin')
        .click('button#submit');
    };

    it('should have a link to edit a participant', function (done) {
      var aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      var aToken = 'a token';

      participants.save(aParticipant, aToken)
        .then(function () {
          setUpLoggedInClient().url(participantsUrl)
            .isVisible('a#edit')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .end(done);
        });
    });

    it('should show the amount of tshirts ordered', function (done) {
      var aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      var aToken = 'a token';

      participants.save(aParticipant, aToken)
        .then(function () {
          var loggedInClient = setUpLoggedInClient();

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
