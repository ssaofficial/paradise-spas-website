const DEFAULT_ORIGIN = 'https://www.paradisespas.com';

export function corsHeaders(env, request) {
  var allowed = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  var origin = request.headers.get('Origin') || '';
  var allowOrigin = origin === allowed || origin === allowed.replace('www.', '') ? origin : allowed;

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

export function jsonResponse(data, status, env, request) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign(
      { 'Content-Type': 'application/json' },
      corsHeaders(env, request)
    )
  });
}
