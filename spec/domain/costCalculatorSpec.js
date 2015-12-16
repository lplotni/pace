/* jshint node: true */
/* jshint esnext: true */
/* global describe, it, expect */
describe('costCalculator', function () {

  var calculator = require('../../domain/costCalculator.js');
  var _ = require('lodash');

  var config = require('config');

  var participant = {
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

  it('cost with tshirt = tshirt + standard', function () {
    var cost = calculator.priceFor(participant);

    expect(cost).toBe(parseFloat(config.get('costs.standard')) + parseFloat(config.get('shirts.price')));
  });

  it('cost without tshirt = standard', function () {
    var cost = calculator.priceFor(_.omit(participant, 'tshirt'));

    expect(cost).toBe(parseFloat(config.get('costs.standard')));
  });
});