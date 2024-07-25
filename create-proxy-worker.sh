#!/bin/bash

# CloudFlare proxy worker interactive creation script.
# See: https://developers.cloudflare.com/workers/get-started/guide/

# Abort on error
set -e

# Static path to the proxy worker template
GITHUB_TEMPLATE_PATH=dydxopsdao/api-proxies/worker-template

# Worker specification
WORKER_NAME=interactive
API_ENDPOINT=interactive
CORS_ORIGIN=interactive
CREDENTIAL_HEADER=interactive
CREDENTIAL_VALUE=interactive

function prompt {
  read -p "$1: " $2
}

prompt "Name of the worker (e.g.: my-proxy)" WORKER_NAME
prompt "API endpoint (e.g. https://api.example.com)" API_ENDPOINT
prompt "CORS origin (e.g. https://dydx.trade)" CORS_ORIGIN
prompt "Credential header name (e.g. Authorization)" CREDENTIAL_HEADER
prompt "Credential header value (e.g. Bearer: secretvalue)" CREDENTIAL_VALUE

# Login to your Cloudflare account. Follow the link that will be printed.
npx wrangler login --browser false

# Create a new worker project using the template
# See: https://www.npmjs.com/package/create-cloudflare
npm create cloudflare -- $WORKER_NAME \
  --type remote-template \
  --template $GITHUB_TEMPLATE_PATH \
  --deploy false \
  --ts false

# Change into the newly created project directory
cd $WORKER_NAME

# Create the worker. You may be prompted to select a Cloudflare account.
# See: https://developers.cloudflare.com/workers/wrangler/commands/#deploy
npx wrangler deploy \
  --var API_ENDPOINT:$API_ENDPOINT \
  --var CORS_ORIGIN:$CORS_ORIGIN \
  --var CREDENTIAL_HEADER:$CREDENTIAL_HEADER

# Redeploy the worker with a secret
echo $CREDENTIAL_VALUE | npx wrangler secret put CREDENTIAL_VALUE

echo "Worker created successfully!"
