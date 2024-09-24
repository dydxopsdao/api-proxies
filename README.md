# api-proxies

A collection of API proxies to various third parties.

* Each proxy is a standalone CloudFlare JS-based worker.
* Each proxy adds CORS headers allowing a single origin.
* For multiple origins, create separate workers for each.

## Creating a proxy

Use one of the interactive scripts: `create-proxy-simple.sh` or `create-proxy-broadcast.sh`.

The script will prompt for configuration values, perform
a browser-based login to CloudFlare, and deploy the worker.

Ensure accurate setup. For instance, to append `Authorization` header
with value `Bearer: 123`, input the complete value including `Bearer: `.
