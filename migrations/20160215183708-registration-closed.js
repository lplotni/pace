var dbm = global.dbm || require('db-migrate');

exports.up = function(db, callback) {
  db.runSql("create table registration (is_closed VARCHAR(3));");
  db.runSql("insert into registration (is_closed) values ('no');", callback);
};

exports.down = function(db, callback) {
  db.dropTable('registration', callback);
};
