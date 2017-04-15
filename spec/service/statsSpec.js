'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, spyOn, it, expect, fail, jasmine, xit */
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

  describe('usagesPerDay()', () => {
    it('should combine registrations and confirmations per day', () => {

      let registrations = [{count: 1, formatted_time: '21.01.2017'}];
      let confirmations = [{count: 1, formatted_time: '21.01.2017'}];

      let usages = stats.usagePerDay(registrations, confirmations);

      expect(usages.dates).toEqual(['21.01.2017']);
      expect(usages.confirmations).toEqual([1]);
      expect(usages.registrations).toEqual([1]);

    });

    it('should deal with no confirmations', () => {

      let registrations = [{count: 1, formatted_time: '21.01.2017'}];
      let confirmations = [];

      let usages = stats.usagePerDay(registrations, confirmations);

      expect(usages.dates).toEqual(['21.01.2017']);
      expect(usages.confirmations).toEqual([0]);
      expect(usages.registrations).toEqual([1]);

    });

    it('should deal with different times of registrations and confirmations', () => {

      let registrations = [{count: 1, formatted_time: '21.01.2017'}];
      let confirmations = [{count: 1, formatted_time: '22.01.2017'}];

      let usages = stats.usagePerDay(registrations, confirmations);

      expect(usages.dates).toEqual(['21.01.2017', '22.01.2017']);
      expect(usages.confirmations).toEqual([0, 1]);
      expect(usages.registrations).toEqual([1, 0]);

    });

    it('should deal with different times of registrations and confirmations in a different order', () => {

      let registrations = [{count: 1, formatted_time: '22.01.2017'}];
      let confirmations = [{count: 1, formatted_time: '21.01.2017'}];

      let usages = stats.usagePerDay(registrations, confirmations);

      expect(usages.dates).toEqual(['21.01.2017', '22.01.2017']);
      expect(usages.confirmations).toEqual([1, 0]);
      expect(usages.registrations).toEqual([0, 1]);

    });
  });


});
