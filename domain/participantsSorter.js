'use strict';
/* jshint esnext: true */

var particpantsSorter = function () {

    var sortingStrategy = {
        ACSCENDING: "asc",
        DESCENDING: "desc"
    };

    var _sort = function (participants, strategy, fieldName) {
        participants.sort(function (a, b) {
            if (strategy === sortingStrategy.ACSCENDING) {
                return a[fieldName] < b[fieldName];
            } else {
                return a[fieldName] > b[fieldName];
            }
        });
        return participants;
    };

    var byLastname = function (participants, strategy) {
        return _sort(participants, strategy, "lastname");
    };

    var byFirstname = function (participants, strategy) {
        return _sort(participants, strategy, "firstname");
    };

    var byEmail = function (participants, strategy) {
        return _sort(participants, strategy, "email");
    };

    var byGender = function (participants, strategy) {
        return _sort(participants, strategy, "gender");
    };

    var byTeam = function (participants, strategy) {
        return _sort(participants, strategy, "team");
    };

    var byPaymentstatus = function (participants, strategy) {
        return _sort(participants, strategy, "has_payed");
    };

    return {
        byFirstname: byFirstname,
        byLastname: byLastname,
        byEmail: byEmail,
        byGender: byGender,
        byTeam: byTeam,
        byPaymentstatus: byPaymentstatus,
        sortingStrategy: sortingStrategy
    }
}();

module.exports = particpantsSorter;