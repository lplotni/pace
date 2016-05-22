'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const timeCalculator = require('../../domain/timeCalculator');
const _ = require('lodash');
const moment = require('moment');

describe('timeCalculator service', () => {
  const now = moment();
  const startTimes = {block1: now.unix(), block2: _.cloneDeep(now).add(30, 'm').unix()};


  describe('getCorrectStartTime', () => {
    it('returns relative time', () => {
      let finishTime = _.cloneDeep(now).add(31, 'm').add(29, 's').unix();
      
      let result = timeCalculator.relativeTime(startTimes, finishTime, 1);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(31);
      expect(result[2]).toBe(29);
    });

    it('uses correct block start time', () => {
      let finishTime = _.cloneDeep(now).add(45, 'm').unix();
      
      let result = timeCalculator.relativeTime(startTimes, finishTime, 1001);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(15);
      expect(result[2]).toBe(0);
    });
  });

  describe('getCorrectStartTime', () => {

    it('returns correct block start time for #1', () => {
      expect(timeCalculator.getCorrectStartTime(startTimes, 1)).toBe(startTimes.block1);
    });

    it('returns correct block start time for #1000', () => {
      expect(timeCalculator.getCorrectStartTime(startTimes, 1000)).toBe(startTimes.block1);
    });

    it('returns correct block start time for #1001', () => {
      expect(timeCalculator.getCorrectStartTime(startTimes, 1001)).toBe(startTimes.block2);
    });

    it('returns correct block start time for #2001', () => {
      expect(timeCalculator.getCorrectStartTime(startTimes, 2001)).toBe(startTimes.block2);
    });
  });
});
