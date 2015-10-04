'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterAll, it, jasmine, expect */

describe('participants service', function () {

    const participants = require('../../service/participants');
    var pg = require('pg');

    beforeEach(function (done) {
        var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || "tcp://vagrant@localhost/pace";
        var jasmineDone = done;

        pg.connect(connectionString, function (err, client, done) {
                client.query('delete from participants', function () {
                    done();
                    jasmineDone();
                });
            }
        );

    });

    afterAll(function(done) {
        pg.end();
        done();
    });


    it('should store and read participants', function (done) {
        var aParticipant = {
            firstname: 'Hertha',
            lastname: 'Mustermann',
            email: 'h.mustermann@example.com'
        };

        participants.save(aParticipant)
            .then(participants.getAll)
            .then(function (data) {
                expect(data.length).toBe(1);
                expect(data[0].firstname).toBe(aParticipant.firstname);
                expect(data[0].lastname).toBe(aParticipant.lastname);
                expect(data[0].email).toBe(aParticipant.email);
                done();
            });
    });
});