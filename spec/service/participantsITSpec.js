'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('participants service', () => {

  const participants = require('../../service/participants');
  const specHelper = require('../specHelper');
  const ParticipantBuilder = specHelper.ParticipantBuilder;
  const pg = require('pg');

  const aParticipant = ParticipantBuilder().initDefault().build();

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
            let deleteParticipants = client.query('delete from participants');
            deleteParticipants.on('end', () => {
              done();
              jasmineDone();
            });
            deleteParticipants.on('error', errorFunction);
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
        expect(data[0].shirtsize).toBe(aParticipant.tshirt.details[0].size);
        expect(data[0].shirtmodel).toBe(aParticipant.tshirt.details[0].model);
        expect(data[0].shirtordered).toBe(false);
        done();
      })
      .fail(fail);
  });

  describe('save', () => {
    it('should return the id', (done) => {
      let paymentToken = 'a token';

      participants.save(aParticipant, paymentToken)
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

  describe('getByToken', () => {

    const aParticipantWithTshirt = ParticipantBuilder().initDefault().withTshirt('XS', 'Normal fit').build()

    it('should return participant\'s lastname and firstname and ordered tshirt for a given token', (done) => {
      let paymentToken = 'a token';
      participants.save(aParticipantWithTshirt, paymentToken)
        .then(function (participantId) {
            participants.getByToken(paymentToken)
              .then(function (participant) {
                expect(participant.name).toEqual(aParticipantWithTshirt.lastname + ', ' + aParticipantWithTshirt.firstname);
                expect(participant.tshirt.details[0].size).toEqual(aParticipantWithTshirt.tshirt.details[0].size);
                expect(participant.tshirt.details[0].model).toEqual(aParticipantWithTshirt.tshirt.details[0].model);
                done();
              })
              .fail(fail);
        });
    });
  });

  describe('confirmParticipant', () => {
    it('should mark the participant as payed', (done) => {
      let paymentToken = 'a token';
      spyOn(participants, 'markPayed').and.callThrough();

      participants.save(aParticipant, paymentToken)
        .then(function (participantId) {
          participants.confirmParticipant(participantId)
            .then(() => {
              expect(participants.markPayed).toHaveBeenCalledWith(participantId);
              done();
            })
            .fail(fail);
        });
    });

    it('should give error if ID is invalid', (done) => {
      let paymentToken = 'a token';
      let wrongId = '999';

      participants.save(aParticipant, paymentToken)
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
      participants.save(aParticipant, paymentToken)
        .then((id) => {
            participants.delete(id).then(() => {
              done();
            });
        });
    });

    it('should delete users with tshirts', (done) => {
      let paymentToken = 'a token';
      const aParticipantWithTshirt = ParticipantBuilder().initDefault().withTshirt('XS', 'Normal fit').build()

      participants.save(aParticipantWithTshirt, paymentToken)
        .then((id) => {
            let participantid = id;
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
          expect(participants.save).toHaveBeenCalledWith(aParticipant, result.token);
          expect(participants.sendEmail).toHaveBeenCalled(); //todo check args.
          expect(participants.addTShirt).not.toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });

    it('should add a addTShirt if one ordered', (done) => {
      spyOn(participants, 'addTShirt');

      const aParticipantWithTshirt = ParticipantBuilder().initDefault().withTshirt('XS', 'Normal fit').build()

      participants.register(aParticipantWithTshirt)
        .then((result) => {
          participants.getFullInfoById(result.id)
          .then((participant) => {
            expect(participant.tshirt.amount).toBe(1);
            done();
          })
        })
        .fail(fail);
    });
  });

  describe('update', () => {
    it('should return the full information for a participant with given Id', (done) => {
      let paymentToken = 'a token';
      participants.save(aParticipant, paymentToken)
        .then(function (id) {
          const updatedParticipant = ParticipantBuilder()
                                      .initDefault()
                                      .withFirstname('Hertha Updated')
                                      .withLastname('Mustermann Updated')
                                      .withEmail('h.mustermann@example.com Updated')
                                      .withCategory('Unicorn updated')
                                      .withBirthyear(1981)
                                      .withTeam('Crazy runners updated')
                                      .build();

          participants.getFullInfoById(id)
          .then((p) => {
            participants.updateById(updatedParticipant, p.id)
              .then(() => {
                participants.getFullInfoById(id)
                  .then(function (participant) {
                    expect(participant.firstname).toBe('Hertha Updated');
                    expect(participant.lastname).toBe('Mustermann Updated');
                    expect(participant.email).toBe('h.mustermann@example.com Updated');
                    expect(participant.category).toBe('Unicorn updated');
                    expect(participant.birthyear).toBe(1981);
                    expect(participant.team).toBe('Crazy runners updated');
                    done();
                  })
                  .fail(fail);
              });
          })
        });
    });
  });



  describe('updateParticipantWithShirt', () => {
    it('should update both the participant and tshirt', (done) => {
      const testParticipantWithLargeShirt = ParticipantBuilder().initDefault().withFirstname('Roy').withTshirt('L', 'Normal fit').build();
      const testParticipantWithSmallShirt = ParticipantBuilder().initDefault().withFirstname('Martin').withTshirt('S', 'Slim fit').build();

      participants.save(testParticipantWithLargeShirt, 'someToken')
      .then((savedID) => {
        participants.updateWithShirt(testParticipantWithSmallShirt, savedID)
        .then(() => {
          participants.getFullInfoById(savedID)
          .then((participant) => {
            expect(participant.firstname).toBe('Martin');
            participants.getTShirtFor(savedID)
            .then((shirt) => {
              expect(shirt[0].shirtsize).toBe('S');
              expect(shirt[0].shirtmodel).toBe('Slim fit');
              done()
            })
          })
        });
      })
    });

    it('should delete the shirt if set to false', (done) => {
      const testParticipantWithShirt = ParticipantBuilder().initDefault().withFirstname('Roy').withTshirt('L', 'Normal fit').build();
      const testParticipantWithNoShirt = ParticipantBuilder().initDefault().withFirstname('Martin').build();

      participants.save(testParticipantWithShirt, 'someToken')
      .then((savedID) => {
        participants.updateWithShirt(testParticipantWithNoShirt, savedID)
        .then(() => {
          participants.getFullInfoById(savedID)
          .then((participant) => {
            expect(participant.firstname).toBe('Martin');
            participants.getTShirtFor(savedID)
            .then((shirt) => {
              expect(shirt.length).toBe(0);
              done()
            })
          })
        });
      })
    });

    it('should add the shirt if set to true', (done) => {
      const testParticipantWithShirt = ParticipantBuilder().initDefault().withFirstname('Roy').withTshirt('L', 'Normal fit').build();
      const testParticipantWithNoShirt = ParticipantBuilder().initDefault().withFirstname('Martin').build();

      participants.save(testParticipantWithNoShirt, 'someToken')
       .then((savedID) => {
        participants.updateWithShirt(testParticipantWithShirt, savedID)
        .then(() => {
          participants.getFullInfoById(savedID)
          .then((participant) => {
            expect(participant.firstname).toBe('Roy');
            participants.getTShirtFor(savedID)
            .then((shirt) => {
              expect(shirt.length).toBe(1);
              done()
            })
          })
        });
       })
    });

  });

  describe('getPubliclyVisible', () => {
    it('returns only participants which are confirmed and OK with being visible to the public', (done) => {
      const aParticipant = ParticipantBuilder().initDefault().withVisibility(true).build();

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
