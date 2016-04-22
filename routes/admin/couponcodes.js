/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const isAuthenticated = require('../../acl/authentication');
const couponcodeService = require('../../service/couponcodes');


router.get('/', isAuthenticated, (req, res) => {
  let allCouponcodes = {'couponcodes': ['code1', 'code2']};

  res.render('admin/couponcodes', allCouponcodes);
});


router.post('/', isAuthenticated, (req, res) => {
  let codePromise = couponcodeService.create();
  console.log(codePromise);
  codePromise.then(code => {
      console.log('code ' + code);
      res.send(code);
    }
  )
});

module.exports = router;
