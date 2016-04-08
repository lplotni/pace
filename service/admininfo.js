/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');

const admininfo = {};

admininfo.shirtOrders = function () {
  return db.select(
    'SELECT tshirts.size AS size,' +
    'tshirts.model,' +
    'count(participants.has_payed) AS amount,' +
    'participants.category AS category ' +
    'FROM tshirts LEFT JOIN participants on participants.id = tshirts.participantid ' +
    'WHERE participants.has_payed=true GROUP BY tshirts.model, tshirts.size, participants.category;');
};

admininfo.confirmedParticipantsCount = function () {
  return db.select('SELECT count(*) FROM participants WHERE has_payed=true;');
};

admininfo.unconfirmedParticipantsCount = function () {
  return db.select('SELECT count(*) FROM participants WHERE has_payed=false;');
};

module.exports = admininfo;
