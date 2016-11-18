'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const mockery = require('mockery');
const Q = require('q');

describe('startblock service', () => {

    let startblocks, dbHelperMock;

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

      mockery.registerMock('../service/util/dbHelper', dbHelperMock);

      mockery.registerAllowables(['q', '../../service/util/dbHelper.js']);
      startblocks = require('../../service/startblocks');
      dbHelperMock.select.and.returnValue(Q.fcall(() => [1]));
    });

    afterAll(() => {
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('best_block()', () => {
      it('returns a suitable startblock', (done) => {
        startblocks.best_block()
          .then((block) => {
            expect(block).toBe(1);
            done();
          })
          .catch(done.fail);
      });
    });
  }
);
