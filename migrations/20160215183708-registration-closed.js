var dbm = global.dbm || require('db-migrate');

exports.up = function(db, callback) {
  db.runSql("create table registration (data JSONB);");
  db.runSql("insert into registration (data) values ('{\"is_closed\": false}');", callback);
};

exports.down = function(db, callback) {
  db.dropTable('registration', callback);
};
