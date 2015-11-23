'use strict';
/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, it, expect */

describe('participantsSorter', function () {

    var participantsSorter = require('../../domain/participantsSorter');
    var participants = [
        { firstname: "Stefan",
            lastname: "Zweig",
            email: "sz@test.com",
            gender: "male",
            birthyear: "1881",
            has_payed: false
        },
        { firstname: "Charles",
            lastname: "Baudelaire",
            email: "cb@test.com",
            gender: "male",
            birthyear: "1821",
            team: "",
            has_payed: false
        },
        { firstname: "Jane",
            lastname: "Austen",
            email: "ja@test.com",
            gender: "female",
            birthyear: "1775",
            team: "abc",
            has_payed: true
        }
    ];

    it("should sort the participants by last name and default to descending order", function () {
        var sortedList = participantsSorter.byLastname(participants);
        expect(sortedList[0].lastname).toBe("Austen");
    });

    it("should sort the participants by first name in ascending order", function () {
        var sortedList = participantsSorter.byFirstname(participants, participantsSorter.sortingStrategy.ACSCENDING);
        expect(sortedList[0].firstname).toBe("Stefan");
    });

    it("should sort the participants by email address in descending order", function () {
        var sortedList = participantsSorter.byEmail(participants, participantsSorter.sortingStrategy.DESCENDING);
        expect(sortedList[0].email).toBe("cb@test.com");
    });

    it("should sort the participants by gender", function () {
        var sortedList = participantsSorter.byGender(participants);
        expect(sortedList[0].gender).toBe("female");
    });

    it("should sort the participants by birthyear", function () {
        var sortedList = participantsSorter.byGender(participants);
        expect(sortedList[0].birthyear).toBe("1775");
    });

    it("should sort the participants by team name", function () {
        var sortedList = participantsSorter.byTeam(participants);
        expect(sortedList[0].team).toBe("");
    });

    it("should sort the participants by payment status", function () {
        var sortedList = participantsSorter.byPaymentstatus(participants);
        expect(sortedList[0].has_payed).toBe(false);
    });
});