// Cloudflare Pages Function Proxy for /api/* (China Direct & Global Edge Sync)
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
    const headers = new Headers();
    const contentType = context.request.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    const authorization = context.request.headers.get('authorization');
    if (authorization) headers.set('authorization', authorization);

    let body = null;
    if (!['GET', 'HEAD'].includes(context.request.method)) {
      body = await context.request.arrayBuffer();
    }

    const res = await fetch(targetBackend, {
      method: context.request.method,
      headers,
      body,
    });

    const resHeaders = new Headers();
    resHeaders.set('Content-Type', res.headers.get('content-type') || 'application/json');
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    resHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    resHeaders.set('Pragma', 'no-cache');
    resHeaders.set('Expires', '0');

    const resData = await res.arrayBuffer();
    return new Response(resData, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
