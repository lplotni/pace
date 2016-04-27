/* jshint node: true */
/* jshint esnext: true */
'use strict';
var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('participants', 'is_on_site_registration', {type: 'boolean', defaultValue:'false'}, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('participants','is_on_site_registration',callback);
};

