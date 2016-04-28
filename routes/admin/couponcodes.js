/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const isAuthenticated = require('../../acl/authentication');
const couponcodeService = require('../../service/couponcodes');


router.get('/', isAuthenticated, (req, res) => {
  let allCouponcodes = couponcodeService.getAll();

  allCouponcodes.then(codes => {
      res.render('admin/couponcodes', {couponcodes: codes});
  });
});

router.post('/', isAuthenticated, (req, res) => {
  let codePromise = couponcodeService.create();
  codePromise.then(code => {
      res.send(code);
    }
  );
});

module.exports = router;
