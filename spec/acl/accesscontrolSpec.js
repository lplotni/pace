/* jshint node: true */
/* global describe, beforeEach, afterEach, it, jasmine, expect */
'use strict';

var accesscontrol = require('../../acl/accesscontrol');

describe('access control', function() {
    it('should give access to admin page to admin', function () {
        accesscontrol.check('admin', "view admin page", function(err, result){
            expect(result).toBe(true);
        });
    });

    it('should not give access to admin page to guests', function () {
        accesscontrol.check('guest', "view admin page", function(err, result){
            expect(result).toBe(false);
        });
    });

    it('should give access to payment validation page to admin', function () {
        accesscontrol.check('admin', "confirm payment validation", function(err, result){
            expect(result).toBe(true);
        });
    });

    it('should not give access to payment validation page to guests', function () {
        accesscontrol.check('guest', "confirm payment validation", function(err, result){
            expect(result).toBe(false);
        });
    });
});