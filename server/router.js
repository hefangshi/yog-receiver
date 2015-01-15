module.exports = function(router){
  var fs = require('fs');
  var cp = require('child_process');
  var path = require('path');
  var multer = require('multer');
  router.use(multer({
    inMemory : true
  }))
  router.route('/reciever')
    .post(function( req, resp, next ) {
      var body = req.body;
      var to = body.to;
      cp.exec('mkdir ' + path.dirname(to),function( e ) {
        var ws = fs.createWriteStream( to );
        ws.write( req.files[0].buffer );
        ws.on('drain',function() {
          req.end(0);
        });
      })
    });
};