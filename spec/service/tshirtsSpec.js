'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, afterAll, beforeEach, fail */

const mockery = require('mockery');
const Q = require('q');

describe('tshirt service', () => {
  describe('findAndAddTo()', () => {

    let tshirts, dbMock;

    let returnPromiseAndResolveWith = function (data) {
      function successResolve() {
        return Q.fcall(function () {
          return data;
        });
      }

      return successResolve;
    };

    let setupMocks = function () {

      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
      mockery.resetCache();
      mockery.registerAllowables(['q', '../../domain/participant.js']);

      dbMock = {
        select: jasmine.createSpy()
      };

      mockery.registerMock('../service/util/dbHelper', dbMock);

      tshirts = require('../../service/tshirts.js');
    };

    beforeEach(() => {
      setupMocks();
    });

    afterAll(() => {
      mockery.deregisterAll();
      mockery.disable();
    });

    let anySize = 'M';
    let anyModel = 'normal';
    let tshirtDetails = {id: 0, size: anySize, model: anyModel, participantId: 0};
    let anyParticipant = {};

    it('should not add tshirt if the participant did not order a tshirt', function (done) {
      let anyParticipant = {};
      dbMock.select.and.callFake(returnPromiseAndResolveWith([]));
      tshirts.findAndAddTo(anyParticipant).then(() => {
        expect(anyParticipant.tshirt).toBeUndefined();
        done();
      }).catch(done.fail);
    });

    it('should add the tshirt to a participant', function (done) {
      dbMock.select.and.callFake(returnPromiseAndResolveWith([tshirtDetails]));
      tshirts.findAndAddTo(anyParticipant).then(() => {
        expect(anyParticipant.tshirt).toEqual({size: anySize, model: anyModel});
        done();
      }).catch(done.fail);
    });
  });
});
