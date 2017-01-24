/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');
const _ = require('lodash');

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

// select count(id), to_char(registration_time, 'dd.MM.yyyy') as t1 from participants group by t1;

module.exports = stats;
