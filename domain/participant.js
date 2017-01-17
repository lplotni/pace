/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');
const validator = require('validator');
const tshirt = require('./tshirt');
const tshirts = require('../service/tshirts');
const participants = require('../service/participants');

const participant = {};


participant.invalidData = (body) => {
  if (_.isEmpty(body.email) || _.isUndefined(body.email)) {
    return _.isUndefined(body.category) || _.isUndefined(body.visibility) ;
  } else {
    return !validator.isEmail(body.email) || _.isUndefined(body.category) || _.isUndefined(body.visibility) ;
  }
};

participant.from = (body) => {
  if (participant.invalidData(body)) {
    throw new TypeError('Required attributes are not present');
  }

  let p = {
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    visibility: body.visibility,
    discount: _.isUndefined(body.discount) ? 'no' : body.discount,
    couponcode: body.couponcode,
    category: body.category,
    birthyear: _.isInteger(body.birthyear) ? body.birthyear : '0',
    team: body.team,
    tshirt: tshirt.from(body),
    goal: body.goal
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
  
  p.withStartBlock = (block) => {
   return p.with({start_block: block});
  };
  
  return p;
};

module.exports = participant;
