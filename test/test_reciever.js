var request = require('request');

request.post('http://dev073.baidu.com:8480/receiver',{
  custom_file: {
    value:  fs.createReadStream('../package.json'),
    options: {
      filename: 'topsecret.jpg',
      contentType: 'image/jpg'
    }
  },
  to : './temp/package.json'
});