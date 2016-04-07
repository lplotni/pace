/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');
const validator = require('validator');
const tshirt = require('./tshirt');
const tshirts = require('../service/tshirts');
const participants = require('../service/participants');

const participant = {};


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
  
  let p = {
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    visibility: body.visibility,
    discount: _.isUndefined(body.discount) ? 'no' : body.discount,
    category: body.category,
    birthyear: body.birthyear,
    team: body.team,
    tshirt: tshirt.from(body)
  };
  
  p.with = function (property) {
    return _.assignIn(p, property);
  };
  
  p.withStartNr = (nr) => {
   return p.with({start_number: nr});
  };
  
  p.withToken = (token) => {
   return p.with({paymentToken: token});
  };
  
  p.withSecureId = (id) => {
   return p.with({secureID: id});
  };
  
  return p;
};

participant.addTshirtDetailsTo = function (participant) {
  return tshirts.getTShirtFor(participant.id)
    .then(tshirtDetails => {
      let tshirtAmount = tshirtDetails.length;
      if(tshirtAmount > 0) {
        let details = tshirtDetails.map(function (element) {
          return _.pick(element, 'size', 'model');
        });
        participant.tshirt = {
          details: details,
          amount: tshirtAmount
        };
      }
    });
};

module.exports = participant;
