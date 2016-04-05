/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');
const db = require('../service/util/dbHelper');

let service = {};

function randomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

service.createUniqueToken = function () {
  const deferred = Q.defer();
  const token = randomString();

  db.select('select * from participants where paymenttoken like $1', [token])
    .then((result) => {
      if (_.isEmpty(result)) {
        deferred.resolve(token);
      } else {
        return deferred.resolve(service.createUniqueToken());
      }
    })
    .catch(deferred.reject);

  return deferred.promise;
};

module.exports = service;
