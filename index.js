const express = require('express');
const _ = require('underscore');
const ejs = require('ejs');
const app = express();
const path = __dirname + '/views/';
const GitHubApi = require('github');
var githubToken;
const redis = require('redis');
const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
const PORT = process.env.PORT || 8080;
const NDAYS = 30; // The number of days to display
const RECENTDAYS = 7; // How many days we consider "recent"yadaydaya

if (process.env.GITHUB_TOKEN) {
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

app.set('redisClient', redisClient);

app.use(express.static('assets'))

app.get('/data', function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    let options = setDefaultOptions(NDAYS);

    getIssueData(options, function(issuesData) {
        let filename = path + "index.ejs";
        let issueTotals = [];
        let importantIssueTotals = [];
        let labels = [];

        for (var date in issuesData.issueTotalsByDate) {
            issueTotals.unshift(issuesData.issueTotalsByDate[date]);
            importantIssueTotals.unshift(issuesData.importantIssueTotalsByDate[date]);
            prettyDate = date.split('T')[0];
            labels.unshift(prettyDate);
        }

        res.send(JSON.stringify({ importantIssues: importantIssueTotals, totalIssues: issueTotals, labels: labels}));

    });
})

app.get('/', function (req, res) {

    let options = setDefaultOptions(NDAYS);

    getIssueData(options, function(issuesData) {
        let filename = path + "index.ejs";

        let data = {
            issueTotal: issuesData.issueTotalsByDate[Object.keys(issuesData.issueTotalsByDate)[0]],
            importantIssueTotal: issuesData.importantIssueTotalsByDate[Object.keys(issuesData.importantIssueTotalsByDate)[0]],
            recentlyCreatedIssues: issuesData.recentlyCreatedIssues,
            recentlyCreatedIssuesTotal: issuesData.recentlyCreatedIssues.length,
            recentlyClosedIssues: issuesData.recentlyClosedIssues,
            recentlyClosedIssuesTotal: issuesData.recentlyClosedIssues.length
        };

        let options = {};
        ejs.renderFile(filename, data, options, function(err, str){
            // str is a rendered HTML string
            if(!err) {
                res.send(str);
            } else {
                console.log(err);
            }
        });
    });

})

app.listen(PORT, function () {
    console.log('Listening on port ' + PORT + '!');
})

// queries GitHub for issues
function queryForIssues(options, callBack) {

    let args = {
        owner: 'bufferapp',
        repo: 'buffer-web',
        filter: options.filter,
        state: options.state,
        per_page: 100
    };
    let mergedIssues = [];

    function getPageIssues(page) {
      console.log('page', page);
      args.page = page;

      github.issues.getForRepo(args, function(err, issues) {
        if (err) {
          console.log(err);
          return callBack(err);
        }

        // so that a page of just pull requests doesn't break
        if (issues && issues.data) {
            console.log(issues.data.length, 'total issues returned, including pull requests');
            issues = _.filter(issues.data, function(issue) {
                return (!issue.pull_request);
            });
            mergedIssues = mergedIssues.concat(issues);
        } else {
            callBack(null, mergedIssues);
        }

        // TODO: check date rather than pages
        if (page < options.pages) {
            getPageIssues(page + 1);
        } else {
            callBack(null, mergedIssues);
        }
      });
    }

    getPageIssues(1);





}

// returns array of num issues open by day
function getIssueData(options, callBack) {

    queryForIssues(options, function(err, issues) {

        let issuesClosedAfterDate = _.filter(issues, function(issue) {
          return issue.closed_at >= options.sinceDate;
        });

        let issuesCreatedAfterDate = _.filter(issues, function(issue) {
          return issue.created_at >= options.sinceDate;
        });

        // Now we need to get current open issues
        queryForIssues({filter: 'open', state: 'open', pages: options.pages}, function(err, openIssues) {

            let openImportantIssues = _.filter(openIssues, function(issue) {
                return isImportantIssue(issue);
            });

             // initialize an object with date as the key and current open issue count as the value
            let issueTotalsByDate = {};
            let importantIssueTotalsByDate = {};

            for (var i = 0; i < options.NDAYS; i++) {
                let d = new Date();
                d.setDate(d.getDate() - i);
                issueTotalsByDate[convertTimeToMidnight(d.toISOString())] = openIssues.length;
                importantIssueTotalsByDate[convertTimeToMidnight(d.toISOString())] = openImportantIssues.length;
            }

             _.each(issuesClosedAfterDate, function(closedIssue) {
                for (var date in issueTotalsByDate) {
                    // increment value at this date and all the prev dates
                    // if the issue was closed before or on the date
                    if (convertTimeToMidnight(closedIssue.closed_at) > date) {
                        issueTotalsByDate[date]++;
                        if (isImportantIssue(closedIssue)) {
                            importantIssueTotalsByDate[date]++;
                        }
                    }
                }
            });

            _.each(issuesCreatedAfterDate, function(openedIssue) {
                for (var date in issueTotalsByDate) {
                    // decrememnt value at this date and all the prev dates
                    if (convertTimeToMidnight(openedIssue.created_at) > date) {
                        issueTotalsByDate[date]--;
                        if (isImportantIssue(openedIssue)) {
                            importantIssueTotalsByDate[date]--;
                        }
                    }
                }
            });


            let recentlyClosedIssues = _.filter(issues, function(issue) {
              return issue.closed_at >= options.recentDate;
            });

            let recentlyCreatedIssues = _.filter(issues, function(issue) {
              return issue.created_at >= options.recentDate;
            });

            let issueData = {
                issuesOpenedAfterDate: issuesCreatedAfterDate.length,
                issuesClosedAfterDate: issuesClosedAfterDate.length,
                issueTotalsByDate: issueTotalsByDate,
                importantIssueTotalsByDate: importantIssueTotalsByDate,
                recentlyCreatedIssues: recentlyCreatedIssues,
                recentlyClosedIssues: recentlyClosedIssues
            }

            // test - cache this for 30 min
            redisClient.setex('issuesOpenedAfterDate', 30 * 60, issuesCreatedAfterDate.length);

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
    timeout: 50000
});
github.authenticate({
  type: 'oauth',
  token: githubToken
});

function convertTimeToMidnight(isoString) {
    isoString = isoString.split('T')[0] + 'T00:00:00Z';
    return isoString;
}

function isImportantIssue(issue) {
    let isImportant = false;
    _.each(issue.labels, function(label) {
        if (label.name === 'severity:S1' || label.name === 'priority:P1') {
            isImportant = true;
        }
    });
    return isImportant;
}

function setDefaultOptions(NDAYS) {
    let date = new Date();
    date.setDate(date.getDate() - NDAYS);
    let sinceDate = date.toISOString();
    sinceDate = convertTimeToMidnight(sinceDate);

    let d = new Date();
    d.setDate(d.getDate() - RECENTDAYS);
    let recentDate = d.toISOString();
    recentDate = convertTimeToMidnight(recentDate);

    let options = {
        NDAYS: NDAYS,
        sinceDate: sinceDate,
        RECENTDAYS: RECENTDAYS,
        recentDate: recentDate,
        filter: 'all',
        state: 'all',
        pages: 5,
    };

    return options;
}
