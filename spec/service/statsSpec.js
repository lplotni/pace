'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine */
describe('stats', () => {
  const stats = require('../../service/stats');

  describe('slimShirts()', () => {
    it('should return numbers for all sizes of slim shirts', () => {
      let slimShirts = stats.slimShirts(
        [
          {amount: '4', category: 'm', model: 'Slim fit', size: 'XS'},
          {amount: '40', category: 'm', model: 'Slim fit', size: 'S'},
          {amount: '50', category: 'm', model: 'Slim fit', size: 'M'},
          {amount: '60', category: 'm', model: 'Slim fit', size: 'L'},
        ]);

      expect(slimShirts.xs).toBe(4);
      expect(slimShirts.s).toBe(40);
      expect(slimShirts.m).toBe(50);
      expect(slimShirts.l).toBe(60);
    });

    it('should return 0 if size not present', () => {
      let slimShirts = stats.slimShirts(
        [
          {amount: '4', category: 'm', model: 'Slim fit', size: 'XS'},
          {amount: '40', category: 'm', model: 'Slim fit', size: 'S'},
          {amount: '60', category: 'm', model: 'Slim fit', size: 'L'},
        ]);

      expect(slimShirts.xs).toBe(4);
      expect(slimShirts.s).toBe(40);
      expect(slimShirts.m).toBe(0);
      expect(slimShirts.l).toBe(60);
    });

    it('should return numbers only for the slim shirts', () => {
      let slimShirts = stats.slimShirts(
        [
          {amount: '4', category: 'm', model: 'Slim fit', size: 'XS'},
          {amount: '40', category: 'm', model: 'Regular', size: 'S'},
        ]);

      expect(slimShirts.xs).toBe(4);
      expect(slimShirts.s).toBe(0);
      expect(slimShirts.m).toBe(0);
      expect(slimShirts.l).toBe(0);

    });
  });

  describe('reqularShirts()', () => {
    it('should return numbers for all sizes of reqular shirts', () => {
      let shirts = stats.reqularShirts(
        [
          {amount: '4', category: 'm', model: 'Regular', size: 'S'},
          {amount: '50', category: 'm', model: 'Regular', size: 'M'},
          {amount: '60', category: 'm', model: 'Regular', size: 'L'},
          {amount: '70', category: 'm', model: 'Regular', size: 'XL'}
        ]);

      expect(shirts.s).toBe(4);
      expect(shirts.m).toBe(50);
      expect(shirts.l).toBe(60);
      expect(shirts.xl).toBe(70);
    });

    it('should return 0 if size not present', () => {
      let shirts = stats.reqularShirts(
        [
          {amount: '40', category: 'm', model: 'Regular', size: 'S'},
          {amount: '60', category: 'm', model: 'Regular', size: 'L'},
        ]);

      expect(shirts.s).toBe(40);
      expect(shirts.m).toBe(0);
      expect(shirts.l).toBe(60);
    });

    it('should return numbers only for the reqular shirts', () => {
      let shirts = stats.reqularShirts(
        [
          {amount: '4', category: 'm', model: 'Slim fit', size: 'XS'},
          {amount: '40', category: 'm', model: 'Regular', size: 'S'},
        ]);

      expect(shirts.xs).toBeUndefined();
      expect(shirts.s).toBe(40);
      expect(shirts.m).toBe(0);
      expect(shirts.l).toBe(0);
      expect(shirts.xl).toBe(0);

    });
  });

});
