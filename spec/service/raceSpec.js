'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, afterAll, spyOn, it, expect, fail, jasmine */
const Q = require('q');
const moment = require('moment');
const mockery = require('mockery');

describe('race service', () => {

  let race, dbMock;

  beforeAll(() => {
    mockery.enable({useCleanCache: true, warnOnReplace: false, warnOnUnregistered: false});
    mockery.resetCache();

    dbMock = {
      select: jasmine.createSpy()
    };
    mockery.registerMock('../service/util/dbHelper', dbMock);

    mockery.registerAllowables(['q', 'lodash', 'moment', 'fast-csv', '../domain/timeCalculator']);

    race = require('../../service/race');

  });

  afterAll(() => {
    mockery.deregisterAll();
    mockery.disable();
  });


  it('opens csv files', (done) => {
    race.parse('spec/service/results.csv')
      .then((data) => {
        expect(data[1]).toBe('09:24:04');
        done();
      })
      .catch(done.fail);
  });

  it('returns also formated HH:MM startTimes', (done) => {
    let block1 = moment();
    let block2 = moment().add(30, 'm');

    const startTimes = [ { times: `{"block1": ${block1.unix()}, "block2": ${block2.unix()}}` } ];
    dbMock.select.and.returnValue(Q.fcall(() => startTimes));

    race.startTimesAsHHMM().then(formattedTimed => {
      expect(formattedTimed.block1).toBe(block1.format('hh:mm'));
      expect(formattedTimed.block2).toBe(block2.format('hh:mm'));
      done();
    }).catch(done.fail);
  });
});
