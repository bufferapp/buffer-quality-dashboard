var express = require('express');
var _ = require('underscore');
var Promise = require('bluebird');
var ejs = require('ejs');
var app = express();
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

app.get('/data', function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    const NDAYS = 5;
    let date = new Date();
    date.setDate(date.getDate() - NDAYS);
    let sinceDate = date.toISOString();
    sinceDate = convertTimeToMidnight(sinceDate);

    let options = {
        NDAYS: NDAYS,
        sinceDate: sinceDate,
        filter: 'all',
        state: 'all',
    };

    getIssueData(options, function(issuesData) {
        let filename = path + "index.ejs";
        let data = {
            issueTotal: issuesData.totalIssues.length,
            importantIssueTotal: issuesData.importantIssues.length,
            issueTotalsByDate: issuesData.issueTotalsByDate
        };

        let issueTotals = [];
        let importantIssueTotals = [];
        let labels = []
        for (var date in issuesData.issueTotalsByDate) {
            issueTotals.unshift(issuesData.issueTotalsByDate[date]);
            importantIssueTotals.unshift(0);
            prettyDate = date.split('T')[0];
            labels.unshift(prettyDate);
        }


        res.send(JSON.stringify({ importantIssues: importantIssueTotals, totalIssues: issueTotals, labels: labels}));

    });
})

app.get('/', function (req, res) {

    const NDAYS = 5;
    let date = new Date();
    date.setDate(date.getDate() - NDAYS);
    let sinceDate = date.toISOString();
    sinceDate = convertTimeToMidnight(sinceDate);

    let options = {
        NDAYS: NDAYS,
        sinceDate: sinceDate,
        filter: 'all',
        state: 'all',
    };

    getIssueData(options, function(issuesData) {
        let filename = path + "index.ejs";
        let data = {
            issueTotal: issuesData.totalIssues.length,
            importantIssueTotal: issuesData.importantIssues.length,
            issueTotalsByDate: issuesData.issueTotalsByDate
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

// queries GitHub for issues
function queryForIssues(options, callBack) {
    var args = {
        owner: 'bufferapp',
        repo: 'buffer-web',
        filter: options.filter,
        state: options.state,
        per_page: 100
    };

    if (options.sinceDate != null) {
        args.since = options.sinceDate; // Only issues updated at or after this time are returned
    }

    console.log('args', args);

     github.issues.getForRepo(args, function(err, issues) {
        console.log(issues.data.length, 'total issues returned, including pull requests');
        // TODO use the bluebird promise pattern to paginate
        issues = _.filter(issues.data, function(issue) {
          return (!issue.pull_request);
        });
        callBack(issues);
     });
}

// returns array of num issues open by day
function getIssueData(options, callBack) {
    queryForIssues(options, function(issues) {

        let issuesClosedAfterDate = _.filter(issues, function(issue) {
            // issue.created_at; issue.updated_at, issue.closed_at
            // closed_at: '2017-03-17T12:50:51Z'
          return issue.closed_at >= options.sinceDate;
        });

        console.log(issuesClosedAfterDate.length, 'issues closed in last ', options.NDAYS, ' days');

        let issuesCreatedAfterDate = _.filter(issues, function(issue) {
          return issue.created_at >= options.sinceDate;
        });

        console.log(issuesCreatedAfterDate.length, 'issues opened in last ', options.NDAYS, ' days');

        // Now we need to get current open issues
        queryForIssues({filter: 'open', state: 'open'}, function(openIssues) {
             // initialize an object with date as the key and current open issue count as the value
            let issueTotalsByDate = {};
            for (var i = 0; i < options.NDAYS; i++) {
                let d = new Date();
                d.setDate(d.getDate() - i);
                issueTotalsByDate[convertTimeToMidnight(d.toISOString())] = openIssues.length;
            }

            console.log(issueTotalsByDate);


             _.each(issuesClosedAfterDate, function(closedIssue) {
                //console.log('issue.closed_at: ', convertTimeToMidnight(closedIssue.closed_at));
                for (var date in issueTotalsByDate) {
                    //console.log('date key: ', date);
                    // increment value at this date and all the prev dates
                    // if the issue was closed before or on the date
                    if (convertTimeToMidnight(closedIssue.closed_at) > date) {
                        //console.log("incrementing " + date + " from " + issueTotalsByDate[date]);
                        issueTotalsByDate[date]++;
                        //console.log("to the new total of", issueTotalsByDate[date]);
                    }
                }
            });

            console.log(issueTotalsByDate);

            _.each(issuesCreatedAfterDate, function(openedIssue) {
                console.log('issue.opened_at: ', convertTimeToMidnight(openedIssue.created_at));
                for (var date in issueTotalsByDate) {
                    console.log('date key: ', date);
                    // decrememnt value at this date and all the prev dates
                    if (convertTimeToMidnight(openedIssue.created_at) > date) {
                        console.log("decrememtning " + date + " from " + issueTotalsByDate[date]);
                        issueTotalsByDate[date]--;
                        console.log("to the new total of", issueTotalsByDate[date]);
                    }
                }
            });

            console.log(issueTotalsByDate);

            let importantIssues = _.filter(issues, function(issue) {
                let isImportant = false;
                _.each(issue.labels, function(label) {
                    if (label.name === 'severity:S1' || label.name === 'priority:P1') {
                        isImportant = true;
                    }
                });
                return isImportant;
            });

            // want to return an array of total issues by day and important issues by day
            let issueData = {
                totalIssues: issues,
                importantIssues: importantIssues,
                issueTotalsByDate: issueTotalsByDate
            }

            callBack(issueData);
        });
    });
}

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

function convertTimeToMidnight(isoString) {
    isoString = isoString.split('T')[0] + 'T00:00:00Z';
    return isoString;
}

