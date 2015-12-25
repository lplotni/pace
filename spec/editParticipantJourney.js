/* jshint node: true */
/* global describe, beforeAll, beforeEach, afterEach, it, expect */
'use strict';

var helper = require('./journeyHelper');
var pg = require('pg');
var participants = require('../service/participants');
var editUrlGenerator = require('../domain/editUrlGenerator');

describe('edit participant journey', function () {

  var editParticipantUrl = helper.paceUrl + 'editparticipant';

  beforeEach(function (done) {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterEach(function () {
    helper.resetToOriginalTimeout();
    pg.end();
  });

  it('allows to edit a participant', function (done) {
    var aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com',
      category: 'f',
      birthyear: 1980,
      team: 'Crazy runners'
    };
    var aToken = '23eF67i';

    participants.save(aParticipant, aToken)
        .then(function (id) {
          var editUrl = editUrlGenerator.generateEncryptedUrl(id.toString());
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
              .getValue('select#category')
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
              .end(done);
        });
  });

  it('shows an error page when using an invalid edit link', function (done) {
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