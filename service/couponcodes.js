/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');
const db = require('../service/util/dbHelper');

let couponcodes = {};

function randomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

couponcodes.create = function () {
  var code = randomString();
  const deferred = Q.defer();

  db.insert('INSERT INTO couponcodes (code, used) values($1, $2) returning id', [code, false]).then(
    result => {
      deferred.resolve(code);
    });
  return deferred.promise;
};

module.exports = couponcodes;
