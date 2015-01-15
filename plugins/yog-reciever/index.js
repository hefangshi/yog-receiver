var path = require('path');
var fs = require('fs');
var cp = require('child_process');
var multer = require('multer');
var os = require('os');
var async = require('async');

var receiver = module.exports['yog-receiver'] = function( app, conf ){
  console.log('hook receiver start');
  app.post('/receiver',multer(conf));
  app.post('/receiver',function( req, resp, next ) {
    if( !req.body 
      || !req.body.to 
      || !req.files
      || Object.keys(req.files).length 
    ){
      return next('illegal request');
    }

    var body = req.body;
    
    yog.log.debug( '[receiver] copy file root' + conf.root);
    yog.log.debug( '[receiver] copy file to' + body.to);

    var to = path.join( conf.root, body.to );
    yog.log.debug( '[receiver] copy file to' + to);

    cp.exec( conf.cmd + path.dirname( to ),
      function( e ) {
        if( e ){
          yog.log.fatal( e );
        }
        async.each(Object.keys(req.files),
          function( file, done) {
          
            var ws = fs.createWriteStream( to );
            ws.end( req.files[file].buffer );
          
            ws.on('finish',function() {
              yog.log.debug('[receiver] copy end ' + to);
              done();
            });
            ws.on('error',function( e ) {
              done(e);
            });
          },
          function( e ) {
            req.end(null,e ? 0 : 1);
          });
      });
  });
};

receiver.defaultConf = {
  inMemory : true,
  root     : path.join(__dirname,'../../'),
  cmd      : (os.platform() == 'win32' ? 'mkdir' : 'mkdir -p') + ' '
};