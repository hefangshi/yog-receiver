var path = require('path');
var fs = require('fs');
var cp = require('child_process');
var multer = require('multer');
var os = require('os');

var receiver = module.exports['yog-receiver'] = function( app, conf ){
  return function(){
    console.log('hook receiver reqs');
    console.log(app);

    app.post('/receiver',multer(conf));
    app.post('/receiver',function( req, resp, next ) {
      var body = req.body;
      var to = path.join( conf.root, body.to );
      yog.log.debug( '[receiver] copy file to', to);
      cp.exec( conf.cmd + path.dirname( to ),
        function( e ) {
          if( e ){
            yog.log.fatal( e );
          }

          var ws = fs.createWriteStream( to );
          ws.end( req.files[0].buffer );
          ws.on('finish',function() {
            yog.log.debug('[receiver] copy end ', to);
            req.end(0);
          });
        });
    });
  }
};

receiver.defaultConf = {
  inMemory : true,
  root     : path.join(__dirname,'../../'),
  cmd      : (os.platform() == 'win32' ? 'mkdir' : 'mkdir -p') + ' '
};