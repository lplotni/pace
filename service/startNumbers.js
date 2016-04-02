/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/dbHelper');
const _ = require('lodash');

let service = {};

service.next = function () {
  return db.select('SELECT MAX(start_number) FROM participants', []).then((result) => {
    let number = parseInt(result[0].max);
    if (number) {
      return service.escape(number + 1);
    } else {
      return 1;
    }
  });
};

service.escape = function (nr) {
  if (_.includes([18, 28, 74, 84, 88, 444, 191, 192, 198, 420, 1919, 1488, 1681], nr)) {
    return service.escape(nr + 1);
  }
  return nr;
};

module.exports = service;
