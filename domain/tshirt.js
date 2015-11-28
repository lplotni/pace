'use strict';
/* jshint esnext: true */

const _ = require('lodash');

const tshirt = {};

function invalidData(body) {
  return _.isUndefined(body.size) || _.isUndefined(body.model);
}

tshirt.from = function (body) {
  if (_.isEmpty(body.shirt)) {
    return {};
  }

  if (invalidData(body)) {
    throw new TypeError('Required attributes are not present');
  }
  return {
    size: body.size,
    model: body.model
  };

};

module.exports = tshirt;