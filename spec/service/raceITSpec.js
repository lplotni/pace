'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail */

describe('race service', () => {

  const helper = require('../journeyHelper');
  const race = require('../../service/race');

  it('should return false if the race has not yet started', (done) => {
    race.resetStarttime()
      .then(function() {
        race.hasStarted()
          .then(function(result) {
            expect(result).toBe(false);
            done();
          });
    });
  });
  it('should return true if the race has started', (done) => {
    let starttime = Date.parse(Date());
    race.setStartTime(starttime)
      .then(function() {
        race.hasStarted()
          .then(function(result) {
            expect(result).toBe(true);
            done();
          });
      });
  });

  it('should store and read race start times', (done) => {
    let starttime = Date.parse(Date());
    race.setStartTime(starttime)
      .then(function() {
        race.startTime()
          .then(function(result){
            expect(String(starttime)).toEqual(result);
            done();
          })
          .fail(fail);
      });
  });


});
