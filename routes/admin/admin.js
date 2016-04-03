/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const pdfGeneration = require('../../pdf/pdfGeneration');
const registration = require('../../service/registration');

let canViewAdminPage = function (role) {
  return accesscontrol.hasPermissionTo(role, 'view admin page');
};

router.get('/', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    let admininfo = require('../../service/admininfo');
    admininfo.getShirtOrders().then(orders =>
      admininfo.getConfirmedParticipants().then(confirmed =>
        admininfo.getUnconfirmedParticipants().then(unconfirmed =>
          res.render('admin/admin', {orders, confirmed ,unconfirmed, isAdmin: true}))));
  } else {
    res.render('error', {
      message: 'Bitte anmelden',
      error: {
        status: 'Nur Administratoren können diese Seite einsehen'
      }
    });
  }
});

router.get('/generate-start-numbers', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    pdfGeneration.generate(res);
  }
});

router.get('/bulkmail', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    let participants = require('../../service/participants');
    participants.bulkmail().then(result  =>
      res.render('admin/bulkmail', {count: result})
    );

  } else {
    res.render('error', {
      message: 'Bitte anmelden',
      error: {
        status: 'Nur Administratoren können diese Seite einsehen'
      }
    });
  }
});

router.post('/close-registration', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    registration.close().then( () =>
      res.render('admin/closeRegistration/success', {isAdmin: true})
    );
  }
});

router.post('/reopen-registration', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    registration.reopen().then( () =>
      res.redirect('/admin')
    );
  }
});

module.exports = router;
