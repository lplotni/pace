/* jshint node: true */
/* jshint esnext: true */
'use strict';

const _ = require('lodash');
const db = require('../service/dbHelper');

const admininfo = {};

admininfo.getShirtOrders = function () {
    return db.select('SELECT shirtsize, shirtmodel, count(has_payed) FROM participants WHERE has_payed=true GROUP BY shirtmodel, shirtsize');
};
admininfo.getConfirmedParticipants = function () {
    return db.select('select count(*) from participants where has_payed=true;');
};
admininfo.getUnonfirmedParticipants = function () {
      return db.select('select count(*) from participants where has_payed=false;');
};
module.exports = admininfo;
