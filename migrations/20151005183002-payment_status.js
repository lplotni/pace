var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('participants','has_payed',{type:'boolean'}),callback();
};

exports.down = function(db, callback) {
  db.removeColumn('participants','has_payed'),callback();
};
