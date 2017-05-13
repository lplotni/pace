'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const mockery = require('mockery');
const Q = require('q');

describe('startblock service', () => {

    let startblocks, dbHelperMock, participants;

    beforeEach(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      mockery.resetCache();

      dbHelperMock = {
        select: jasmine.createSpy(),
      };

      participants = {
        get: {
            all: jasmine.createSpy()
        }
      };

      mockery.registerMock('../service/util/dbHelper', dbHelperMock);
      mockery.registerMock('../service/participants', participants);

      mockery.registerAllowables(['q', '../../service/util/dbHelper.js']);
      startblocks = require('../../service/startblocks');
      dbHelperMock.select.and.returnValue(Q.fcall(() => [{},{},{}]));
      participants.get.all.and.returnValue(Q.fcall(() => [{goal:'relaxed'},{goal:'ambitious'},{goal:'ambitious'},{goal:'moderate'},{goal:'moderate'},{goal:'moderate'},{goal:'relaxed'}]));
    });

    afterAll(() => {
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('assign()', () => {
      it('returns a suitable startblock', (done) => {
        startblocks.assign()
          .then((distribution) => {
            expect(distribution.length).toBe(3);
            expect(distribution[0]).toBe(2);
            expect(distribution[1]).toBe(2);
            expect(distribution[2]).toBe(3);
            done();
          })
          .catch(done.fail);
      });
    });
  }
);
