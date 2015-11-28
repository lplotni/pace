'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, it, expect */
describe('tshirt', function () {

  var tshirt = require('../../domain/tshirt.js');

  describe('from()', function () {
    const body = {
      shirt: 'Yes',
      size: 'XL',
      model: 'SlimFit'
    };


    it('should read size from the request body', function () {
      expect(tshirt.from(body).size).toBe('XL');
    });

    it('should throw an error if no size can be found', function () {
      function callWithNoSize() {
        tshirt.from({shirt: 'Yes', model: 'XX'});
      }

      expect(callWithNoSize).toThrow();
    });

    it('should read model from the request body', function () {
      expect(tshirt.from(body).model).toBe('SlimFit');
    });

    it('should throw an error if no model can be found', function () {
      function callWithNoModel() {
        tshirt.from({shirt: 'Yes', size: 'XL'});
      }

      expect(callWithNoModel).toThrow();
    });

    it('should return empty object if shirt not wished', function () {
      expect(tshirt.from({shirt: undefined})).toEqual({});
    });
  });

});