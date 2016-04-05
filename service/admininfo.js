/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');

const admininfo = {};

admininfo.getShirtOrders = function () {
    return db.select('select tshirts.size as size,tshirts.model,count(participants.has_payed) as amount,participants.category as category from tshirts left join participants on participants.id = tshirts.participantid where participants.has_payed=true group by tshirts.model,tshirts.size,participants.category;');
};
admininfo.getConfirmedParticipants = function () {
    return db.select('select count(*) from participants where has_payed=true;');
};
admininfo.getUnconfirmedParticipants = function () {
      return db.select('select count(*) from participants where has_payed=false;');
};
module.exports = admininfo;
