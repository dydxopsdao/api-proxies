#!/bin/bash

# CloudFlare proxy worker interactive creation script.
# See: https://developers.cloudflare.com/workers/get-started/guide/

# Abort on error
set -e

# Static path to the proxy worker template
GITHUB_TEMPLATE_PATH=dydxopsdao/api-proxies/worker-templates/simple

# Worker specification
WORKER_NAME=interactive
API_ENDPOINT=interactive
CORS_ORIGIN=interactive
CREDENTIAL_HEADER=interactive
CREDENTIAL_VALUE=interactive
CORS_ALLOW_HEADERS=interactive

function prompt {
  local var_name=$2
  read -p "$1 (default: $3): " input
  # If input is empty, use the default value
  if [ -z "$input" ]; then
    eval $var_name="'$3'"
  else
    eval $var_name="'$input'"
  fi
}

prompt "Name of the worker" WORKER_NAME "example-proxy-web-mainnet"
prompt "API endpoint" API_ENDPOINT "https://api.example.com"
prompt "CORS origin" CORS_ORIGIN "https://dydx.trade"
prompt "Credential header name" CREDENTIAL_HEADER "Authorization"
prompt "Credential header value" CREDENTIAL_VALUE "Bearer secretvalue"
prompt "CORS allowed headers" CORS_ALLOW_HEADERS "Content-Type, Accept, Accept-Language, Content-Language"

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
  --var API_ENDPOINT:$API_ENDPOINT \
  --var CORS_ORIGIN:$CORS_ORIGIN \
  --var CREDENTIAL_HEADER:$CREDENTIAL_HEADER \
  --var CORS_ALLOW_HEADERS:"$CORS_ALLOW_HEADERS"

# Redeploy the worker with a secret
echo $CREDENTIAL_VALUE | npx wrangler secret put CREDENTIAL_VALUE

echo "Worker created successfully!"