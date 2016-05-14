/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const db = require('../service/util/dbHelper');

let couponcodes = {};

couponcodes.randomString = () => {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

couponcodes.create = () => {
  var code = couponcodes.randomString();
  const deferred = Q.defer();

  db.insert('INSERT INTO couponcodes (code, used) values($1, $2) returning id', [code, false]).then(
    id => {
      let result = {id: id, code: code};
      deferred.resolve(result);
    });
  return deferred.promise;
};

couponcodes.getAll =  () => {
  return db.select('SELECT * FROM couponcodes');
};

couponcodes.validateCode = (couponcode, discount) => {
  const deferred = Q.defer();

  if (discount !== 'free') {
    deferred.resolve(true);
  } else {
    db.select('SELECT COUNT(*) FROM couponcodes WHERE code = $1 AND used=false', [couponcode]).then(
      count => {
        if (count && count.length > 0 && count[0] && count[0].count > 0) {
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      }
    );


  }
  return deferred.promise;
};

couponcodes.markAsUsed = (couponcode) => {
  return db.update('UPDATE couponcodes SET used=$1 WHERE code=$2 ', [true, couponcode]);
};


module.exports = couponcodes;
