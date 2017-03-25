/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');

const db = require('./util/dbHelper');
const mails = require('./util/mails');
const tshirts = require('./tshirts');
const startNumbers = require('./startNumbers');
const startblocks = require('./startblocks');
const editUrlHelper = require('../domain/editUrlHelper');
const timeCalculator = require('../domain/timeCalculator');
const race = require('./race');
const queryHelper = require('./util/queryHelper');

let participants = {
  get: {}
};

participants.get.allWithPaymentStatus = (paymentStatus) => {
  if (_.isUndefined(paymentStatus)) {
    return db.select('select * from participants where firstname != \'\' order by firstname,lastname');
  } else {
    return db.select('select * from participants where has_payed = $1 and firstname != \'\' order by firstname,lastname', [paymentStatus]);
  }
};

participants.get.registered = () => {
  return participants.get.allWithPaymentStatus(false);
};

participants.get.confirmed = () => {
  return participants.get.allWithPaymentStatus(true);
};

participants.get.blancParticipants = () => {
  return db.select('select * from participants where is_on_site_registration = true');
};

participants.get.all = () => {
  return db.select('select * from participants');
};

participants.get.forDataTables = (start, length, search, ordering) => {
  const queries = queryHelper.dataTablesQueries({
    count: 'ID',
    table: 'PARTICIPANTS',
    baseFilter: `visibility = 'yes' and has_payed = true and firstname != ''`,
    select: 'ID, START_NUMBER, FIRSTNAME, LASTNAME, TEAM',
    filterColumns: ['FIRSTNAME', 'LASTNAME', 'TEAM'],
    searchParamName: '$1',
    paging: {offset: start, length: length},
    ordering,
  });

  return db.selectForDataTables(queries, search);
};

participants.get.byId = (id) => {
  return db.select('SELECT * FROM participants WHERE id = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.get.byStartnumber = (number) => {
  return db.select('SELECT * FROM participants WHERE start_number = $1', [number])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.get.bySecureId = (id) => {
  return db.select('SELECT * FROM participants WHERE secureid = $1', [id])
    .then(result => {
      if (_.isEmpty(result)) {
        throw new Error('No participant found');
      }
      return result;
    })
    .then(result => result[0]);
};

participants.save = (participant) => {
  return db.insert(`INSERT INTO participants
                    (firstname, lastname, email, category, birthyear, team, visibility,discount, paymenttoken, secureid, start_number, start_block, couponcode, goal, registration_time)
                    values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning id`,
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
      participant.start_block,
      participant.couponcode,
      participant.goal,
      participant.registrationTime
    ]
  );
};

participants.saveBlancParticipants = (amount) => {

  return startNumbers.next().then( nr => {
    let startNumberList =  _.range(nr, nr + amount);
    return Q.all(startNumberList.map(participants.saveBlanc));
  });
};

participants.choseStartBlock = (startNumber) => { //move this out of here TODO
  return null;
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
    start_block: participants.choseStartBlock(startnumber),
    is_on_site_registration: true,
    has_payed: false,
    goal: 'relaxed'
  };

  return db.insert(`INSERT INTO participants
                    (firstname, lastname, email, category, birthyear, team, visibility,discount, paymenttoken, secureid, start_number, start_block, is_on_site_registration, has_payed, goal)
                    values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning id`,
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
      participant.start_block,
      participant.is_on_site_registration,
      participant.has_payed,
      participant.goal
    ]
  );
};

participants.delete = (participantid) => {
  return db.delete('delete from participants where id=$1', [participantid]);
};

participants.update = (participant, id) => {
    return db.update(`UPDATE participants SET
                    (firstname, lastname, email, category, birthyear, team, visibility, start_block) =
                    ($1, $2, $3, $4, $5, $6, $7, $8)
                    WHERE secureid = $9`,
    [participant.firstname,
     participant.lastname,
     participant.email,
     participant.category,
     participant.birthyear,
     participant.team,
     participant.visibility,
     participant.start_block,
     id])
    .then(() => {
      participants.get.bySecureId(id).then( saved_participant => {
        if (saved_participant.time > 0) {
          participants.updateTime(saved_participant.start_number,saved_participant.time);
        }
      });
    });
};

participants.markPayed = (participantId) => {
  return db.update('update participants SET has_payed = true, confirmation_time = current_timestamp(2) WHERE id = $1', [participantId])
    .then(result => {
      if (result < 1) {
        throw new Error('Es konnte kein Teilnehmer mit ID: ' + participantId + ' gefunden werden.');
      }
      return participantId;
    });
};
participants.markPayedByToken = (token) => {
  return db.update('update participants SET has_payed = true, confirmation_time = current_timestamp(2) WHERE paymenttoken = $1 returning id', [token])
    .then(result => {
      if (result < 1) {
        throw new Error('Es konnte kein Teilnehmer mit ID: ' + participantId + ' gefunden werden.');
      }
      return result;
    });

};


participants.updateTime = (startnumber, finishtime) => {
  return participants.get.byStartnumber(startnumber)
    .then(participant => {
      return race.startTime().then((startTimes) => {
        let seconds = timeCalculator.relativeSeconds(startTimes,finishtime,participant.start_block);
        if ((finishtime <= participant.time ) || _.isEmpty(participant.time)) {
          return db.update('update participants set time=$2,seconds=$3 where start_number=$1', [startnumber, finishtime, seconds]);
        }
      });
    });
};

participants.insertTime = (startnumber, timestring) => {
  return participants.updateTime(startnumber, timeCalculator.timestamp(timestring));
};

participants.getTime = (startnumber) => {
  const deferred = Q.defer();
  db.select('select seconds from participants where start_number=$1', [startnumber])
    .then((result) => {
      deferred.resolve(result[0].seconds);
    })
    .catch(deferred.reject);
  return deferred.promise;
};

participants.rank = (startnumber) => {
  const deferred = Q.defer();
  db.select("select pos from (select seconds,start_number,rank() over (order by seconds) as pos from participants where visibility='yes') as ss where start_number=$1;", [startnumber])
    .then((result) => {
      deferred.resolve(result[0].pos);
    })
    .catch(deferred.reject);
  return deferred.promise;
};

participants.rankByCategory = (startnumber) => {
  const deferred = Q.defer();
  db.select("select pos from (select seconds,start_number,rank() over (partition by category order by seconds) as pos from participants where visibility='yes') as ss where start_number=$1;", [startnumber])
    .then((result) => {
      deferred.resolve(result[0].pos);
    })
    .catch(deferred.reject);
  return deferred.promise;
};

participants.bulkmail = () => {
  const deferred = Q.defer();

  participants.get.confirmed().then(confirmed => {
    participants.get.registered().then(unconfirmed => {
      _.forEach(confirmed, participant => {
        sendConfirmationMailTo(participant);
      });
      _.forEach(unconfirmed, participant => {
        sendConfirmationMailTo(participant);
      });
      deferred.resolve();
    });
  }).fail(deferred.reject);

  return deferred.promise;
};

participants.confirmationMail = (id) => {
    const deferred = Q.defer();

    participants.get.byId(id).then((participant) => {
        sendConfirmationMailTo(participant);
        deferred.resolve();
    })
    .fail(deferred.reject);

    return deferred.promise;
};

function sendConfirmationMailTo(participant) {
    mails.sendStatusEmail(participant, 'Lauf gegen Rechts 2016 - Infos zum Lauf', 'views/participants/bulkmail.pug');
}

module.exports = participants;
