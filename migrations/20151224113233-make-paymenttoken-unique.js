var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.runSql("alter table participants add constraint unique_paymenttoken unique (paymenttoken);",callback);
};

exports.down = function(db, callback) {
  db.runSql("alter table participants drop constraint unique_paymenttoken;",callback);
};
