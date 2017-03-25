var express = require('express')
var _ = require('underscore');
var ejs = require('ejs');
var app = express()
var path = __dirname + '/views/';
var GitHubApi = require('github');
var githubToken;

const PORT = process.env.PORT || 3000;

if (process.env.ENV === 'production') {
    githubToken = process.env.GITHUB_TOKEN;
} else {
    try {
        githubToken = require('./githubToken.json');
    }
    catch(error) {
        console.error('No GitHub token found');
        return;
    }
}

app.use(express.static('assets'))

app.get('/', function (req, res) {

    var args = {
        owner: 'bufferapp',
        repo: 'buffer-web',
        filter: 'open',
        state: 'open',
        since: (new Date(0)).toISOString(),
        per_page: 100
    };

    github.issues.getForRepo(args, function(err, issues) {

        issues = _.filter(issues.data, function(issue) {
          return (!issue.pull_request);
        });

        let importantIssues = _.filter(issues, function(issue) {
            let important = false;
            _.each(issue.labels, function(label) {
                if (label.name === 'severity:S1' || label.name === 'priority:P1') {
                    important = true;
                }
            });
            return important;
        });

        let filename = path + "index.ejs";
        let data = {
            issueTotal: issues.length,
            importantIssueTotal: importantIssues.length
        };
        let options = {};
        ejs.renderFile(filename, data, options, function(err, str){
            // str is a rendered HTML string
            res.send(str);
        });

    });

})

app.listen(PORT, function () {
    console.log('Example app listening on port ' + PORT + '!')
})

const github = new GitHubApi({
    // optional
    debug: false,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "Buffer-GitHub-Client" // GitHub is happy with a unique user agent
    },
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});
github.authenticate({
  type: 'oauth',
  token: githubToken
});