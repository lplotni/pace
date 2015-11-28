'use strict';
/* jshint esnext: true */
const _ = require('lodash');
const config = require('config');

var calculator = {};

calculator.priceFor = function (participant) {
  if (_.isUndefined(participant.tshirt)) {
    return _.parseInt(config.get('costs.standard'))
  } else {
    return _.parseInt(config.get('costs.standard')) + _.parseInt(config.get('shirts.price'));
  }
};

module.exports = calculator;
