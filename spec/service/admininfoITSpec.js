'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('admin service', () => {

  const participants = require('../../service/participants');
  const admininfo = require('../../service/admininfo');
  const pg = require('pg');
  let helper = require('../journeyHelper');

  const aParticipant = {
    firstname: 'Hertha',
    lastname: 'Mustermann',
    email: 'h.mustermann@example.com',
    category: 'Unicorn',
    birthyear: 1980,
    visibility: 'yes',
    discount:'no',
    team: 'Crazy runners',
    tshirt: {
        size: 'XS',
        model: 'Normal Fit'
    }
  };

  const secureId = 'soecure_id';
  let startNr = 42;
  const paymentToken = 'atoken';

  beforeEach((done) => {
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    pg.end();
    done();
  });

  it('should count shirt orders', (done) => {
    participants.save(aParticipant, paymentToken, secureId, startNr++)
      .then(function (participantId) {
        participants.confirmParticipant(participantId)
          .then(function() {
            participants.addTShirt(aParticipant.tshirt, participantId)
              .then(() => {
                admininfo.getShirtOrders()
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
    participants.save(aParticipant, paymentToken, secureId, startNr++)
      .then(function (participantId) {
        participants.confirmParticipant(participantId)
          .then(function() {
            admininfo.getConfirmedParticipants()
              .then(function(data){
                expect(data[0].count).toBe('1'); // There is just 1 participant - why should it be 5?
                done();
              });
          })
          .fail(fail);
      });
  });


});
