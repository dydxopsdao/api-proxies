/**
 A simple proxy that:
 - decorates the outgoing request with a custom authentication token,
 - decorates the response from the destination host with CORS headers.
 */

import { parseUri } from './parseUri.js';  // https://blog.stevenlevithan.com/archives/parseuri

const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"];

export default {
  async fetch(request, env, ctx) {
    const requestUri = parseUri(request.url)
    const callUrl = `${env.API_ENDPOINT}${requestUri.relative}`

    try {
      const apiResponse = await fetch(
        callUrl,
        {
          method: request.method,
          headers: {
            "Accept": "application/json",
            [env.CREDENTIAL_HEADER]: env.CREDENTIAL_VALUE,
          },
          body: METHODS_WITH_BODY.includes(request.method) ? await request.text() : undefined,
        }
      );

      const newResponse = new Response(apiResponse.body, {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers: {
          ...apiResponse.headers,
          "Access-Control-Allow-Origin": env.CORS_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": `Content-Type, ${env.CREDENTIAL_HEADER}`,
        }
      });

      return newResponse;
    } catch (error) {
      return new Response("Error fetching from API", { status: 500 });
    }
  },
};
