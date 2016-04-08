/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterAll, it, expect */
'use strict';

const participants = require('../service/participants');
const participant = require('../domain/participant');
const pg = require('pg');
const helper = require('./journeyHelper');
const config = require('config');

describe('user deletion journey', () => {
  let loggedInClient;
  const participantsListUrl = helper.paceUrl + 'admin/participants';
  const loginUrl = helper.paceUrl + 'login';

  beforeAll((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    helper.resetToOriginalTimeout();
    helper.closeDbConnection(done);
  });

  describe('when logged in', () => {

    beforeEach(() => {
      loggedInClient = helper.setUpClient()
        .url(loginUrl)
        .setValue('input#username', config.get('admin.username'))
        .setValue('input#password', config.get('admin.password'))
        .click('button#submit');
    });

    it('allows to delete a participant', (done) => {
      let aParticipant = participant.from({
        firstname: 'Johann-Wolfgang',
        lastname: 'von Goethe',
        email: 'jvg@example.com',
        category: 'f',
        birthyear: 1980,
        team: 'Crazy runners',
        visibility: 'yes',
        discount: 'no'
      }).withToken('GLSKDJ').withSecureId('secureId').withStartNr(100);

      participants.save(aParticipant)
        .then(() => {
          loggedInClient.url(participantsListUrl)
            .isVisible('td=Johann-Wolfgang')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .click('button#delete-user')
            .isVisible('td=Johann-Wolfgang')
            .then(function (isVisible) {
              expect(isVisible).toBe(false);
            })
            .end(done);
        });
    });
  });
});
