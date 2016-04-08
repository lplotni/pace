'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const Q = require('q');
const mockery = require('mockery');

describe('startNumbers service', () => {

  let startNumbers, dbHelperMock;

  beforeEach(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    mockery.resetCache();

    dbHelperMock = {
      select: jasmine.createSpy()
    };

    mockery.registerMock('../service/util/dbHelper', dbHelperMock);
    mockery.registerAllowables(['../../service/util/dbHelper.js']);
    startNumbers = require('../../service/startNumbers');
  });

  describe('next()', ()=> {
    it('returns 1 if there are no participants in the database', (done) => {
      dbHelperMock.select.and.returnValue(Q.fcall(() => [{'max': null}]));
      startNumbers.next().then((startNr) => {
        expect(startNr).toBe(1);
        done();
      });
    });

    it('returns +1 to the previous number', (done) => {
      dbHelperMock.select.and.returnValue(Q.fcall(() => [{'max': 221}]));

      startNumbers.next().then((startNr) => {
        expect(startNr).toBe(222);
        done();
      });

    });

    it('skips blacklisted numbers as start number', (done) => {
      [18, 28, 74, 84, 88, 444, 191, 192, 198, 420, 1919, 1933, 1488, 1681].forEach((blacklisted) => {
          dbHelperMock.select.and.returnValue(Q.fcall(() => [blacklisted-1]));

          startNumbers.next().then((startNr) => {
            expect(startNr).not.toBe(blacklisted);
            done();
          });
        }
      );

    });

  });
});