/* jshint esnext: true */
/* jshint node: true */
'use strict';

let validator = {};
const config = require('config');

validator.isValidCode = function (couponCode) {
  return couponCode === config.get('coupon-code');
};

module.exports = validator;
