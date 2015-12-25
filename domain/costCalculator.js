/* jshint esnext: true */
/* jshint node: true */
'use strict';

const _ = require('lodash');
const config = require('config');

let calculator = {};

calculator.priceFor = function (participant) {
  if (_.isEmpty(participant.tshirt)) {
    return parseFloat(config.get('costs.standard'));
  } else {
    return parseFloat(config.get('costs.standard')) + parseFloat(config.get('shirts.price'));
  }
};

module.exports = calculator;