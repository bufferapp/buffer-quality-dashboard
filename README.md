# buffer-quality-dashboard

A dashboard to visualize GitHub issues for the buffer-web repo.

This runs on our Kubernetes cluster at https://quality.internal.bufferapp.com/

## To build and Run this locally

`git clone` the app

To build the image:

`docker build  -t bufferapp/buffer-quality-dashboard:<your-image-tag-name> . --file Dockerfile.development`

To check the image:
`docker images bufferapp/buffer-quality-dashboard:your-image-tag-name`

Once it's built, run
    `docker run -p 8080:8080 \
        -e GITHUB_TOKEN=<your-token> \
        --name quality-dash --rm \
        -v `pwd`:/usr/src/app \
        bufferapp/buffer-quality-dashboard:<your-image-tag-name>`

You'll need a GitHub token, which you can grab from Github, to pop into your command so the local app can query GitHub.
Keep it secret, keep it safe.

## Deploying changes

Push and merge your changes to GitHub

To deploy, do this via Slack with `/deploy buffer-quality-dashboard`. Output will be posted to the #eng-deploys slack room in Buffer Slack.


