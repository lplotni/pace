var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.runSql("create table startblocks (id SERIAL PRIMARY KEY, name VARCHAR(255), start_time bigint);",callback);
};

exports.down = function(db, callback) {
  db.dropTable('startblocks', callback);
};
