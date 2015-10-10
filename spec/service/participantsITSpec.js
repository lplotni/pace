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
      email: 'h.mustermann@example.com',
      gender: 'Unicorn'
    };
    var randomToken = '1234567';

    participants.save(aParticipant, randomToken)
      .then(participants.getRegistered)
      .then(function (data) {
        expect(data.length).toBe(1);
        expect(data[0].firstname).toBe(aParticipant.firstname);
        expect(data[0].lastname).toBe(aParticipant.lastname);
        expect(data[0].email).toBe(aParticipant.email);
        expect(data[0].gender).toBe(aParticipant.gender);
        done();
      });
  });

  describe('getIdFor', function() {
    it('should return the database id by fistname, lastname and email', function (done) {
      var aParticipant = {
        firstname: 'Mark',
        lastname: 'Mueller',
        email: 'm.mueller@example.com'
      };
      var paymentToken = 'a token';

      participants.save(aParticipant, paymentToken)
        .then(function() {
          participants.getIdFor(aParticipant)
            .then(function(participantId) {
              expect(participantId).toBeDefined()
              done();
            });
        });
    });

    it('should return an error if the id is invalid', function (done) {
      var wrongId = '999';

      participants.getIdFor(wrongId)
        .catch(function(data) {
          expect(data).toEqual("No participant found with these details");
          done();
        });
    });

  });

  describe('confirmParticipant', function() {
    it('should mark the participant as payed', function (done) {
      var aParticipant = {
        firstname: 'Mark',
        lastname: 'Mueller',
        email: 'm.mueller@example.com'
      };
      var paymentToken = 'a token';

      participants.save(aParticipant, paymentToken)
        .then(function() {
          participants.getIdFor(aParticipant)
            .then(function (participantId) {
              participants.confirmParticipant(participantId)
                .then(function () {
                  // confirmation was successful
                  done();
                });
            });
        });
    });

    it('should give error if ID is invalid', function (done) {
      var aParticipant = {
        firstname: 'Mark',
        lastname: 'Mueller',
        email: 'm.mueller@example.com'
      };
      var paymentToken = 'a token';
      var wrongId = '999';

      participants.save(aParticipant, paymentToken)
        .then(function() {
          participants.confirmParticipant(wrongId)
            .catch(function() {
              done();
            });
        });
    });
  });

});