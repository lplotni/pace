'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('participants service', function () {

  const participants = require('../../service/participants');
  const pg = require('pg');

  const aParticipant = {
    firstname: 'Hertha',
    lastname: 'Mustermann',
    email: 'h.mustermann@example.com',
    category: 'Unicorn',
    birthyear: 1980,
    team: 'Crazy runners'
  };

  beforeEach(function (done) {
    var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
    var jasmineDone = done;

    pg.connect(connectionString, function (err, client, done) {
        function errorFunction(error) {
          console.error('DB statement problem: ', error);
          done();
          jasmineDone();
        }

        if (err) {
          errorFunction(err);
        } else {
          var deleteShirts = client.query('delete from tshirts');
          deleteShirts.on('end', function () {
            var deleteParticipants = client.query('delete from participants');
            deleteParticipants.on('end', function () {
              done();
              jasmineDone();
            });
            deleteParticipants.on('error', errorFunction);
          });
          deleteShirts.on('error', errorFunction);
        }
      }
    );

  });

  afterAll(function (done) {
    pg.end();
    done();
  });

  it('should store and read participants', function (done) {
    var randomToken = '1234567';

    participants.save(aParticipant, randomToken)
      .then(participants.getRegistered)
      .then(function (data) {
        expect(data.length).toBe(1);
        expect(data[0].firstname).toBe(aParticipant.firstname);
        expect(data[0].lastname).toBe(aParticipant.lastname);
        expect(data[0].email).toBe(aParticipant.email);
        expect(data[0].category).toBe(aParticipant.category);
        expect(data[0].birthyear).toBe(aParticipant.birthyear);
        expect(data[0].team).toBe(aParticipant.team);
        done();
      })
      .fail(fail);
  });

  describe('save', function () {
    it('should return the id', function (done) {
      var paymentToken = 'a token';

      participants.save(aParticipant, paymentToken)
        .then(function (participantId) {
          expect(participantId).toBeDefined();
          done();
        })
        .fail(fail);
    });
  });

  describe('getById', function () {
    it('should return name and email of the participant with given Id', function (done) {
      var paymentToken = 'a token';
      participants.save(aParticipant, paymentToken)
        .then(function (participantId) {
          participants.getById(participantId)
            .then(function (participant) {
              expect(participant.name).toEqual(aParticipant.firstname);
              expect(participant.email).toEqual(aParticipant.email);
              done();
            })
            .fail(fail);
        });
    });
  });

  describe('getByToken', function () {
    const aParticipantWithTshirt = {
      firstname: 'Hertha',
      lastname: 'Mustermann',
      email: 'h.mustermann@example.com',
      birthyear: 1980,
      tshirt: {
        size: 'XS',
        model: 'Crazy cool fit'
      }
    };


    it('should return participant\'s lastname and firstname and ordered tshirt for a given token', function (done) {
      var paymentToken = 'a token';
      participants.save(aParticipantWithTshirt, paymentToken)
        .then(function (participantId) {
          participants.addTShirt(aParticipantWithTshirt.tshirt, participantId)
            .then(function () {
              participants.getByToken(paymentToken)
                .then(function (participant) {
                  expect(participant.name).toEqual(aParticipantWithTshirt.lastname + ', ' + aParticipantWithTshirt.firstname);
                  expect(participant.tshirt.size).toEqual(aParticipantWithTshirt.tshirt.size);
                  expect(participant.tshirt.model).toEqual(aParticipantWithTshirt.tshirt.model);
                  done();
                })
                .fail(fail);
            });
        });
    });
  });

  describe('confirmParticipant', function () {
    it('should mark the participant as payed', function (done) {
      var paymentToken = 'a token';
      spyOn(participants, 'markPayed').and.callThrough();

      participants.save(aParticipant, paymentToken)
        .then(function (participantId) {
          participants.confirmParticipant(participantId)
            .then(function () {
              expect(participants.markPayed).toHaveBeenCalledWith(participantId);
              done();
            })
            .fail(fail);
        });
    });

    it('should give error if ID is invalid', function (done) {
      var paymentToken = 'a token';
      var wrongId = '999';

      participants.save(aParticipant, paymentToken)
        .then(function () {
          participants.confirmParticipant(wrongId)
            .catch(function () {
              done();
            });
        });
    });
  });

  describe('registration', function () {
    it('should save the participant and send confirmation email', function (done) {
      spyOn(participants, 'save').and.callThrough();
      spyOn(participants, 'sendEmail');
      spyOn(participants, 'addTShirt');

      participants.register(aParticipant, 'aToken')
        .then(function () {
          expect(participants.save).toHaveBeenCalledWith(aParticipant, 'aToken');
          expect(participants.sendEmail).toHaveBeenCalled(); //todo check args.
          expect(participants.addTShirt).not.toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });

    it('should call addTShirt if one ordered', function (done) {
      spyOn(participants, 'addTShirt');

      const aParticipantWithTshirt = {
        firstname: 'Hertha',
        lastname: 'Mustermann',
        email: 'h.mustermann@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        team: 'Crazy runners',
        tshirt: {size: 'M', model: 'Slim fit'}
      };

      participants.register(aParticipantWithTshirt, 'bToken')
        .then(function () {
          expect(participants.addTShirt).toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });
  });

  describe('addTShirt', function () {
    it('stores tshirt', function (done) {
      participants.save({
        firstname: 'Hertha',
        lastname: 'With TShirt',
        email: 'h.mustermann@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        team: 'Crazy runners'
      }, 'tokenX').then(function (id) {
        participants.addTShirt({size: 'M', model: 'Skin fit'}, id)
          .then(function () {
            participants.getTShirtFor(id)
              .then(function (shirts) {
                expect(shirts.length).toBe(1);
                done();
              })
              .fail(fail);
          });
      });

    });
  });

  describe('update', function () {
    it('should return the full information for a participant with given Id', function (done) {
      var paymentToken = 'a token';
      participants.save(aParticipant, paymentToken)
        .then(function (id) {
          const updatedParticipant = {
            firstname: 'Hertha updated',
            lastname: 'Mustermann updated',
            email: 'h.mustermann@example.com updated',
            category: 'Unicorn updated',
            birthyear: 1981,
            team: 'Crazy runners updated'
          };
          participants.update(updatedParticipant, id)
            .then(function () {
              participants.getFullInfoById(id)
                .then(function (participant) {
                  expect(participant.firstname).toBe('Hertha updated');
                  expect(participant.lastname).toBe('Mustermann updated');
                  expect(participant.email).toBe('h.mustermann@example.com updated');
                  expect(participant.category).toBe('Unicorn updated');
                  expect(participant.birthyear).toBe(1981);
                  expect(participant.team).toBe('Crazy runners updated');
                  done();
                })
                .fail(fail);
            });
        });
    });
  });
})
;
