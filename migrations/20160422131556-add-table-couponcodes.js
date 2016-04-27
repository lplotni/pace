var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
 db.runSql("CREATE TABLE couponcodes (id SERIAL PRIMARY KEY, code VARCHAR(255) UNIQUE, used BOOLEAN);",callback);
};

exports.down = function(db, callback) {
  db.dropTable('couponcodes', callback);
};
