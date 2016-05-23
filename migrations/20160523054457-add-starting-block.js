/* jshint node: true */
/* jshint esnext: true */
'use strict';

const dbm = global.dbm || require('db-migrate');
const type = dbm.dataType;

function logError(error) {
  if (error) {
    console.error(error);
  }
}

function getBlock(number) {
  if(number < 1001) {
    return 1;
  }
  return 2;
}

exports.up = function (db, callback) {
  db.addColumn('participants', 'start_block', {type: 'integer'}, logError);
  db.runSql('select id, start_number from participants;', [], (err, results) => {
    results.rows.forEach((row)=> {
      db.runSql('update participants set start_block = ? where id = ?', [getBlock(row.start_number), row.id], logError);
    });
    db.runSql('alter table participants alter COLUMN start_number set not null', [], callback);
  });
};

exports.down = function (db, callback) {
  db.removeColumn('participants', 'start_block', callback);
};
