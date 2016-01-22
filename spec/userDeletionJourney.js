/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterAll, it, expect */
'use strict';

const participants = require('../service/participants');
const pg = require('pg');
const helper = require('./journeyHelper');
const config = require('config');

let specHelper = require('./specHelper');
let ParticipantBuilder = specHelper.ParticipantBuilder;

describe('user deletion journey', () => {
  let loggedInClient;
  const participantsListUrl = helper.paceUrl + 'admin/participants';
  const loginUrl = helper.paceUrl + 'login';

  beforeAll((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterAll(() => {
    helper.resetToOriginalTimeout();
    pg.end();
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
      let aParticipant = ParticipantBuilder().initDefault().build();
      let aToken = 'GLSKDJ';

      participants.save(aParticipant, aToken)
        .then(() => {
          loggedInClient.url(participantsListUrl)
            .isVisible('td='+ aParticipant.firstname)
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .click('button#delete-user')
            .isVisible('td='+ aParticipant.firstname)
            .then(function (isVisible) {
              expect(isVisible).toBe(false);
            })
           .end(done);
        });
    });
  });
});
