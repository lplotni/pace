'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, afterAll, it, expect, fail */

describe('race service', () => {

  const helper = require('../journeyHelper');
  const race = require('../../service/race');
  const participant = require('../../domain/participant');
  const participants = require('../../service/participants');
  const startBlocks = require('../../service/startblocks');

  beforeAll((done) => {
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    helper.closeDbConnection(done);
  });


  describe('result list', () => {
    const aParticipant = participant.from({
      firstname: 'Hertha',
      lastname: 'Mustermann',
      email: 'h.mustermann@example.com',
      category: 'Unicorn',
      birthyear: 1980,
      visibility: 'yes',
      discount: 'free',
      team: 'Crazy runners',
      couponcode: 'Free2016'
    }).withToken('someToken').withSecureId('someCrazySecureId');
    const aParticipantWithDifferentAge = participant.from(aParticipant)
      .with({
        birthyear: 1987
      })
      .withToken('sectoken 1')
      .withStartBlock(0)
      .withConfirmedResult(false)
      .withStartNr(10);
    const aParticipantWithDifferentCategory = participant.from(aParticipant)
      .with({
        category: 'Horse'
      })
      .withToken('sectoken 2')
      .withStartBlock(0)
      .withConfirmedResult(false)
      .withStartNr(11);
    const aParticipantWithDifferentTeam = participant.from(aParticipant)
      .with({
        team: 'Team 4711'
      })
      .withToken('sectoken 3')
      .withStartBlock(0)
      .withConfirmedResult(false)
      .withStartNr(12);
    const aParticipantWithDifferentStartblock = participant.from(aParticipant)
      .with({
        team: 'Slow team'
      })
      .withToken('sectoken 4')
      .withStartBlock(1)
      .withConfirmedResult(false)
      .withStartNr(13);
    const aConfirmedParticipantWithDifferentStartblock = participant.from(aParticipant)
      .with({
        team: 'Slow team'
      })
      .withToken('sectoken 5')
      .withSecureId('14-secureid')
      .withStartBlock(1)
      .withStartNr(14);


    beforeAll((done) => {
      let time = '10:32:02';
      let nr = 1;
      participants.save(aParticipant.withStartNr(nr).withStartBlock(0))
        .then(() => startBlocks.add( '36000', 'startblock 1'))
        .then(() => startBlocks.add( '37000', 'startblock 2'))
        .then(() => participants.insertTime(nr, time))
        .then(() => participants.save(aParticipantWithDifferentAge))
        .then(() => participants.insertTime(aParticipantWithDifferentAge.start_number,
          '10:33:00'))
        .then(() => participants.save(aParticipantWithDifferentCategory))
        .then(() => participants.insertTime(aParticipantWithDifferentCategory.start_number,
          '10:34:00'))
        .then(() => participants.save(aParticipantWithDifferentTeam))
        .then(() => participants.insertTime(aParticipantWithDifferentTeam.start_number,
          '10:35:00'))
        .then(() => participants.save(aParticipantWithDifferentStartblock))
        .then(() => participants.insertTime(aParticipantWithDifferentStartblock.start_number,
          '10:36:00'))
        .then(() => participants.save(aConfirmedParticipantWithDifferentStartblock))
        .then(() => participants.insertTime(aConfirmedParticipantWithDifferentStartblock.start_number,
          '10:56:30'))
        .then(() => participants.confirm_result(aConfirmedParticipantWithDifferentStartblock.secureID))
        .then(done)
        .catch((err) => {
          console.log("err", err);
          done.fail();
        });
    });

    it('should show the first', (done) => {
      race.results('Unicorn', 1970, 1990)
        .then((result) => {
          expect(result.length).toBe(4);
          expect(result[0].timestring).toBe('00:32:02');
          done();
        })
        .catch(done.fail);
    });

    it('should show the first and filter for DataTables', (done) => {
      race.resultsForDataTables(0, 2, 'Crazy runn', 'START_NUMBER ASC', 'Unicorn', 1975,
          1985)
        .then((result) => {
          expect(result.numberOfAllRecords).toBe(3);
          expect(result.numberOfRecordsAfterFilter).toBe(1);
          expect(result.records[0].firstname).toBe('Hertha');
          expect(result.records[0].team).toBe('Crazy runners');
          done();
        })
        .catch(done.fail);
    });
  });

});
