# buffer-quality-dashboard

A dashboard to visualize GitHub issues for the buffer-web repo.

This runs on our Kubernetes cluster at https://quality.internal.bufferapp.com/

## To build and Run this locally

`git clone` the app

run
`npm install`

set your GitHub token as an environment variable and bring it up:
`GITHUB_TOKEN=<your github token>`
then
`docker-compose up`

You'll need a GitHub token, which you can grab from Github, to pop into your command so the local app can query GitHub. Don't wrap it in quotes like `'1s4a...'`, quote it directly, like `1s4a...`
Keep it secret, keep it safe.

## Deploying changes

Push and merge your changes to GitHub

To deploy, do this via Slack with `/deploy buffer-quality-dashboard`. Output will be posted to the #eng-deploys slack room in Buffer Slack.


