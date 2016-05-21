'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, afterAll, it, expect, fail */

describe('race service', () => {

  const helper = require('../journeyHelper');
  const race = require('../../service/race');
  const participant = require('../../domain/participant');
  const participants = require('../../service/participants');

  beforeAll((done) => {
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    helper.closeDbConnection(done);
  });

  it('should return false if the race has not yet started', (done) => {
    race.resetStarttime()
      .then(race.hasStarted)
      .then((result) => {
        expect(result).toBe(false);
        done();
      })
      .catch(done.fail);
  });

  it('should return true if the race has started', (done) => {
    let startTimes = {
      block1: Date.parse(new Date()),
      block2: Date.parse(new Date())
    };

    race.setStartTime(startTimes)
      .then(race.hasStarted)
      .then(function (result) {
        expect(result).toBe(true);
        done();
      })
      .catch(done.fail);
  });

  it('should store and read race start times', (done) => {
    let startTimes = {
      block1: Date.parse(new Date()),
      block2: Date.parse(new Date())
    };

    race.setStartTime(startTimes)
      .then(race.startTime)
      .then((result) => {
        expect(startTimes.block1).toEqual(result.block1);
        expect(startTimes.block2).toEqual(result.block2);
        done();
      })
      .catch(done.fail);
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


    it('should show the first', (done) => {
      let time = '10:32:32';
      let nr = 1;
      let startTimes = {
        block1: Date.parse(new Date()),
        block2: Date.parse(new Date())
      };
      
      participants.save(aParticipant.withStartNr(nr))
        .then(() => race.setStartTime(startTimes))
        .then(() => participants.insertTime(nr, time))
        .then(() => race.results('Unicorn', 1970, 1990))
        .then((result) => {
          expect(result.length).toBe(1);
          done();
        })
        .catch(done.fail);
    });
  });

})
;
