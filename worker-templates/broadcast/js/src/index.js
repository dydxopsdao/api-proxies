/**
 A proxy that:
 - forwards the incoming request to one or two destination hosts,
 - decorates each outgoing request with a custom authentication token,
 - returns a JSON response to the client with the results of each API call.
 */

import { parseUri } from './parseUri.js';  // https://blog.stevenlevithan.com/archives/parseuri

const METHODS_WITH_BODY = ["POST", "PUT", "PATCH"];

export default {
  async fetch(request, env, ctx) {
    // Parse the incoming request
    const requestUri = parseUri(request.url)
    const requestBody = METHODS_WITH_BODY.includes(request.method) ? await request.text() : undefined;

    // Determine which API endpoints to call
    const apiEndpointCandidates = [
      { id: "endpoint-1", url: env.API_ENDPOINT_1, credential: env.CREDENTIAL_VALUE_1 },
      { id: "endpoint-2", url: env.API_ENDPOINT_2, credential: env.CREDENTIAL_VALUE_2 },
    ];
    const apiEndpoints = apiEndpointCandidates.filter(candidate => candidate.url);

    // Call the API endpoints in parallel
    const responsePromises = apiEndpoints.map(endpoint => callEndpoint(
      endpoint.id,
      endpoint.url,
      requestUri.relative,
      request.method,
      requestBody,
      env.CREDENTIAL_HEADER,
      endpoint.credential,
    ));
    const responses = await Promise.all(responsePromises);

    // Return a response to the client
    return new Response(
      JSON.stringify({ responses }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": env.CORS_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        }
      }
    );
  }
};

async function callEndpoint(endpointId, baseUrl, urlPath, method, body, credentialName, credentialValue) {
  try {
    const callUrl = `${baseUrl}${urlPath}`;

    const apiResponse = await fetch(
      callUrl,
      {
        method: method,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          [credentialName]: credentialValue,
        },
        body: body,
      }
    );

    return {
      endpoint: endpointId,
      status: apiResponse.status,
      body: JSON.stringify(await apiResponse.json()),
    };
  } catch (error) {
    return {
      endpoint: endpointId,
      message: String(error),
    };
  }
}
