'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

const _ = require('lodash');
const moment = require('moment');
const Q = require('q');

describe('participants service', () => {

  const participants = require('../../service/participants');
  const tshirts = require('../../service/tshirts');
  const race = require('../../service/race');
  const startBlocks = require('../../service/startblocks');
  const mails = require('../../service/util/mails');
  const participant = require('../../domain/participant');
  const db = require('../../service/util/dbHelper');
  const helper = require('../journeyHelper');

  let startNr = 30;

  const secureId = 'some_secure_id';
  const paymentToken = 'a token';

  const aParticipant =
    participant.from({
      firstname: 'Hertha',
      lastname: 'Mustermann',
      email: 'h.mustermann@example.com',
      category: 'Unicorn',
      birthyear: 1980,
      visibility: 'yes',
      discount: 'free',
      team: 'Crazy runners',
      couponcode: 'Free2016',
      goal: 'relaxed'
    })
      .withToken(paymentToken)
      .withSecureId(secureId)
      .withStartBlock(0)
      .withRegistrationTime(moment('2013-02-08 09:30'));

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
      .then(participants.get.registered)
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
        expect(data[0].start_block).toBe(aParticipant.start_block);
        expect(data[0].goal).toBe(aParticipant.goal);
        expect(moment(data[0].registration_time).format('DD.MM.YYYY')).toBe(aParticipant.registrationTime.format('DD.MM.YYYY'));
        done();
      })
      .catch(done.fail);
  });

  describe('saveBlanc()', () => {
    it('should save a participant with blank values', (done) => {

      let startNumber = startNr++;
      participants.saveBlanc(startNumber).then(participantId => {
        expect(participantId).toBeDefined();
        participants.get.byId(participantId).then(participant => {
          expect(participant.firstname).toBe('');
          expect(participant.lastname).toBe('');
          expect(participant.team).toBe('');
          expect(participant.email).toBe('');
          expect(participant.birthyear).toBe(0);
          expect(participant.category).toBe('');
          expect(participant.visibility).toBe('yes');
          expect(participant.discount).toBe('no');

          expect(participant.has_payed).toBe(false);
          expect(participant.start_number).toBe(startNumber);
          expect(participant.start_block).toBe(null);
          expect(participant.secureid).toBeDefined();
          expect(participant.is_on_site_registration).toBe(true);
          expect(participant.goal).toBe('relaxed');
          done();
        });
      }).catch(done.fail);
    });

    it('should save multiple participants', function (done) {
      participants.saveBlancParticipants(5)
        .then(participants.get.blancParticipants)
        .then(participants => {
          expect(participants.length).toBe(5);
          done();
        }).catch(done.fail);
    });
  });

  describe('save()', () => {
    it('should return the id', (done) => {

      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          expect(participantId).toBeDefined();
          done();
        })
        .catch(done.fail);
    });
  });

  describe('byId()', () => {
    it('should return all information of the participant with given Id', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then(function (participantId) {
          participants.get.byId(participantId)
            .then(function (participant) {
              expectOnParticipantFields(participant, participantId);
              done();
            })
            .catch(done.fail);
        });
    });
  });

  describe('byStartnumber()', () => {
    it('should return all information of the participant with given Startnumber', (done) => {
      let number = startNr++;
      participants.save(aParticipant.withStartNr(number))
        .then(function (participantId) {
          participants.get.byStartnumber(number)
            .then(function (participant) {
              expectOnParticipantFields(participant, participantId);
              done();
            })
            .catch(done.fail);
        });
    });
  });

  describe('delete()', () => {
    it('should delete a user', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then((id) => {
          participants.delete(id).then(() => {
            participants.get.byId(id).then(() => {
              fail('Participant has not been deleted');
              done();
            }).catch(done);
          }).catch(done.fail);
        });
    });

    it('should delete users with tshirts', (done) => {
      participants.save(aParticipantWithTshirt.withStartNr(startNr++))
        .then((participantid) => {
          participants.delete(participantid).then(() => {
            tshirts.getFor(participantid).then((shirts) => {
              if (_.isEmpty(shirts)) {
                done();
              } else {
                fail('participant\'s tshirts have not been deleted');
                done();
              }
            });
          })
            .catch(done.fail);
        });
    });

    it('should give error if accessing deleted user', (done) => {
      participants.save(aParticipant.withStartNr(startNr++))
        .then((id) => {
          participants.delete(id).then(() => {
            participants.get.byId(id).catch(() => {
              done();
            });
          }).catch(done.fail);
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
            team: 'Crazy runners updated',
            start_block: 2,
            goal: 'ambitious'
          };
          participants.get.byId(id)
            .then((p) => {
              participants.update(updatedParticipant, p.secureid)
                .then(() => {
                  participants.get.byId(id)
                    .then(function (participant) {
                      expect(participant.firstname).toBe('Hertha updated');
                      expect(participant.lastname).toBe('Mustermann updated');
                      expect(participant.email).toBe('h.mustermann@example.com updated');
                      expect(participant.category).toBe('Unicorn updated');
                      expect(participant.birthyear).toBe(1981);
                      expect(participant.team).toBe('Crazy runners updated');
                      expect(participant.start_block).toBe(2);
                      expect(participant.goal).toBe('ambitious');
                      done();
                    })
                    .catch(done.fail);
                });
            });
        });
    });
  });

  describe('markPayed()', () => {
    it('should change the payment status of the participant to true', (done) => {
      participants.saveBlanc(startNr++)
        .then((id) => participants.markPayed(id))
        .then((id) => participants.get.byId(id))
        .then((participant) => {
          expect(participant.has_payed).toBe(true);
          done();
        })
        .catch(done.fail);
    });

    it('should set the confrimation_time', (done) => {
      participants.saveBlanc(startNr++)
        .then((id) => participants.markPayed(id))
        .then((id) => participants.get.byId(id))
        .then((participant) => {
          expect(moment(participant.confirmation_time).format('DD.MM.YYYY')).toBe(moment().format('DD.MM.YYYY'));
          done();
        })
        .catch(done.fail);
    });
  });

  describe('blancParticipants()', () => {
    it('returns only participants which are on-site registrations', (done) => {
      startNr++;
      participants.save(aParticipant.withStartNr(startNr))
        .then(participants.saveBlanc)
        .then(participants.get.blancParticipants).then(function (data) {
        expect(data.length).toBe(1);
        done();
      })
        .catch(done.fail);
    });
  });

  describe('assign()', () => {
    it('uses provided block distribution to assign start blocks to participants', (done) => {
      let blockDistribution = [1, 2];
      Q.all([
        participants.save(aParticipant.withStartNr(startNr++).withToken("1")),
        participants.save(aParticipant.withStartNr(startNr++).withToken("2")),
        participants.save(aParticipant.withStartNr(startNr++).withToken("3"))
      ])
        .then(() => {
          return participants.assign(blockDistribution);
        })
        .then(() => {
          return db.select('select count(DISTINCT start_block) as count from participants');
        })
        .then((distinct_startblocks) => {
            expect(parseInt(distinct_startblocks[0].count)).toBe(blockDistribution.length);
            done();
        })
        .catch(done.fail);
    });
  });

  describe('forDataTables()', () => {
    const participantToBeHiddenByPageLimit = participant.from(aParticipant)
      .with({team: 'Filtered X'})
      .withToken('ptoken 4')
      .withStartNr(startNr++);
    const participantToBeFilteredByFirstName = participant.from(aParticipant)
      .with({firstname: 'Filtered X'})
      .withToken('ptoken 1')
      .withStartNr(startNr++);
    const participantToBeFilteredByLastName = participant.from(aParticipant)
      .with({lastname: 'Filtered X'})
      .withToken('ptoken 2')
      .withStartNr(startNr++);
    const participantToBeFilteredByTeam = participant.from(aParticipant)
      .with({team: 'Filtered X'})
      .withToken('ptoken 3')
      .withStartNr(startNr++);

    beforeEach((done) => {
      participants
        .save(aParticipant.withStartNr(startNr++).withToken('ptoken 10'))
        .then(participants.markPayed)
        .then(() => participants.save(participantToBeFilteredByFirstName))
        .then(participants.markPayed)
        .then(() => participants.save(participantToBeFilteredByLastName))
        .then(participants.markPayed)
        .then(() => participants.save(participantToBeFilteredByTeam))
        .then(participants.markPayed)
        .then(() => participants.save(participantToBeHiddenByPageLimit))
        .then(participants.markPayed)
        .then(done)
        .catch(done.fail);
    });

    it('returns only participants which match the filter', (done) => {
      participants.get.forDataTables(0, 3, 'Filtered', 'START_NUMBER DESC')
        .then(function (data) {
          expect(data.numberOfAllRecords).toBe(5);
          expect(data.numberOfRecordsAfterFilter).toBe(4);
          expect(data.records.length).toBe(3);
          expect(data.records[2].firstname).toBe('Filtered X');
          expect(data.records[2].start_number).toBe(participantToBeFilteredByFirstName.start_number);
          expect(data.records[1].lastname).toBe('Filtered X');
          expect(data.records[1].start_number).toBe(participantToBeFilteredByLastName.start_number);
          expect(data.records[0].team).toBe('Filtered X');
          expect(data.records[0].start_number).toBe(participantToBeFilteredByTeam.start_number);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('insertTime', () => {
    it('should add the time to a participant with given start number', (done) => {
      let time = '10:32:32';
      let nr = startNr++;
      participants.save(aParticipant.withStartNr(nr))
        .then((participantid) => {
          startBlocks.add('36000', 'startblock 1')
            .then(() => participants.insertTime(nr, time))
            .then(() => participants.get.byId(participantid))
            .then((participant) => {
              expect(participant.time).toBe('37952');
              expect(participant.seconds).toBe('1952');
              done();
            })
            .catch(done.fail);
        });
    });

    it('should not save if time is slower than saved time', (done) => {
      let time = '10:32:32';
      let slower_time = '11:32:32';
      let nr = startNr++;
      participants.save(aParticipant.withStartNr(nr))
        .then((participantid) => {
          startBlocks.add('36000', 'startblock 1')
            .then(() => participants.insertTime(nr, time))
            .then(() => participants.get.byId(participantid))
            .then((participant) => {
              let saved_time = participant.time;
              participants.insertTime(nr, slower_time)
                .then(() => participants.get.byId(participantid))
                .then((new_participant) => {
                  expect(saved_time).toBe(new_participant.time);
                  done();
                })
                .catch(done.fail);
            })
            .catch(done.fail);
        });
    });

  });

  describe('rank', () => {
    it('should return the rank of a participant with given start number', (done) => {
      let time = '10:32:32';
      let nr = startNr++;
      participants.save(aParticipant.withStartNr(nr).withStartBlock(0))
        .then(() => {
          startBlocks.add('36000', 'startblock 1')
            .then(() => participants.insertTime(nr, time))
            .then(() => participants.rank(nr))
            .then((rank) => {
              expect(rank).toBe('1');
              done();
            })
            .catch(done.fail);
        });
    });
    it('should return the rank of a participant with given start number only for the participants category', (done) => {
      let time = '10:32:32';
      let nr = startNr++;
      participants.save(aParticipant.withStartNr(nr).withStartBlock(0))
        .then(() => {
          startBlocks.add('36000', 'startblock 1')
            .then(() => participants.insertTime(nr, time))
            .then(() => participants.rankByCategory(nr))
            .then((rank) => {
              expect(rank).toBe('1');
              done();
            })
            .catch(done.fail);
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
        .catch(done.fail);
    });
  });

});
