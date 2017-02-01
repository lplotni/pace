/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');
const _ = require('lodash');
const moment = require('moment');

const stats = {};

stats.shirtOrders = () => {
  return db.select(
    `SELECT tshirts.size AS size,
              tshirts.model,
              count(participants.has_payed) AS amount,
              participants.category AS category
      FROM tshirts LEFT JOIN participants on participants.id = tshirts.participantid
      WHERE participants.has_payed=true 
      GROUP BY tshirts.model, tshirts.size, participants.category;`
  );
};

stats.confirmedParticipantsCount = () => {
  return db.select('SELECT count(*) FROM participants WHERE has_payed=true;');
};

stats.unconfirmedParticipantsCount = () => {
  return db.select('SELECT count(*) FROM participants WHERE has_payed=false;');
};


function extractSize(dbResults, size) {
  return _.filter(dbResults, (entry) => entry.model === size);
}

function extractAmount(size, shirts) {
  let entry = _.find(shirts, (o) => o.size === size) || {amount: 0};
  return _.toInteger(entry.amount);
}

stats.slimShirts = (dbResults) => {
  let shirts = extractSize(dbResults, 'Slim fit');

  return {
    xs: extractAmount('XS', shirts),
    s: extractAmount('S', shirts),
    m: extractAmount('M', shirts),
    l: extractAmount('L', shirts)
  };
};

stats.reqularShirts = (dbResults) => {
  let shirts = extractSize(dbResults, 'Regular');

  return {
    s: extractAmount('S', shirts),
    m: extractAmount('M', shirts),
    l: extractAmount('L', shirts),
    xl: extractAmount('XL', shirts)
  };
};
//   registrationsData: [10, 2, 30, 50, 2],
//   confirmationsData: [0, 0, 0, 40, 5],
//   labels: ['1. Jan', '2. Jan', '3. Jan', '4. Jan', '5. Jan'],

stats.usagePerDay = (registrations, confirmations) => {

  let registrationsCopy =  registrations.slice();
  _.forEach(confirmations, (c) => {
    let index = _.findIndex(registrationsCopy, (e) => e.t1 === c.t1);
    if(index) {
     //not existing
      registrationsCopy.push({count:0, countConfirmations: c.count, t1: c.t1});
    } else {
     //existing
      registrationsCopy[index].countConfirmations = c.count;
    }
  });

  _.forEach(registrationsCopy, (r) => r.date = moment(r.t1, 'DD.MM.YYYY'));

  const resultSorted = _.sortBy(registrationsCopy, (r) => r.date);


  return {
    dates: _.map(resultSorted, (r) => r.date.format('DD.MM.YYYY')),
    confirmations: _.map(resultSorted, (r) => r.countConfirmations || 0),
    registrations: _.map(resultSorted, (r) => r.count)
  };
};

stats.registrationsPerDay = () => {
  return db.select(`select count(id), to_char(registration_time, 'dd.MM.yyyy') as t1 from participants where registration_time is not null group by registration_time order by registration_time;`);
};

stats.confirmationsPerDay = () => {
  return db.select(`select count(id), to_char(confirmation_time, 'dd.MM.yyyy') as t1 from participants where confirmation_time is not null group by confirmation_time order by confirmation_time;`);
};


module.exports = stats;
