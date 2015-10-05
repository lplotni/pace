var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.runSql("alter table participants add column paymenttoken VARCHAR(7);",callback);
};

exports.down = function(db, callback) {
  db.runSql("alter table participants drop column paymenttoken", callback());
};
