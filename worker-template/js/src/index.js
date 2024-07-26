/**
 A simple proxy that:
 - decorates the outgoing request with a custom authentication token,
 - decorates the response from the destination host with CORS headers.

 parseUri code from: https://blog.stevenlevithan.com/archives/parseuri
 */

import { parseUri } from './parseUri.js';

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
					}
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
