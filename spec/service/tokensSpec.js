'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
const mockery = require('mockery');
const Q = require('q');

const secureId = 'secureId';

describe('token service', () => {

    let tokens, dbHelperMock;

    beforeEach(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });

      mockery.resetCache();

      dbHelperMock = {
        select: jasmine.createSpy(),
        insert: jasmine.createSpy()
      };

      mockery.registerMock('../service/util/dbHelper', dbHelperMock);

      mockery.registerAllowables(['q', '../../service/util/dbHelper.js']);
      tokens = require('../../service/tokens');
      dbHelperMock.select.and.returnValue(Q.fcall(() => []));
      dbHelperMock.insert.and.returnValue(Q.fcall(() => 'some id'));
    });

    describe('createUniqueToken', () => {
      it('returns a string with 5 upper case characters', (done) => {

        tokens.createUniqueToken()
          .then((uniqueToken) => {
            expect(uniqueToken.length).toBe(5);
            expect(uniqueToken).toBe(uniqueToken.toUpperCase());
            done();
          })
          .fail(fail);
      });

      it('checks if the token exists in the DB', (done) => {
        tokens.createUniqueToken().then((uniqueToken) => {
          expect(dbHelperMock.select).toHaveBeenCalledWith('select * from participants where paymenttoken like $1', [uniqueToken]);
          done();
        }).fail(fail);
      });

      it('regenerates the token if already present in the DB', (done) => {
        let callCounter = 0;

        function fakeSelect() {
          if (callCounter === 0) {
            callCounter = callCounter + 1;
            return Q.fcall(() => ['someToken']);
          }
          return Q.fcall(() => []);
        }

        dbHelperMock.select.and.callFake(fakeSelect);

        tokens.createUniqueToken().then((uniqueToken) => {
          expect(uniqueToken).toBeDefined();
          expect(dbHelperMock.select.calls.count()).toBe(2);
          done();
        });
      });
    });

  }
);
