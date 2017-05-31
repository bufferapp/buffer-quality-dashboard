# buffer-quality-dashboard

A dashboard to visualize GitHub issues for the buffer-web repo.

This runs on our Kubernetes cluster at https://quality.internal.bufferapp.com/

## To build and Run this locally

`git clone` the app
`npm install`
`GITHUB_TOKEN=<your github token> docker-compose up`

You'll need a GitHub token, which you can grab from Github, to pop into your command so the local app can query GitHub.
Keep it secret, keep it safe.

## Deploying changes

Push and merge your changes to GitHub

To deploy, do this via Slack with `/deploy buffer-quality-dashboard`. Output will be posted to the #eng-deploys slack room in Buffer Slack.


