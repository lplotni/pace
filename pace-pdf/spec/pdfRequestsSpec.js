'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global jasmine, describe, it, expect, afterAll, beforeEach, fail */

const pdfRequests = require('../pdfRequests');

describe('pdfRequests', () => {

  let redisStub = (() => {
    let channels = [];
    let registeredEvents = [];
    let stub = {};

    stub.subscribe = (channel, handler) => {
      channels.push(channel);
    };

    stub.on = (event, handler) => {
      registeredEvents.push(event);
    };

    stub.channels = () => channels;
    stub.registeredEvents = () => registeredEvents;

    stub.reset = () => {
      channels.length = 0;
      registeredEvents.length = 0;
    };

    return stub;
  })();


  describe('setup', () => {

    beforeEach(() => {
      redisStub.reset();
    });

    it('subscribes to correct pace-pdf channel', () => {
      pdfRequests.setup(redisStub);

      expect(redisStub.channels()).toEqual(['pace-pdf']);
    });


    it('should register the handler for pdf-request', () => {
      pdfRequests.setup(redisStub);

      expect(redisStub.registeredEvents()).toEqual(['message']);
    });
  });
  describe('parse', () => {

    it('converts message to correct format', () => {
      let pdfRequestJson = {
        startNumber: '1234',
        firstname: 'Digital',
        team: 'Unicorns',
        startBlock: '1',
        tshirt: {
          size: 'S',
          model: 'unisex'
        },
        hasPayed: true,
        onSiteRegistration: false,
        secureUrl:'https://example.com/asjkd12234'
      };

      let res = pdfRequests.parse(JSON.stringify(pdfRequestJson));

      expect(res.startNumber).toEqual('1234');
      expect(res.firstname).toEqual('Digital');
      expect(res.team).toEqual('Unicorns');
      expect(res.startBlock).toEqual('1');
      expect(res.tshirt).toEqual({size: 'S', model: 'unisex'});
      expect(res.hasPayed).toEqual(true);
      expect(res.onSiteRegistration).toEqual(false);
      expect(res.secureUrl).toEqual('https://example.com/asjkd12234');
    });

  });
});