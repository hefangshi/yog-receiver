var request = require('request');
var fs = require('fs');

request.post('http://dev073.baidu.com:8480/receiver',{
  formData : {
    custom_file: {
      value:  fs.createReadStream('../package.json'),
      options: {
        filename: 'package.json',
        contentType: 'text/json'
      }
    },
    to : './temp/package.json'
  }
},function( err, resp, body ) {
  console.log( body );
});