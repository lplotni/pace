/* jshint node: true */
/* jshint esnext: true */
'use strict';

const dbm = global.dbm || require('db-migrate');
const type = dbm.dataType;
const startNumbers = require('../service/startNumbers');


function logError(error) {
  if (error) {
    console.error(error);
  }
}

exports.up = function (db, callback) {
  db.addColumn('participants', 'start_number', {type: 'integer', unique: true}, logError);
  db.runSql('select id from participants;', [], (err, results) => {
    let count = 1;
    results.rows.forEach((row)=> {
      db.runSql('update participants set start_number = ? where id = ?', [count, row.id], logError);
      count = startNumbers.escape(count+1);
    });
    db.runSql('alter table participants alter COLUMN start_number set not null', [], callback);
  });
};

exports.down = function (db, callback) {
  db.removeColumn('participants', 'start_number', callback);
};
