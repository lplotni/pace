/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const pdfGeneration = require('../../pdf/pdfGeneration');

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
    pdfGeneration.generate().then(() => {
      res.redirect('/admin/download-pdf');
    });
  }
});

router.get('/download-pdf', isAuthenticated, (req, res) => {
  if (canViewAdminPage(req.user.role)) {
    res.download('start_numbers.pdf');
  }
});

module.exports = router;
