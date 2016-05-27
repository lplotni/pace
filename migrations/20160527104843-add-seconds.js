var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.addColumn('participants', 'seconds', {type: 'bigint'}, callback);
};

exports.down = function(db, callback) {
    db.removeColumn('participants', 'seconds', callback);

};

