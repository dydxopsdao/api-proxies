/**
 A simple proxy that adds a bearer token to the outgoing request.

 parseUri code from: https://blog.stevenlevithan.com/archives/parseuri
 */

 import { parseUri } from './parseUri.js';

 export default {
   async fetch(request, env, ctx) {
	 const requestUri = parseUri(request.url)
	 const callUrl = `${env.API_ENDPOINT}${requestUri.relative}`
 
	 const apiResponse = await fetch(
	   callUrl,
	   {
		 method: request.method,
		 headers: {
		   "Authorization": `Bearer: ${env.API_KEY}`,
		 }
	   }
	 );
 
	 const newResponse = new Response(apiResponse.body, {
	   status: apiResponse.status,
	   statusText: apiResponse.statusText,
	   headers: {
		 ...apiResponse.headers,
		 "Access-Control-Allow-Origin": "*",  // TODO: change to https://dydx.trade or appropriate domain
		 "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
		 "Access-Control-Allow-Headers": "Content-Type, Authorization, X-ACCESS-KEY",
	   }
	 });
 
	 return newResponse;
   },
 };
 