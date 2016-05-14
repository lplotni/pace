'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const timeCalculator = require('../../domain/timeCalculator');

describe('timeCalculator service', () => {
  it('returns relative time', () => {
    let relative_time = timeCalculator.relativeTime('1464678000', '1464679889');
    expect(relative_time[0]).toBe(0);
    expect(relative_time[1]).toBe(31);
    expect(relative_time[2]).toBe(29);
  });
});
