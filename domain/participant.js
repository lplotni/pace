/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');
const validator = require('validator');
const tshirt = require('./tshirt');

const participant = {};


participant.invalidData = (body) => {
  const emailPresent = !_.isUndefined(body.email) && !_.isEmpty(body.email);
  const requiredFieldsMissing = _.isUndefined(body.category) || _.isUndefined(body.visibility);

  if (!emailPresent) {
    return requiredFieldsMissing;
  } else {
    return !validator.isEmail(body.email) || requiredFieldsMissing;
  }
};

participant.invalidYear = (birthyear) => {
  const isNumber = _.isFinite(_.toNumber(birthyear));
  const isPresent = !_.isUndefined(birthyear) && !_.isEmpty(birthyear);
  const greaterZero = _.toNumber(birthyear) > 0;

  return isPresent && (!isNumber || !greaterZero);
};

participant.from = (body) => {
  if (participant.invalidData(body)) {
    throw new TypeError('Required attributes are not present');
  }

  if (participant.invalidYear(body.birthyear)) {
    throw new TypeError(`Malformed year-of-birth: '${body.birthyear}'. Please provide a 4 digit number i.e. '1969'`);
  }

  let p = {
    firstname: body.firstname,
    lastname: body.lastname,
    email: body.email,
    visibility: body.visibility,
    discount: _.isUndefined(body.discount) ? 'no' : body.discount,
    couponcode: body.couponcode,
    category: body.category,
    birthyear: _.isFinite(_.toNumber(body.birthyear)) ? _.toNumber(body.birthyear) : 0,
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

  p.withRegistrationTime = (time) => {
    return p.with({registrationTime: time});
  };

  return p;
};

module.exports = participant;
