#!/bin/bash

GIT_TEMPLATE_PATH=dydxopsdao/api-proxies/worker-template

function prompt {
  read -p "$1: " $2
}

prompt "Enter the name of the worker (e.g.: my-worker)" WORKER_NAME
prompt "Enter the API endpoint (e.g.: https://api.example.com)" API_ENDPOINT
prompt "Enter the API key" API_KEY
prompt "Enter the CORS allow origin (e.g.: https://dydx.trade)" CORS_ALLOW_ORIGIN

# Login to your Cloudflare account. Follow the link that will be printed to the console.
npx wrangler login --browser false

# Create a new Worker project using the template
npm create cloudflare -- $WORKER_NAME --type remote-template --template $GIT_TEMPLATE_PATH --deploy false --ts false

# Change into the newly created project directory
cd $WORKER_NAME

# Create the Worker. You may be prompted to select a Cloudflare account.
npx wrangler deploy \
  --var API_ENDPOINT:$API_ENDPOINT \
  --var CORS_ALLOW_ORIGIN:$CORS_ALLOW_ORIGIN

# Redeploy the worker with the API_KEY variable
echo $API_KEY | npx wrangler secret put API_KEY
