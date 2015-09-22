'use strict';
/* jshint node: true */
/* global describe, beforeEach, afterEach, it, jasmine, expect */
describe('participants service', function(){
   it('should read all participants', function(done){
     var participants = require('../../service/participants');
     participants.getAll(function (data){
         expect(data).toBeDefined();
         done();
     });
    });
});