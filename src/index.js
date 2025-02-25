const apiResponse = await fetch(
  callUrl,
  {
    method: request.method,
    headers: callHeaders,
    body: METHODS_WITH_BODY.includes(request.method) ? await request.text() : undefined,
  }
);

// Create new headers object
const newHeaders = new Headers();

// Copy all original headers
apiResponse.headers.forEach((value, key) => {
  newHeaders.set(key, value);
});

// Add CORS headers
newHeaders.set("Access-Control-Allow-Origin", env.CORS_ORIGIN);
newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
newHeaders.set("Access-Control-Allow-Headers", `Content-Type, Accept, Accept-Language, Content-Language, Solana-Client, ${env.CREDENTIAL_HEADER}`);

const newResponse = new Response(apiResponse.body, {
  status: apiResponse.status,
  statusText: apiResponse.statusText,
  headers: newHeaders
}); 