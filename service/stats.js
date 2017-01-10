/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');

const stats = {};

stats.shirtOrders = () => {
  return db.select(
    'SELECT tshirts.size AS size,' +
    'tshirts.model,' +
    'count(participants.has_payed) AS amount,' +
    'participants.category AS category ' +
    'FROM tshirts LEFT JOIN participants on participants.id = tshirts.participantid ' +
    'WHERE participants.has_payed=true GROUP BY tshirts.model, tshirts.size, participants.category;');
};

stats.confirmedParticipantsCount = () => {
  return db.select('SELECT count(*) FROM participants WHERE has_payed=true;');
};

stats.unconfirmedParticipantsCount = () => {
  return db.select('SELECT count(*) FROM participants WHERE has_payed=false;');
};

// select count(id), to_char(registration_time, 'dd.MM.yyyy') as t1 from participants group by t1;

module.exports = stats;
