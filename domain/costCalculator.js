'use strict';
/* jshint esnext: true */
const _ = require('lodash');
const config = require('config');

var calculator = {};

calculator.priceFor = function (participant) {
  if (_.isUndefined(participant.tshirt)) {
    return parseFloat(config.get('costs.standard'))
  } else {
    return parseFloat(config.get('costs.standard')) + parseFloat(config.get('shirts.price'));
  }
};

module.exports = calculator;
