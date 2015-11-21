/* jshint node: true */
/* global describe, beforeEach, afterEach, it, jasmine, expect */
'use strict';

var participants = require('../service/participants');
var pg = require('pg');
var helper = require('./journeyHelper');

describe('participants page', function () {

  var client;
  var participantsUrl = helper.paceUrl + 'participants';
  var loginUrl = helper.paceUrl + 'login';

  beforeEach(function (done) {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
    client = helper.setUpClient();
  });

  afterEach(function () {
    helper.resetToOriginalTimeout();
    pg.end();
  });

  it('shows full participant list only if logged in as admin', function (done) {
    var aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com'
    };
    var aToken = 'a token';

    participants.save(aParticipant, aToken)
        .then(function () {
          client.url(participantsUrl)
              .elements('li.participant-line')
              .then(function (res) {
                  expect(res.value.length).toBe(0);
              })
              .url(loginUrl)
              .setValue('input#username', 'admin')
              .setValue('input#password', 'admin')
              .click('button#submit')
              .url(participantsUrl)
              .elements('li.participant-line')
              .then(function (res) {
                expect(res.value.length).toBe(1);
              })
              .end(done);
        });
  });
});