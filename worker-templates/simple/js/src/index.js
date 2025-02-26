/**
 A simple proxy that:
 - decorates the outgoing request with a custom authentication token,
 - decorates the response from the destination host with CORS headers.
 */

 import { parseUri } from './parseUri.js';  // https://blog.stevenlevithan.com/archives/parseuri

const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"];
export default {
  async fetch(request, env) {

    const requestUri = parseUri(request.url)
    const callUrl = `${env.API_ENDPOINT}${requestUri.relative}`

    const callHeaders = new Headers(request.headers);
    callHeaders.set(env.CREDENTIAL_HEADER, env.CREDENTIAL_VALUE);

    try {

      const apiResponse = await fetch(
        callUrl,
        {
          method: request.method,
          headers: callHeaders,
          body: METHODS_WITH_BODY.includes(request.method) ? await request.text() : undefined,
        }
      );

      const newHeaders = new Headers();
      
      for (const [key, value] of apiResponse.headers.entries()) {
        newHeaders.set(key, value);
      }
      
      const origin = request.headers.get("Origin");
      
      // Allow the configured production origin and any localhost origin
      if (origin && (origin === env.CORS_ORIGIN || origin.match(/^http:\/\/localhost:[0-9]+$/))) {
        newHeaders.set("Access-Control-Allow-Origin", origin);
      } else {
        newHeaders.set("Access-Control-Allow-Origin", env.CORS_ORIGIN);
      }
      
      newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      
      // Use the configurable CORS headers environment variable or fallback to default headers
      newHeaders.set("Access-Control-Allow-Headers", `${env.CORS_ALLOW_HEADERS}, ${env.CREDENTIAL_HEADER}`);

      const newResponse = new Response(apiResponse.body, {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers: newHeaders
      });

      return newResponse;
    } catch (error) {
      return new Response("Error fetching from API", { status: 500 });
    }

  }
};
//# sourceMappingURL=index.js.map