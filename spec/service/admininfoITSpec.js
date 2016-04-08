'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('admin service', () => {

  const registration = require('../../service/registration');
  const participants = require('../../service/participants');
  const tshirts = require('../../service/tshirts');
  const participant = require('../../domain/participant');
  const admininfo = require('../../service/admininfo');
  const pg = require('pg');
  let helper = require('../journeyHelper');

  let startNr = 42;
  const aParticipant = participant.from({
    firstname: 'Hertha',
    lastname: 'Mustermann',
    email: 'h.mustermann@example.com',
    category: 'Unicorn',
    birthyear: 1980,
    visibility: 'yes',
    discount: 'no',
    team: 'Crazy runners',
    shirt: 'yes',
    size: 'XS',
    model: 'Normal Fit'
  }).withSecureId('secure_id').withToken('atoken');

  beforeEach((done) => {
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    helper.closeDbConnection(done);
  });

  it('should count shirt orders', (done) => {
    participants.save(aParticipant.withStartNr(startNr++))
      .then(function (participantId) {
        registration.confirm(participantId)
          .then(function () {
            tshirts.addFor(aParticipant.tshirt, participantId)
              .then(() => {
                admininfo.shirtOrders()
                  .then(function (data) {
                    expect(data.length).toBe(1);
                    expect(data[0].size).toBe(aParticipant.tshirt.size);
                    expect(data[0].category).toBe(aParticipant.category);
                    done();
                  });
              });
          })
          .fail(fail);
      });
  });

  it('should count confirmed participants', (done) => {
    participants.save(aParticipant.withStartNr(startNr++))
      .then(function (participantId) {
        registration.confirm(participantId)
          .then(function () {
            admininfo.confirmedParticipantsCount()
              .then(function (data) {
                expect(data[0].count).toBe('1'); // There is just 1 participant - why should it be 5?
                done();
              });
          })
          .fail(fail);
      });
  });


})
;
