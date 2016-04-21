/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');
const validator = require('validator');
const tshirt = require('./tshirt');
const tshirts = require('../service/tshirts');
const participants = require('../service/participants');
const couponValidator = require('../domain/couponValidator');

const participant = {};


function invalidData(body) {
  return _.isUndefined(body.email) || 
    !validator.isEmail(body.email) ||
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

  if(body.discount === 'free' && !couponValidator.isValidCode(body.couponcode)) {
    throw new TypeError('Invalid Coupon Code');
  }
  
  let p = {
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    visibility: body.visibility,
    discount: _.isUndefined(body.discount) ? 'no' : body.discount,
    couponCode: body.couponcode,
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

module.exports = participant;
