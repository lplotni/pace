/* jshint node: true */
/* jshint esnext: true */
/* global describe, it, expect */
'use strict';

describe('couponValidator', () => {
  const config = require('config');
  const validator = require('../../domain/couponValidator.js');
  
  it('should fail if empty coupon code', () => {
        let result = validator.isValidCode('');
        expect(result).toBe(false);
  });
  
  it('should fail if wrong coupon code', () => {
        let result = validator.isValidCode('Invalid Code');
        expect(result).toBe(false);
  });
  
  it('should be true with right coupon code', () => {
        let result = validator.isValidCode(config.get('coupon-code'));
        expect(result).toBe(true);
  });
});