/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');

const calculator = require('../domain/costCalculator');
const db = require('./util/dbHelper');
const mails = require('./util/mails');
const tshirts = require('./tshirts');
const startNumbers = require('./startNumbers');
const editUrlHelper = require('../domain/editUrlHelper');
const timeCalculator = require('../domain/timeCalculator');
const race = require('../service/race');
let participants = {};

participants.allWithPaymentStatus = function (paymentStatus) {
  if (_.isUndefined(paymentStatus)) {
    return db.select('select * from participants where firstname != \'\' order by firstname,lastname');
  } else {
    return db.select('select * from participants where has_payed = $1 and firstname != \'\' order by firstname,lastname', [paymentStatus]);
  }
};

participants.registered = function () {
  return participants.allWithPaymentStatus(false);
};

participants.confirmed = function () {
  return participants.allWithPaymentStatus(true);
};

participants.blancParticipants = function () {
  return db.select('select * from participants where is_on_site_registration = true');
};

participants.publiclyVisible = function () {
  return participants.confirmed().then(confirmed =>
    _.filter(confirmed, p => p.visibility === 'yes')
  );
};

participants.save = function (participant) {
  return db.insert('INSERT INTO participants ' +
    '(firstname, lastname, email, category, birthyear, team, visibility,discount, paymenttoken, secureid, start_number, couponcode) ' +
    'values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning id',
    [participant.firstname,
      participant.lastname,
      participant.email,
      participant.category,
      participant.birthyear,
      participant.team,
      participant.visibility,
      participant.discount,
      participant.paymentToken,
      participant.secureID,
      participant.start_number,
      participant.couponcode]
  );
};

participants.saveBlancParticipants = function (amount) {

  return startNumbers.next().then( nr => {
    let startNumberList =  _.range(nr, nr + amount);
    return Q.all(startNumberList.map(participants.saveBlancParticipant));
  });
};

participants.saveBlancParticipant = function (startnumber) {
  let participant = {
    firstname: '',
    lastname: '',
    email: '',
    category: '',
    birthyear: 0,
    team: '',
    visibility: 'yes',
    discount: 'no',
    paymentToken: 'on-site Registrierung (' + startnumber + ')',
    secureID: editUrlHelper.generateSecureID(),
    start_number: startnumber,
    is_on_site_registration: true,
    has_payed: false
  };

  return db.insert('INSERT INTO participants ' +
    '(firstname, lastname, email, category, birthyear, team, visibility,discount, paymenttoken, secureid, start_number, is_on_site_registration, has_payed) ' +
    'values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning id',
    [participant.firstname,
      participant.lastname,
      participant.email,
      participant.category,
      participant.birthyear,
      participant.team,
      participant.visibility,
      participant.discount,
      participant.paymentToken,
      participant.secureID,
      participant.start_number,
      participant.is_on_site_registration,
      participant.has_payed]
  );
};

participants.delete = function (participantid) {
  return db.delete('delete from participants where id=$1', [participantid]);
};

participants.update = function (participant, id) {
  return db.update('UPDATE participants SET ' +
    '(firstname, lastname, email, category, birthyear, team, visibility) = ' +
    '($1, $2, $3, $4, $5, $6, $7) WHERE secureid = $8',
    [participant.firstname,
      participant.lastname,
      participant.email,
      participant.category,
      participant.birthyear,
      participant.team,
      participant.visibility,
      id]);
};

participants.byToken = function (paymentToken) {
  return db.select('SELECT id, firstname, lastname FROM participants WHERE upper(paymenttoken) = $1', [paymentToken.toUpperCase()])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('Es konnte keine Registrierung mit Token ' + paymentToken + ' gefunden werden.');
      }
      return result;
    })
    .then(result => {
      return {
        name: result[0].lastname + ', ' + result[0].firstname,
        amount: calculator.priceFor(result[0]),
        id: result[0].id
      };
    })
    .then(participantDetails => {
        return tshirts.getFor(participantDetails.id)
          .then(result => {
            participantDetails.tshirt = result[0];
            return participantDetails;
          });
      }
    );
};

participants.byId = function (id) {
  return db.select('SELECT * FROM participants WHERE id = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.bySecureId = function (id) {
  return db.select('SELECT * FROM participants WHERE secureid = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.markPayed = function (participantId) {
  return db.update('update participants SET has_payed = true WHERE id = $1', [participantId])
    .then(result => {
      if (result < 1) {
        throw new Error('Es konnte kein Teilnehmer mit ID: ' + participantId + ' gefunden werden.');
      }
    });
};

function updateTime(startnumber, finishtime) {
  return participants.getTime(startnumber)
    .then(old_time => {
      if ((finishtime < old_time) || _.isEmpty(old_time)) {
        return db.update('update participants set time=$2 where start_number=$1', [startnumber, finishtime]);
      }
    });
}
participants.insertTime = function (startnumber, timestring) {
  return timeCalculator.timestamp(timestring).then(finishtime => updateTime(startnumber, finishtime));
};

participants.getTime = function (startnumber) {
  const deferred = Q.defer();
  db.select('select time from participants where start_number=$1', [startnumber])
    .then((result) => {
      deferred.resolve(result[0].time);
    })
    .catch(deferred.reject);
  return deferred.promise;
};

participants.bulkmail = function () {
  const deferred = Q.defer();

  participants.confirmed().then(confirmed => {
    participants.registered().then(unconfirmed => {
      _.forEach(confirmed, participant => {
        mails.sendStatusEmail(participant, 'hallo', 'views/participants/bulkmail.pug');
      });
      _.forEach(unconfirmed, participant => {
        mails.sendStatusEmail(participant, 'hallo', 'views/participants/bulkmail.pug');
      });
      deferred.resolve();
    });
  }).fail(deferred.reject);

  return deferred.promise;
};

participants.results = function (category) {
  const deferred = Q.defer();
  db.select('select id,firstname,lastname,team,start_number,time,visibility from participants where visibility=\'yes\' and time > 0 and category=$1 order by time',[category])
    .then((result) => {
      var place =1;
      race.startTime()
      .then (start => {
        _.forEach(result, participant => {
          participant.place = place++;
          timeCalculator.relativeTime(start,participant.time)
            .then((time) => {
              participant.timestring = time[0] + ':' + time[1] + ':' + time[2];
            });
        });
      })
      .then(() => {
        deferred.resolve(result);
      });
  });
  return deferred.promise;
};

module.exports = participants;
