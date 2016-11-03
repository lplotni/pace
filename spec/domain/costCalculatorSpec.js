/* jshint node: true */
/* jshint esnext: true */
/* global describe, it, expect,beforeEach  */
'use strict';

describe('costCalculator', () => {

  const calculator = require('../../domain/costCalculator.js');
  const config = require('config');

  let participant;

  beforeEach(() => {
    participant = {
      firstname: 'Mark',
      lastname: 'Mueller',
      email: 'm.mueller@example.com',
      gender: 'Unicorn',
      birthyear: 1980,
      team: 'Crazy runners',
      discount: 'no',
      tshirt: {
        model: 'Normal fit',
        size: 'M'
      }
    };
  });

  it('cost with tshirt = tshirt + standard', () => {
    let cost = calculator.priceFor(participant);

    expect(cost).toBe(parseFloat(config.get('costs.standard')) + parseFloat(config.get(
      'shirts.price')));
  });

  it('cost without tshirt = standard', () => {
    participant.tshirt = {};
    let cost = calculator.priceFor(participant);

    expect(cost).toBe(parseFloat(config.get('costs.standard')));
  });

  it('cost with discount', () => {
    participant.tshirt = {};
    participant.discount = 'yes';
    let cost = calculator.priceFor(participant);

    expect(cost).toBe(parseFloat(config.get('costs.discount')));
  });

  it('cost with coupon', () => {
    participant.tshirt = {};
    participant.discount = 'free';
    let cost = calculator.priceFor(participant);

    expect(cost).toBe(0);
  });

  it('cost with coupon and tshirt', () => {
    participant.discount = 'free';
    let cost = calculator.priceFor(participant);
    let expectedPrice = 0 + parseFloat(config.get('shirts.price'));

    expect(cost).toBe(expectedPrice);
  });
});
