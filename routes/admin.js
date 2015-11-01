var express = require('express');
var router = express.Router();
var accesscontrol = require('../acl/accesscontrol');
var isAuthenticated = require('../acl/authentication');

var canViewAdminPage = accesscontrol.hasPermissionTo('admin', 'view admin page');

router.get('/', isAuthenticated, function(req, res) {
    if (canViewAdminPage) {
        res.render('admin', {title: 'Pace Admin-Bereich'});
    } else {
        var result = {
            message: 'Bitte anmelden',
            error: {
                status: 'Nur Administratoren können diese Seite einsehen'
            }
        };
        res.render('error', result);
    }
});

module.exports = router;
