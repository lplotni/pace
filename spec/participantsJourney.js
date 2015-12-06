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
    var fullDetailsHeaderRow = ['Vorname', 'Nachname', 'Team name', 'Email', 'Geschlecht', 'Geburtsjahr', 'Bezahlt', 'Bearbeiten'];

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
});
