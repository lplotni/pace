var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.runSql("create table participants (id SERIAL PRIMARY KEY, email VARCHAR(255), firstname VARCHAR(255), lastname VARCHAR(255));",callback);
};

exports.down = function(db, callback) {
  db.dropTable('participants', callback);
};
