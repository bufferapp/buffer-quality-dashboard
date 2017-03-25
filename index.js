var express = require('express')
var app = express()
var path = __dirname + '/views/';

const PORT = process.env.PORT || 3000;

app.use(express.static('assets'))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path + "index.html");
})

app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT + '!')
})