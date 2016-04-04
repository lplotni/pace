'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('participants service', () => {

  const participants = require('../../service/participants');
  const mails = require('../../service/mails');
  const participant = require('../../domain/participant');
  const helper = require('../journeyHelper');

  let startNr = 30;

  const secureId = 'some_secure_id';
  const paymentToken = 'a token';

  const aParticipant = participant.from({
    firstname: 'Hertha',
    lastname: 'Mustermann',
    email: 'h.mustermann@example.com',
    category: 'Unicorn',
    birthyear: 1980,
    visibility: 'yes',
    discount: 'no',
    team: 'Crazy runners'
  }).withToken(paymentToken).withSecureId(secureId);

  const aSecondParticipant = participant.from({
    firstname: 'Michel',
    lastname: 'Mueller',
    email: 'm.mueller@example.com',
    category: 'Unicorn',
    birthyear: 1982,
    visibility: 'no',
    discount: 'no',
    team: 'Crazy runners'
  }).withToken(paymentToken).withSecureId(secureId);

  const aParticipantWithTshirt = participant.from({
    firstname: 'Hertha',
    lastname: 'Mustermann',
    email: 'h.mustermann@example.com',
    birthyear: 1980,
    category: 'Horse',
    visibility: 'yes',
    discount: 'no',
    shirt: 'yes',
    size: 'XS',
    model: 'Crazy cool fit'
  }).withToken(paymentToken).withSecureId(secureId);

  const expectOnParticipantFields = function (participantFromDb, participantId) {
    expect(participantFromDb.id).toEqual(participantId);
    expect(participantFromDb.firstname).toEqual(aParticipant.firstname);
    expect(participantFromDb.lastname).toEqual(aParticipant.lastname);
    expect(participantFromDb.email).toEqual(aParticipant.email);
    expect(participantFromDb.category).toEqual(aParticipant.category);
    expect(participantFromDb.birthyear).toEqual(aParticipant.birthyear);
    expect(participantFromDb.visibility).toEqual(aParticipant.visibility);
    expect(participantFromDb.discount).toEqual(aParticipant.discount);
    expect(participantFromDb.team).toEqual(aParticipant.team);
    expect(participantFromDb.paymenttoken).toEqual(paymentToken);
    expect(participantFromDb.has_payed).toEqual(false);
    expect(participantFromDb.secureid).toEqual(secureId);
  };

  beforeEach((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    helper.resetToOriginalTimeout();
    helper.closeDbConnection(done);
  });


  it('should store and read participants', (done) => {
    participants.save(aParticipant.withStartNr(startNr++))
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

      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          expect(participantId).toBeDefined();
          done();
        })
        .fail(fail);
    });
  });

  describe('getById', () => {
    it('should return all information of the participant with given Id', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          participants.getById(participantId)
            .then(function (participant) {
              expectOnParticipantFields(participant, participantId);
              done();
            })
            .fail(fail);
        });
    });
  });

  describe('getByToken', () => {
    it('should return participant\'s lastname and firstname and ordered tshirt for a given token', (done) => {
      participants.save(aParticipantWithTshirt.withStartNr(startNr++))
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

  describe('getBySecureId', () => {
    it('should return all information of the participant with given secureId', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          participants.getBySecureId(secureId)
            .then(function (participant) {
              expectOnParticipantFields(participant, participantId);
              done();
            })
            .fail(fail);
        });
    });
  });

  describe('confirmParticipant', () => {
    it('should mark the participant as payed and send a confirmation mail which includes the edit link', (done) => {
      spyOn(participants, 'markPayed').and.callThrough();
      spyOn(mails, 'sendEmail');

      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          participants.confirmParticipant(participantId)
            .then(() => {
              expect(participants.markPayed).toHaveBeenCalledWith(participantId);

              expect(mails.sendEmail).toHaveBeenCalled();
              let partcipantsEmail = mails.sendEmail.calls.mostRecent().args[0];
              expect(partcipantsEmail).toBe(aParticipant.email);
              let subject = mails.sendEmail.calls.mostRecent().args[1];
              expect(subject).toBe('Lauf gegen Rechts: Zahlung erhalten');
              let content = mails.sendEmail.calls.mostRecent().args[2];
              expect(content).toMatch(aParticipant.firstname);
              expect(content).toMatch(/eingegangen/);
              expect(content).toMatch(secureId);

              done();
            })
            .fail(fail);
        });
    });

    it('should give error if ID is invalid', (done) => {
      let wrongId = '999';

      participants.save(aParticipant.withStartNr(startNr++))
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
      participants.save(aParticipant.withStartNr(startNr++))
        .then((id) => {
          participants.delete(id).then(() => {
            done();
          });
        });
    });

    it('should delete users with tshirts', (done) => {
      participants.save(aParticipantWithTshirt.withStartNr(startNr++))
        .then((participantid) => {
          participants.delete(participantid).then(() => {
              done();
            })
            .fail(fail);
        });
    });

    it('should give error if accessing deleted user', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
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
      spyOn(mails, 'sendEmail');
      spyOn(participants, 'addTShirt');

      const p = participant.from({
        firstname: 'Hertha',
        lastname: 'Mustermann',
        email: 'h.mustermann@example.com',
        category: 'Unicorn',
        birthyear: 1980,
        visibility: 'yes',
        discount: 'no',
        team: 'Crazy runners'
      });

      participants.register(p)
        .then((result) => {
          expect(participants.save).toHaveBeenCalled();

          let participant = participants.save.calls.mostRecent().args[0];
          expect(participant.firstname).toBe(p.firstname);
          expect(participant.paymentToken).toBe(result.token);
          expect(participant.secureID).toBe(result.secureid);
          expect(participant.start_number).toBe(result.startnr);

          expect(mails.sendEmail).toHaveBeenCalled();

          let participantsEmail = mails.sendEmail.calls.mostRecent().args[0];
          expect(participantsEmail).toBe(p.email);

          let subject = mails.sendEmail.calls.mostRecent().args[1];
          expect(subject).toBe('Lauf Gegen Rechts: Registrierung erfolgreich');

          let content = mails.sendEmail.calls.mostRecent().args[2];
          expect(content).toMatch(/Danke/);

          expect(participants.addTShirt).not.toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });

    it('should call addTShirt if one ordered', (done) => {
      spyOn(participants, 'addTShirt');

      const pWithShirt = participant.from({
        firstname: 'Hertha',
        lastname: 'Mustermann',
        email: 'h.mustermann@example.com',
        birthyear: 1980,
        category: 'Horse',
        visibility: 'yes',
        discount: 'no',
        shirt: 'yes',
        size: 'XS',
        model: 'Crazy cool fit'
      });

      participants.register(pWithShirt)
        .then(() => {
          expect(participants.addTShirt).toHaveBeenCalled();
          done();
        })
        .fail(fail);
    });
  });

  describe('addTShirt', () => {
    it('stores tshirt', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then((id) => {
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
      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (id) {
          const updatedParticipant = {
            firstname: 'Hertha updated',
            lastname: 'Mustermann updated',
            email: 'h.mustermann@example.com updated',
            category: 'Unicorn updated',
            birthyear: 1981,
            team: 'Crazy runners updated'
          };
          participants.getById(id)
            .then((p) => {
              participants.update(updatedParticipant, p.secureid)
                .then(() => {
                  participants.getById(id)
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
      participants.save(aParticipant.withStartNr(startNr++))
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

  describe('bulkmail', () => {
    it('should send the correct email to every participant', (done) => {
      spyOn(mails, 'sendEmail');
      spyOn(mails, 'sendStatusEmail').and.callThrough();
      participants.save(aParticipant.withStartNr(startNr++))
        .then(participants.markPayed)
        .then(participants.save(aSecondParticipant.withToken('tokenYY').withStartNr(startNr++)))
        .then(participants.bulkmail)
        .then(() => {
          expect(mails.sendEmail).toHaveBeenCalledTimes(2);
          expect(mails.sendStatusEmail).toHaveBeenCalledTimes(2);
          let content = mails.sendEmail.calls.mostRecent().args[2];
          expect(content).toMatch(/Startnummer/);
          done();
        })
        .fail(fail);
    });
  });
})
;
