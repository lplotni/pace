'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('race service', () => {

  const helper = require('../journeyHelper');
  const race = require('../../service/race');

  beforeEach((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterAll((done) => {
    helper.resetToOriginalTimeout();
    helper.closeDbConnection(done);
  });

  it('should store and read race start times', (done) => {
    let starttime = Date.parse(Date());
    race.setStartTime(starttime)
      .then(function () {
        race.startTime()
          .then(function(result){
            expect(String(starttime)).toEqual(result);
            done();
          })
          .fail(fail);
      });
  });

  it('should tell if race has started', (done) => {
    race.hasStarted()
      .then(function(result) {
        expect(result).toBe(false)
        done();
      });
  });
})
;
