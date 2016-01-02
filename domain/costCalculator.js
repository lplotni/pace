/* jshint esnext: true */
/* jshint node: true */
'use strict';

const _ = require('lodash');
const config = require('config');

let calculator = {};

calculator.priceFor = function (participant) {
  if (_.isEmpty(participant.tshirt) || participant.tshirt.amount === 0) {
    return parseFloat(config.get('costs.standard'));
  } else {
    return parseFloat(config.get('costs.standard')) + parseFloat(config.get('shirts.price'));
  }
};

module.exports = calculator;