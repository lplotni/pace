/* jshint node: true */
/* jshint esnext: true */
/* global describe, it, expect */
'use strict';

describe('costCalculator', () => {

  const calculator = require('../../domain/costCalculator.js');
  const _ = require('lodash');

  const config = require('config');

  let participant = {
    firstname: 'Mark',
    lastname: 'Mueller',
    email: 'm.mueller@example.com',
    gender: 'Unicorn',
    birthyear: 1980,
    team: 'Crazy runners',
    tshirt: {
      model: 'Normal fit',
      size: 'M'
    }
  };

  it('cost with tshirt = tshirt + standard', () => {
    let cost = calculator.priceFor(participant);

    expect(cost).toBe(parseFloat(config.get('costs.standard')) + parseFloat(config.get('shirts.price')));
  });

  it('cost without tshirt = standard', () => {
    participant.tshirt = {};
    let cost = calculator.priceFor(participant);

    expect(cost).toBe(parseFloat(config.get('costs.standard')));
  });
});