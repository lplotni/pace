'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('participants service', () => {

  const participants = require('../../service/participants');
  const pg = require('pg');

  const aParticipant = {
    firstname: 'Hertha',
    lastname: 'Mustermann',
    email: 'h.mustermann@example.com',
    category: 'Unicorn',
    birthyear: 1980,
    visibility: 'yes',
    discount:'no',
    team: 'Crazy runners'
  };

  const secureId = 'some_secure_id';

  beforeEach((done) => {
    let connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
    let jasmineDone = done;

    pg.connect(connectionString, function (err, client, done) {
        function errorFunction(error) {
          console.error('DB statement problem: ', error);
          done();
          jasmineDone();
        }

        if (err) {
          errorFunction(err);
        } else {
          let deleteShirts = client.query('delete from tshirts');
          deleteShirts.on('end', () => {
            let deleteParticipants = client.query('delete from participants');
            deleteParticipants.on('end', () => {
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

  afterAll((done) => {
    pg.end();
    done();
  });

  it('should store and read participants', (done) => {
    const randomToken = '1234567';

    participants.save(aParticipant, randomToken, secureId)
      .then(participants.getRegistered)
      .then(function (data) {
        expect(data.length).toBe(1);
        expect(data[0].firstname).toBe(aParticipant.firstname);
        expect(data[0].lastname).toBe(aParticipant.lastname);
        expect(data[0].email).toBe(aParticipant.email);
        expect(data[0].category).toBe(aParticipant.category);
        expect(data[0].birthyear).toBe(aParticipant.birthyear);
        expect(data[0].discount).toBe(aParticipant.discount);
        expect(data[0].team).toBe(aParticipant.team);
        done();
      })
      .fail(fail);
  });

  describe('save', () => {
    it('should return the id', (done) => {
      let paymentToken = 'a token';

      participants.save(aParticipant, paymentToken, secureId)
        .then(function (participantId) {
          expect(participantId).toBeDefined();
          done();
        })
        .fail(fail);
    });
  });

  describe('getById', () => {
    it('should return name and email of the participant with given Id', (done) => {
      let paymentToken = 'a token';
      participants.save(aParticipant, paymentToken, secureId)
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

  describe('getByToken', () => {
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


    it('should return participant\'s lastname and firstname and ordered tshirt for a given token', (done) => {
      let paymentToken = 'a token';
      participants.save(aParticipantWithTshirt, paymentToken)
        .then(function (participantId) {
          participants.addTShirt(aParticipantWithTshirt.tshirt, participantId)
            .then(() => {
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

  describe('confirmParticipant', () => {
    it('should mark the participant as payed and send a confirmation mail which includes the edit link', (done) => {
      let paymentToken = 'a token';
      spyOn(participants, 'markPayed').and.callThrough();
      spyOn(participants, 'sendEmail');

      participants.save(aParticipant, paymentToken, secureId)
        .then(function (participantId) {
          participants.confirmParticipant(participantId)
            .then(() => {
              expect(participants.markPayed).toHaveBeenCalledWith(participantId);

              expect(participants.sendEmail).toHaveBeenCalled();
              let partcipantsEmail = participants.sendEmail.calls.mostRecent().args[0];
              expect(partcipantsEmail).toBe(aParticipant.email);
              let subject = participants.sendEmail.calls.mostRecent().args[1];
              expect(subject).toBe('Lauf gegen Rechts: Zahlung erhalten');
              let content = participants.sendEmail.calls.mostRecent().args[2];
              expect(content).toMatch(/eingegangen/);
              expect(content).toMatch(secureId);

              done();
            })
            .fail(fail);
        });
    });

    it('should give error if ID is invalid', (done) => {
      let paymentToken = 'a token';
      let wrongId = '999';

      participants.save(aParticipant, paymentToken, secureId)
        .then(() => {
          participants.confirmParticipant(wrongId)
            .catch(() => {
              done();
            });
        });
    });
  });

  describe('delete', () => {
    it('should delete a user', (done) => {
      let paymentToken = 'a token';
      participants.save(aParticipant, paymentToken, secureId)
        .then((id) => {
            participants.delete(id).then(() => {
              done();
            });
        });
    });

    it('should delete users with tshirts', (done) => {
      let paymentToken = 'a token';
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
      participants.save(aParticipantWithTshirt, paymentToken, secureId)
        .then((participantid) => {
            participants.delete(participantid).then(() => {
              done();
            })
            .fail(fail);
        });
    });

    it('should give error if accessing deleted user', (done) => {
      let paymentToken = 'a token';
      participants.save(aParticipant, paymentToken)
        .then((id) => {
            let participantid = id;
            participants.delete(participantid).then(() => {
              participants.getById(participantid).catch(() => {
                  done();
              });
            });
        });
    });
  });

  describe('registration', () => {
    it('should save the participant and send confirmation email', (done) => {
      spyOn(participants, 'save').and.callThrough();
      spyOn(participants, 'sendEmail');
      spyOn(participants, 'addTShirt');

      participants.register(aParticipant)
        .then((result) => {
          expect(participants.save).toHaveBeenCalled();
          let participant = participants.save.calls.mostRecent().args[0];
          expect(participant).toBe(aParticipant);
          let token = participants.save.calls.mostRecent().args[1];
          expect(token).toBe(result.token);
          let secureId = participants.save.calls.mostRecent().args[2];
          expect(secureId).not.toBeNull();

          expect(participants.sendEmail).toHaveBeenCalled();

          let participantsEmail = participants.sendEmail.calls.mostRecent().args[0];
          expect(participantsEmail).toBe(aParticipant.email);

          let subject = participants.sendEmail.calls.mostRecent().args[1];
          expect(subject).toBe('Lauf Gegen Rechts: Registrierung erfolgreich');

          let content = participants.sendEmail.calls.mostRecent().args[2];
          expect(content).toMatch(/Danke/);

          expect(participants.addTShirt).not.toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });

    it('should call addTShirt if one ordered', (done) => {
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

      participants.register(aParticipantWithTshirt)
        .then(() => {
          expect(participants.addTShirt).toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });
  });

  describe('addTShirt', () => {
    it('stores tshirt', (done) => {
      participants.save({
        firstname: 'Hertha',
        lastname: 'With TShirt',
        email: 'h.mustermann@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        team: 'Crazy runners'
      }, 'tokenX').then(function (id) {
        participants.addTShirt({size: 'M', model: 'Skin fit'}, id)
          .then(() => {
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

  describe('update', () => {
    it('should return the full information for a participant with given Id', (done) => {
      let paymentToken = 'a token';
      participants.save(aParticipant, paymentToken, 'someSecureId')
        .then(function (id) {
          const updatedParticipant = {
            firstname: 'Hertha updated',
            lastname: 'Mustermann updated',
            email: 'h.mustermann@example.com updated',
            category: 'Unicorn updated',
            birthyear: 1981,
            team: 'Crazy runners updated'
          };
          participants.getFullInfoById(id)
          .then((p) => {
            participants.update(updatedParticipant, p.secureid)
              .then(() => {
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
  });

  describe('getPubliclyVisible', () => {
    it('returns only participants which are confirmed and OK with being visible to the public', (done) => {
      participants.save(aParticipant, 'tokenXX')
        .then(participants.markPayed)
        .then(participants.getPubliclyVisible)
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
  });
})
;
