/* jshint node: true */
/* jshint esnext: true */
/* global jasmine */
'use strict';

let ParticipantBuilder = function() {
  let self = {};
  let internalObj = {}

  self.initDefault = function() {
    // self = {};
    internalObj.firstname = 'Martin';
    internalObj.lastname = 'Fowler';
    internalObj.email = 'test@example.com';
    internalObj.category = 'm';
    internalObj.birthyear = 1963;
    internalObj.team = 'ThoughtWorks';
    internalObj.visibility = 'no';

    internalObj.tshirt = {
      details: [{ size: 'S', model: 'Normal fit' }],
      amount: 0
    }

    return self;
  }

  self.withVisibility = function(visibility) {
    internalObj.visibility = (visibility == true) ? 'yes' : 'no'
    return self
  }

  self.withTshirt = function(shirtSize, shirtModel) {
    internalObj.tshirt = {
      details : [
        {
          size : shirtSize,
          model : shirtModel
        }
      ],
      amount : 1
    }

    return self;
  }

  self.withFirstName = function(inputFirstName) {
    internalObj.firstname = inputFirstName;

    return self;
  }

  self.build = function() {
    return internalObj;
  }

  return self
}

module.exports = {ParticipantBuilder : ParticipantBuilder};
