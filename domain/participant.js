/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');
const validator = require('validator');
const tshirt = require('./tshirt');
const participants = require('../service/participants');

const participant = {};

const NoTShirt = {
  details: [{ size: "L", model: "Slim fit" }],
  amount: 0
};

function invalidData(body) {
  return !(validator.isEmail(body.email)) ||
    _.isUndefined(body.firstname) ||
    _.isUndefined(body.lastname) ||
    _.isUndefined(body.email) ||
    _.isUndefined(body.category) ||
    _.isUndefined(body.visibility) ||
    _.isUndefined(body.birthyear);
}

participant.from = function (body) {
  if (invalidData(body)) {
    throw new TypeError('Required attributes are not present');
  }
  return {
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    visibility: body.visibility,
    category: body.category,
    birthyear: body.birthyear,
    team: body.team,
    tshirt: tshirt.from(body)
  };

};

participant.addTshirtDetailsTo = function (participant) {
  return participants.getTShirtFor(participant.id)
    .then(tshirtDetails => {
      let details = [];

      if(tshirtDetails.length == 0) {
        participant.tshirt = NoTShirt
      } else {

        tshirtDetails.forEach(element =>
          details.push(_.pick(element, 'size', 'model'))
        );
        participant.tshirt = {
          details: details,
          amount: tshirtDetails.length
        };
      }
    }).catch(() => {
      participant.tshirt = NoTShirt
    });
};

module.exports = participant;
