'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, it, expect */
describe('tshirt', () => {

  let tshirt = require('../../domain/tshirt.js');

  describe('from()', () => {
    const body = {
      shirt: 'Yes',
      size: 'XL',
      model: 'SlimFit'
    };


    it('should read size from the request body', () => {
      expect(tshirt.from(body).details[0].size).toBe('XL');
    });

    it('should throw an error if no size can be found', () => {
      function callWithNoSize() {
        tshirt.from({shirt: 'Yes', model: 'XX'});
      }

      expect(callWithNoSize).toThrow();
    });

    it('should read model from the request body', () => {
      expect(tshirt.from(body).details[0].model).toBe('SlimFit');
    });

    it('should throw an error if no model can be found', () => {
      function callWithNoModel() {
        tshirt.from({shirt: 'Yes', size: 'XL'});
      }

      expect(callWithNoModel).toThrow();
    });

    it('should return empty object if shirt not wished', () => {
      expect(tshirt.from({})).toEqual(jasmine.objectContaining({ amount: 0 }));
    });
  });

});
