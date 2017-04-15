/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');
const _ = require('lodash');
const moment = require('moment');
const Q = require('q');

const stats = {};

stats.shirtOrders = () => {
  return db.select(
    `SELECT tshirts.size AS size,
              tshirts.model,
              count(participants.has_payed) AS amount
      FROM tshirts LEFT JOIN participants on participants.id = tshirts.participantid
      WHERE participants.has_payed=true 
      GROUP BY tshirts.model, tshirts.size;`
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

let registrationsPerDay = () => {
  return db.select(`select count(id), 
                           to_char(registration_time, 'dd.MM.yyyy') as formatted_time 
                    from participants 
                    where registration_time is not null 
                    group by formatted_time 
                    order by formatted_time;`);
};

let confirmationsPerDay = () => {
  return db.select(`select count(id), 
                           to_char(confirmation_time, 'dd.MM.yyyy') as formatted_time 
                    from participants 
                    where confirmation_time is not null 
                    group by formatted_time 
                    order by formatted_time;`);
};

stats.usageData = () => {
  const deferred = Q.defer();
  Q.allSettled([registrationsPerDay(), confirmationsPerDay()])
    .then((results) => {
      let r = results.map(r => r.value);
      deferred.resolve(stats.usagePerDay(r[0], r[1]));
    })
    .catch(deferred.reject);

  return deferred.promise;
};

stats.usagePerDay = (registrations, confirmations) => {
  _.forEach(confirmations, (c) => {
    let index = _.findIndex(registrations, (e) => e.formatted_time === c.formatted_time);
    if (index) {
      //not existing
      registrations.push({count: 0, countConfirmations: c.count, formatted_time: c.formatted_time});
    } else {
      //existing
      registrations[index].countConfirmations = c.count;
    }
  });

  _.forEach(registrations, (r) => r.date = moment(r.formatted_time, 'DD.MM.YYYY'));

  const resultSorted = _.sortBy(registrations, (r) => r.date);

  return {
    dates: _.map(resultSorted, (r) => r.date.format('DD.MM.YYYY')),
    confirmations: _.map(resultSorted, (r) => r.countConfirmations || 0),
    registrations: _.map(resultSorted, (r) => r.count)
  };
};


module.exports = stats;
