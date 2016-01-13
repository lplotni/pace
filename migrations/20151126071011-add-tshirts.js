var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
  db.runSql("create table tshirts (id SERIAL PRIMARY KEY, size VARCHAR(255), model VARCHAR(255), participantId SERIAL references participants(id);", callback);
};

exports.down = function (db, callback) {
  db.dropTable('tshirts', callback);
};
