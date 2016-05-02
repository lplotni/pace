'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, afterAll, it, expect, fail */

describe('race service', () => {

  const helper = require('../journeyHelper');
  const race = require('../../service/race');

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
    let starttime = Date.parse(new Date());
    race.setStartTime(starttime)
      .then(race.hasStarted)
      .then(function (result) {
        expect(result).toBe(true);
        done();
      })
      .catch(done.fail);
  });

  it('should store and read race start times', (done) => {
    let starttime = Date.parse(new Date());
    race.setStartTime(starttime)
      .then(race.startTime)
      .then((result) => {
        expect(String(starttime)).toEqual(result);
        done();
      })
      .catch(done.fail);
  });


/*  describe('result list', () => {*/
    //it('should show the first', (done) => {
      //let time = '10:32:32';
      //let nr = 1;
      //let starttime = Date.parse(new Date());
      //participants.save(aParticipant.withStartNr(nr))
      //.then(() => race.setStartTime(starttime))
      //.then(() => participants.insertTime(nr,time))
   ////   .then(() => race.results('Unicorn',1970,1990))
      //.then((result) => {
         //expect(result.length).toBe(1); 
         //done();
      //})
      //.catch(done.fail);
    //});
  //});

})
;
