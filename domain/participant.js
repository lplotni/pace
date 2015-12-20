'use strict';
/* jshint esnext: true */

const _ = require('lodash');
const tshirt = require('./tshirt');
const participants = require('../service/participants');

const participant = {};

function invalidData(body) {
  return _.isUndefined(body.firstname) || _.isUndefined(body.lastname) || _.isUndefined(body.category) || _.isUndefined(body.birthyear);
}

participant.from = function (body) {
  if (invalidData(body)) {
    throw new TypeError('Required attributes are not present');
  }

  return {
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    category: body.category,
    birthyear: body.birthyear,
    team: body.team,
    tshirt: tshirt.from(body)
  };

};

participant.addTshirtDetailsTo = function(participant) {
  return participants.getTShirtFor(participant.id)
    .then(function (tshirtDetails) {
      participant.tshirt = {
        size: tshirtDetails[0].size,
        model: tshirtDetails[0].model,
        amount: tshirtDetails.length
      }
    }).catch(function () {
      participant.tshirt = {amount: 0};
    });
};

module.exports = participant;