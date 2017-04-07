# buffer-quality-dashboard

A dashboard to visualize GitHub issues for the buffer-web repo.

You can see the dashboard [here](https://secret-plateau-25519.herokuapp.com/)

## Running this locally

    docker run -p 8080:8080 \
        -e GITHUB_TOKEN=<your-token> \
        -name quality-dash --rm \
        bufferapp/buffer-quality-dashboard
