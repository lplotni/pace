/* jshint esnext: true */
/* jshint node: true */
'use strict';

const _ = require('lodash');
const config = require('config');

let calculator = {};

calculator.priceFor = (participant) => {
  let total = 0;
  if (!_.isEmpty(participant.tshirt)) {
    total = total + parseFloat(config.get('shirts.price'));
  }
  if (participant.discount === 'yes') {
    total = total + parseFloat(config.get('costs.discount'));
  } else if (participant.discount === 'free') {
    // just the tshirt price
  } else {
    total = total + parseFloat(config.get('costs.standard'));
  }
  return total;
};

module.exports = calculator;
