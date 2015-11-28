'use strict';
/* jshint esnext: true */

const _ = require('lodash');
const tshirt = require('./tshirt');

const participant = {};

function invalidData(body) {
  return _.isUndefined(body.firstname) || _.isUndefined(body.lastname) || _.isUndefined(body.gender) || _.isUndefined(body.birthyear);
}

participant.from = function (body) {
  if (invalidData(body)) {
    throw new TypeError('Required attributes are not present');
  }

  return {
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    gender: body.gender,
    birthyear: body.birthyear,
    team: body.team,
    tshirt: tshirt.from(body)
  };

};

module.exports = participant;