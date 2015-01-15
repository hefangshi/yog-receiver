var async = require('async');

async.auto({
  http : ['log','other',function( cb, res ) {
    console.log('http');
    process.nextTick(cb);
  }],
  'yog-receiver' : function( cb, res ) {
    console.log('no deps, wont exec');
    process.nextTick(cb);
  },
  log : function( cb ) {
    console.log('dep by others, exec');
    process.nextTick(cb);
  },
  other : function( cb ) {
    console.log('dep by others, exec');
    process.nextTick(cb);
  }
},function() {
  console.log( 'finish');
})