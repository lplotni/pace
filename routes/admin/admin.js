/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const _ = require('lodash');
const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const pdfGeneration = require('../../pdf/pdfGeneration');
const registration = require('../../service/registration');
const stats = require('../../service/stats');
const participants = require('../../service/participants');
const Redis = require('ioredis');
const redis = new Redis(6379, process.env.REDISHOST || 'localhost');

let canViewAdminPage = (role) => accesscontrol.hasPermissionTo(role, 'view admin page');

let renderNotAllowed = (res) => res.render('error', {
  message: 'Bitte anmelden',
  error: {
    status: 'Nur Administratoren können diese Seite einsehen'
  }
});

router.get('/', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    Q.allSettled(
      [stats.shirtOrders(), stats.confirmedParticipantsCount(), stats.unconfirmedParticipantsCount(), stats.usageData()])
      .then((results) => {
        let r = results.map(r => r.value);

        participants.get.blancParticipants().then((blancParticipants) => {
          res.render('admin/admin', {
              numBlancParticipants: blancParticipants.length,
              registrationsData: r[3].registrations,
              confirmationsData: r[3].confirmations,
              labels: r[3].dates,
              shirts: {
                regular: stats.reqularShirts(r[0]),
                slim: stats.slimShirts(r[0])
              },
              participants: {
                confirmed: r[1][0].count,
                unconfirmed: r[2][0].count
              }
            }
          );
        });
      });
  } else {
    renderNotAllowed(res);
  }
});

router.get('/generate-start-numbers', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    pdfGeneration.generateStartNumbers(redis).then(() => {
      res.redirect('back');
    }).fail((msg) => {
      console.error(msg);
      res.redirect('back');
    });
  }
});

router.post('/generate-on-site-start-numbers', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    participants.saveBlancParticipants(_.toInteger(req.body.amountOnSite)).then(() => {
      pdfGeneration.generateOnSiteStartNumbers(redis).then(() => {
        res.redirect('back');
      }).fail((msg) => {
        console.error(msg);
        res.redirect('back');
      });
    });
  }
});

router.get('/bulkmail', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    participants.bulkmail().then(result =>
      res.render('admin/bulkmail', {count: result})
    );
  } else {
    renderNotAllowed(res);
  }
});

router.post('/close-registration', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    registration.close().then(() =>
      res.render('admin/closeRegistration/success')
    );
  }
});

router.post('/reopen-registration', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    registration.reopen().then(() =>
      res.redirect('/admin')
    );
  }
});

module.exports = router;
