// Cloudflare Pages Function Proxy for /api/*
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetBackend = `https://ais-pre-npfi3bhin65t45nidjshwv-434417124417.us-west2.run.app${url.pathname}${url.search}`;

  // Handle CORS Preflight (OPTIONS)
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      },
    });
  }

  try {
    const requestHeaders = new Headers(context.request.headers);
    requestHeaders.set('Host', 'ais-pre-npfi3bhin65t45nidjshwv-434417124417.us-west2.run.app');

    const res = await fetch(targetBackend, {
      method: context.request.method,
      headers: requestHeaders,
      body: ['GET', 'HEAD'].includes(context.request.method) ? null : await context.request.arrayBuffer(),
    });

    const resHeaders = new Headers(res.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
