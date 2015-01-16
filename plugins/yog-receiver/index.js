var path = require('path');
var fs = require('fs');
var cp = require('child_process');
var multer = require('multer');
var os = require('os');
var async = require('async');
var cluster = require('cluster');

var receiver = module.exports['yog-receiver'] = function( app, conf ){
  yog.log.debug('[receiver] ' + 'hook receiver start');

  var restart_counter = 0;
  var shutdown = 0;
  function call_restart () {
    restart_counter --;
    if( restart_counter == 0 ){
      yog.log.debug('wait for restart');
      if( os.platform == 'win32' ){
        console.log('win32 skip restart');
        yog.log.debug('restart wont run on win32 platform');
        return;
      }
      setTimeout(restart,1000);
    }
  }
  function wait_restart () {
    restart_counter ++;
  }
  function restart () {
    if( restart_counter != 0
      || shutdown
    ){
      return;
    }

    shutdown = 1;
    console.log('try restart');
    yog.server.close(function() {
      if( fs.existsSync( 
            path.join( yog.ROOT_PATH, 
                       'bin/yog_control'))
        && cluster.isWorker
      ){
        console.log(' yog_control env');
        cp.exec('nohup sh ./bin/yog_control start > /dev/null 2>&1 &',
                {cwd : yog.ROOT_PATH });
      } else {
        console.log(' pure node env');
        var out = fs.openSync(
                    path.join(
                      yog.ROOT_PATH,'child.log'),'a');
        
        var new_n = cp.spawn('nohup',['node','./bin/www','&'],
                {
                  detached: true,
                  cwd : yog.ROOT_PATH,
                  stdio: [ 'ignore', out, out ]
                });

        new_n.unref();

        setTimeout(function() {
          console.log('current node exit');
          process.exit(0);
        },3000);
      }
    });
  }
  app.post('/receiver',multer(conf));
  app.post('/receiver',function( req, resp, next ) {
    if( !req.body 
      || !req.body.to 
      || !req.files
      || !Object.keys(req.files).length 
    ){
      yog.log.debug('[receiver] ' + 'illegal request');

      return next('illegal request');
    }

    var body = req.body;
    
    yog.log.debug( '[receiver] copy file root' + conf.root);
    yog.log.debug( '[receiver] copy file to' + body.to);

    var to = path.join( conf.root, body.to );
    yog.log.debug( '[receiver] copy file to' + to);
    
    wait_restart();
    cp.exec( conf.cmd + path.dirname( to ),
      function( e ) {
        if( e ){
          yog.log.debug('[receiver] ' + 'mkdir end,', e );
        }
        async.each(Object.keys(req.files),
          function( file, done) {
            if( !req.files[file].buffer ){
              done(null);
              yog.log.debug('[receiver] copy end not a file');
              return
            }
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
            yog.log.debug('[receiver] ' + 'receiver end ', e );

            if( !e ){
              call_restart();
            }

            resp.end(e ? '1' : '0');
          });
      });
  });
};

receiver.defaultConf = {
  inMemory : true,
  root     : yog.ROOT_PATH,
  cmd      : (os.platform() == 'win32' ? 'mkdir' : 'mkdir -p') + ' ',
  onFileUploadStart : function( file ) {
    yog.log.debug('[receiver] ' + file.fieldname + ' is starting ...')
  },
  onFileUploadData: function( file, data ) {
    yog.log.debug('[receiver] ' + data.length + ' of ' + file.fieldname + ' arrived')
  },
  onFileUploadComplete: function( file ) {
    yog.log.debug('[receiver] ' +  file.fieldname, 'end');
  }
};