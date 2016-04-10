'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

const _ = require('lodash');

describe('participants service', () => {

  const participants = require('../../service/participants');
  const tshirts = require('../../service/tshirts');
  const mails = require('../../service/util/mails');
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
    discount: 'free',
    team: 'Crazy runners',
    couponcode: 'Free2016',
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
    expect(participantFromDb.couponcode).toEqual(aParticipant.couponcode);
  };

  beforeEach((done) => {
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    helper.closeDbConnection(done);
  });


  it('should store and read participants', (done) => {
    participants.save(aParticipant.withStartNr(startNr++))
      .then(participants.registered)
      .then(function (data) {
        expect(data.length).toBe(1);
        expect(data[0].firstname).toBe(aParticipant.firstname);
        expect(data[0].lastname).toBe(aParticipant.lastname);
        expect(data[0].email).toBe(aParticipant.email);
        expect(data[0].category).toBe(aParticipant.category);
        expect(data[0].birthyear).toBe(aParticipant.birthyear);
        expect(data[0].discount).toBe(aParticipant.discount);
        expect(data[0].team).toBe(aParticipant.team);
        expect(data[0].couponcode).toBe(aParticipant.couponcode);
        done();
      })
      .fail(fail);
  });

  describe('saveBlancParticipant()', () => {
    it('should save a participant with blank values', (done) => {

      participants.saveBlancParticipant().then( participantId => {
        expect(participantId).toBeDefined();
        participants.byId(participantId).then( participant => {
          expect(participant.firstname).toBe('');
          expect(participant.lastname).toBe('');
          expect(participant.team).toBe('');
          expect(participant.email).toBe('');
          expect(participant.birthyear).toBe(0);
          expect(participant.category).toBe('');
          expect(participant.visibility).toBe('yes');
          expect(participant.discount).toBe('no');

          expect(participant.has_payed).toBe(false);
          expect(participant.start_number).toBeDefined();
          expect(participant.secureid).toBeDefined();
          expect(participant.is_on_site_registration).toBe(true);
          done();
        });
      });
    });

  });

  describe('save()', () => {
    it('should return the id', (done) => {

      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          expect(participantId).toBeDefined();
          done();
        })
        .fail(fail);
    });
  });

  describe('byId()', () => {
    it('should return all information of the participant with given Id', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          participants.byId(participantId)
            .then(function (participant) {
              expectOnParticipantFields(participant, participantId);
              done();
            })
            .fail(fail);
        });
    });
  });

  describe('byToken()', () => {
    it('should return participant\'s lastname and firstname and ordered tshirt for a given token', (done) => {
      participants.save(aParticipantWithTshirt.withStartNr(startNr++))
        .then(function (participantId) {
          tshirts.addFor(aParticipantWithTshirt.tshirt, participantId)
            .then(() => {
              participants.byToken(paymentToken)
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

  describe('bySecureId()', () => {
    it('should return all information of the participant with given secureId', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          participants.bySecureId(secureId)
            .then(function (participant) {
              expectOnParticipantFields(participant, participantId);
              done();
            })
            .fail(fail);
        });
    });
  });

  describe('delete()', () => {
    it('should delete a user', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then((id) => {
          participants.delete(id).then(() => {
            participants.byId(id).then(() => {
              fail('Participant has not been deleted');
              done();
            }).catch(done);
          }).fail(fail);
        });
    });

    it('should delete users with tshirts', (done) => {
      participants.save(aParticipantWithTshirt.withStartNr(startNr++))
        .then((participantid) => {
          participants.delete(participantid).then(() => {
              tshirts.getFor(participantid).then((shirts)=>{
               if(_.isEmpty(shirts))   {
                 done();
               } else {
                 fail('participant\'s tshirts have not been deleted');
                 done();
               }
              });
            })
            .fail(fail);
        });
    });

    it('should give error if accessing deleted user', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then((id) => {
          participants.delete(id).then(() => {
            participants.byId(id).catch(() => {
              done();
            });
          }).fail(fail);
        });
    });
  });

  describe('update()', () => {
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
          participants.byId(id)
            .then((p) => {
              participants.update(updatedParticipant, p.secureid)
                .then(() => {
                  participants.byId(id)
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

  describe('publiclyVisible()', () => {
    it('returns only participants which are confirmed and OK with being visible to the public', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then(participants.markPayed)
        .then(participants.publiclyVisible)
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

  describe('blancParticipants()', () => {
    it('returns only participants which are on-site registrations', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then(participants.saveBlancParticipant)
          .then(participants.blancParticipants).then(function (data) {
            expect(data.length).toBe(1);
            done();
          })
          .fail(fail);
        });
    });
  });

  describe('insertTime', () => {
    it('should add the time to a participant with given start number', (done) => {
      let time = '10:32:32';
      participants.save(aParticipant.withStartNr(startNr))
        .then(function(participantid) {
          participants.insertTime(startNr++,time)
          .then(function(result) {
            participants.byId(participantid)
              .then(function(participant) {
                expect(participant.time).toBeDefined();
                done();
              });
          });
        });
    });

    xit('should not add the time to a participant when given time is larger than exisiting one', (done) => {
      let time = '00:32:32';
      let longer_time = '01:32:32';
      participants.save(aParticipant.withStartNr(startNr))
        .then(function(participantid) {
          participants.insertTime(startNr,time)
            .then(function() {
              participants.insertTime(startNr,longer_time)
              .then(function() {
                  expect(participant.time).toEqual(time);
                  done();
              });
            });
        });
    });
  });

  describe('bulkmail()', () => {
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
});
