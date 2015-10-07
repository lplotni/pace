'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, it, jasmine, expect */

describe('participants service', function () {

  const participants = require('../../service/participants');
  var pg = require('pg');

  beforeEach(function (done) {
    var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || "tcp://vagrant@localhost/pace";
    var jasmineDone = done;

    pg.connect(connectionString, function (err, client, done) {
        if (err) {
          console.error('DB connection problem: ', err);
          done();
          jasmineDone();
        } else {
          var query = client.query('delete from participants');
          query.on('end', function () {
            done();
            jasmineDone();
          });
          query.on('error', function (error) {
            console.error('DB statement problem: ', error);
            done();
            jasmineDone();
          });
        }
      }
    );

  });

  afterAll(function (done) {
    pg.end();
    done();
  });


  it('should store and read participants', function (done) {
    var aParticipant = {
      firstname: 'Hertha',
      lastname: 'Mustermann',
      email: 'h.mustermann@example.com'
    };
    var randomToken = '1234567';

    participants.save(aParticipant, randomToken)
      .then(participants.getRegistered)
      .then(function (data) {
        expect(data.length).toBe(1);
        expect(data[0].firstname).toBe(aParticipant.firstname);
        expect(data[0].lastname).toBe(aParticipant.lastname);
        expect(data[0].email).toBe(aParticipant.email);
        done();
      });
  });

  describe('getByToken', function() {

    it('should return the name and amount to pay for the payment token', function (done) {
      var aParticipant = {
        firstname: 'Mark',
        lastname: 'Mueller',
        email: 'm.mueller@example.com'
      };
      var paymentToken = 'a token';

      participants.save(aParticipant, paymentToken)
        .then(function() {
          participants.getByToken(paymentToken)
            .then(function(data) {
              expect(data).toEqual({ name: 'Mueller, Mark', amount: '10' });
              done();
            });
        });
    });

    it('should return an error message for an incorrect payment token', function (done) {
      var paymentToken = 'some token not in the DB';

      participants.getByToken(paymentToken)
        .catch(function(data) {
          expect(data).toEqual({ error: 'Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.' });
          done();
        });

    });
  });
});