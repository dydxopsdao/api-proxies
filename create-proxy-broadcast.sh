#!/bin/bash

# CloudFlare proxy worker interactive creation script.
# See: https://developers.cloudflare.com/workers/get-started/guide/

# Abort on error
set -e

# Static path to the proxy worker template
GITHUB_TEMPLATE_PATH=dydxopsdao/api-proxies/worker-templates/broadcast

# Worker specification
WORKER_NAME=interactive
CORS_ORIGIN=interactive
CREDENTIAL_HEADER=interactive
API_NAME_1=interactive
API_ENDPOINT_1=interactive
CREDENTIAL_VALUE_1=interactive
API_NAME_2=interactive
API_ENDPOINT_2=interactive
CREDENTIAL_VALUE_2=interactive

function prompt {
  read -p "$1: " $2
}

prompt "Name of the worker (e.g.: my-proxy)" WORKER_NAME
prompt "CORS origin (e.g. https://dydx.trade)" CORS_ORIGIN
prompt "Credential header name (e.g. Authorization)" CREDENTIAL_HEADER
echo
prompt "Name of target API #1 (e.g. my-target-one)" API_NAME_1
prompt "API endpoint #1 (e.g. https://api.example-1.com)" API_ENDPOINT_1
prompt "Credential header value #1 (e.g. Bearer: secretValueOne)" CREDENTIAL_VALUE_1
echo
prompt "Name of target API #2 (e.g. my-target-two)" API_NAME_2
prompt "API endpoint #2 (e.g. https://api.example-2.com)" API_ENDPOINT_2
prompt "Credential header value #2 (e.g. Bearer: secretValueTwo)" CREDENTIAL_VALUE_2

# Login to your Cloudflare account. Follow the link that will be printed.
npx wrangler login --browser false

# Create the worker in a directory that is not checked into git
mkdir -p worker-instances
cd worker-instances

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
  --var API_NAME_1:$API_NAME_1 \
  --var API_NAME_2:$API_NAME_2 \
  --var API_ENDPOINT_1:$API_ENDPOINT_1 \
  --var API_ENDPOINT_2:$API_ENDPOINT_2 \
  --var CORS_ORIGIN:$CORS_ORIGIN \
  --var CREDENTIAL_HEADER:$CREDENTIAL_HEADER

# Redeploy the worker with secrets
echo $CREDENTIAL_VALUE_1 | npx wrangler secret put CREDENTIAL_VALUE_1
echo $CREDENTIAL_VALUE_2 | npx wrangler secret put CREDENTIAL_VALUE_2

echo "Worker created successfully!"
