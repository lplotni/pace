'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const timeCalculator = require('../../domain/timeCalculator');
const _ = require('lodash');
const moment = require('moment');

describe('timeCalculator service', () => {
  const now = moment();
  const startTimes = [ now.unix() ];
  const finishTime = _.cloneDeep(now).add(31, 'm').add(29, 's').unix();

    it('returns relative time', () => {
      let result = timeCalculator.relativeTime(startTimes, finishTime, 0);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(31);
      expect(result[2]).toBe(29);
    });

    it('returns relative seconds', () => {
      let result = timeCalculator.relativeSeconds(startTimes, finishTime, 0);
      expect(result).toBe(1889);
    });
});
