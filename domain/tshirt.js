/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');

const tshirt = {};

function invalidData(body) {
  return _.isUndefined(body.size) || _.isUndefined(body.model);
}

tshirt.NoTShirt = function () {
  return {
    details: [{ size: "L", model: "Slim fit" }],
    amount: 0
  }
}();

tshirt.from = function (body) {
  if (_.isEmpty(body.shirt) || body.shirt == 'no') {
    return tshirt.NoTShirt;
  }

  if (invalidData(body)) {
    throw new TypeError('Required attributes are not present');
  }
  return {
    details: [{ size: body.size, model: body.model }],
    amount: 1
  };

};

module.exports = tshirt;
