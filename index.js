var express = require('express')
var app = express()
var path = __dirname + '/views/';
const token = process.env.GITHUB_TOKEN;

if (!token) {
    try {
        const token = require('./githubToken.json');
    }
    catch(error) {
        console.log('No Github token');
        return;
    }
}

const PORT = process.env.PORT || 3000;

app.use(express.static('assets'))

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path + "index.html");
})

app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT + '!')
})