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
const race = require('./race');

let participants = {};

participants.allWithPaymentStatus = (paymentStatus) => {
  if (_.isUndefined(paymentStatus)) {
    return db.select('select * from participants where firstname != \'\' order by firstname,lastname');
  } else {
    return db.select('select * from participants where has_payed = $1 and firstname != \'\' order by firstname,lastname', [paymentStatus]);
  }
};

participants.registered = () => {
  return participants.allWithPaymentStatus(false);
};

participants.confirmed = () => {
  return participants.allWithPaymentStatus(true);
};

participants.blancParticipants = () => {
  return db.select('select * from participants where is_on_site_registration = true');
};

participants.publiclyVisible = () => {
  return participants.confirmed().then(confirmed =>
    _.filter(confirmed, p => p.visibility === 'yes')
  );
};

participants.save = (participant) => {
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

participants.saveBlancParticipants = (amount) => {

  return startNumbers.next().then( nr => {
    let startNumberList =  _.range(nr, nr + amount);
    return Q.all(startNumberList.map(participants.saveBlanc));
  });
};

participants.saveBlanc = (startnumber) => {
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
    has_payed: false //TODO false or true?
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

participants.delete = (participantid) => {
  return db.delete('delete from participants where id=$1', [participantid]);
};

participants.update = (participant, id) => {
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

participants.byToken = (paymentToken) => {
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

participants.byId = (id) => {
  return db.select('SELECT * FROM participants WHERE id = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.byStartnumber = (number) => {
  return db.select('SELECT * FROM participants WHERE start_number = $1', [number])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};


participants.bySecureId = (id) => {
  return db.select('SELECT * FROM participants WHERE secureid = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.markPayed = (participantId) => {
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
participants.insertTime = (startnumber, timestring) => {
  return race.startTime().then((startTimes) => updateTime(startnumber, timeCalculator.timestamp(startTimes, timestring)));
};

participants.getTime = (startnumber) => {
  const deferred = Q.defer();
  db.select('select time from participants where start_number=$1', [startnumber])
    .then((result) => {
      deferred.resolve(result[0].time);
    })
    .catch(deferred.reject);
  return deferred.promise;
};

participants.bulkmail = () => {
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

module.exports = participants;
