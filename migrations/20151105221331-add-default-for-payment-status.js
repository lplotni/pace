var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.changeColumn('participants','has_payed',{notNull:'true',defaultValue:'false'}),callback();
};

exports.down = function(db, callback) {
  db.changeColumn('participants','has_payed',{type:'boolean'}),callback();
};
