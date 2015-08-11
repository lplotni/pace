describe('participants service', function(){
   it('should read all participants', function(done){
     var participants = require('../../service/participants');
     participants.getAll(function (data){
         expect(data).toBeDefined();
         done();
     });
    });
});