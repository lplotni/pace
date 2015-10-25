/* jshint node: true */
/* global describe, beforeEach, afterEach, it, jasmine, expect */
'use strict';

describe('payment validation', function() {
    describe('canAccess', function() {
        var canAccess = require('../routes/paymentValidation.js').canAccess;

        it('should not give access to non-admin users', function () {
            var userRole = 'guest';
            expect(canAccess(userRole)).toBe(false);
        });

        it('should give access to admin users', function () {
            var userRole = 'admin';
            expect(canAccess(userRole)).toBe(true);
        });
    });
});