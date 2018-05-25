/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');
const _ = require('lodash');
const Q = require('q');
const moment = require('moment');
require("moment-duration-format");
const csv = require('fast-csv');
const timeCalculator = require('../domain/timeCalculator');
const queryHelper = require('./util/queryHelper');

let race = {};

race.parse = (file) => {
  const deferred = Q.defer();
  var results = {};
  csv
    .fromPath(file)
    .on("data", (data) => {
      results[data[0]] = data[1];
    })
    .on("end", () => deferred.resolve(results));
  return deferred.promise;
};

race.import = (file) => {
  const participant = require('../service/participants');
  race.parse(file)
    .then(result => {
      Object.keys(result).forEach(function (key) {
        participant.updateTime(key, result[key]);
      });
    });
};

function queryFor(category) {
  if (category === 'all') {
    return "";
  } else {
    return `and category= '${category}'`;
  }
}

race.results = (category, agegroup_start, agegroup_end) => {
  const deferred = Q.defer();

  let query = `select id,firstname,lastname,team,start_number,start_block,seconds,visibility from participants
               where visibility='yes' and time > 0
               and ( start_block=0 or confirmed_result=true)
               ${queryFor(category)}
               and birthyear >= ${agegroup_start}
               and birthyear <= ${agegroup_end}
               order by seconds`;

  db.select(query)
    .then((result) => {
      var place = 1;
      _.forEach(result, participant => {
        participant.timestring = moment.duration(_.toNumber(participant.seconds),'seconds').format("hh:mm:ss", { trim: false} );
        participant.place = place++;
      });
      deferred.resolve(result);
    }).catch(deferred.reject);
  return deferred.promise;
};

race.resultsForDataTables = (start, length, search, orderText, category, agegroup_start, agegroup_end) => {
  const subSelect = queryHelper
    .select('PARTICIPANTS', '*, RANK() OVER (ORDER BY SECONDS) AS PLACE')
    .where(`visibility='yes' and time > 0
               and ( start_block=0 or confirmed_result=true)
               ${queryFor(category)}
               and birthyear >= ${agegroup_start}
               and birthyear <= ${agegroup_end}`)
    .build();
  const queries = queryHelper.dataTablesQueries({
    count: 'ID',
    table: `(${subSelect}) AS PP`,
    baseFilter: '1 = 1',
    select: 'ID,FIRSTNAME,LASTNAME,TEAM,START_NUMBER,START_BLOCK,SECONDS,VISIBILITY, PLACE',
    filterColumns: ['FIRSTNAME', 'LASTNAME', 'TEAM'],
    searchParamName: '$1',
    paging: {offset: start, length: length},
    ordering: orderText,
  });

  const pagedSelectModifier =
    (result, deferred) => {
      _.forEach(result, participant => {
        participant.timestring = moment.duration(_.toNumber(participant.seconds),'seconds').format("hh:mm:ss", { trim: false} );
      });
      deferred.resolve(result);
    };

  return db.selectForDataTables(queries, search, pagedSelectModifier);
};

module.exports = race;
