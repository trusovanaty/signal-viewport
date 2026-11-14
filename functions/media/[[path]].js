// Cloudflare Pages Function for /media/* (only used by `npm run deploy:cloudflare`).
//
// Pages serves static files whole: a request with `Range: bytes=…` still gets
// `200` and the full body. Safari (iPhone, Mac) needs `206 Partial Content`
// for <video> and may refuse to play otherwise. This answers Range requests
// from the same static file; everything else passes through unchanged, so
// swapping the demo video needs no change here.

export async function onRequest({ request, env }) {
  const range = request.headers.get('Range');
  // Fetch the static file without the Range header: we slice it ourselves.
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));

  const headers = new Headers(asset.headers);
  headers.set('Accept-Ranges', 'bytes');

  if (!range || asset.status !== 200) {
    return new Response(request.method === 'HEAD' ? null : asset.body, { status: asset.status, headers });
  }

  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());

  let start = -1;
  let end = -1;
  if (match && (match[1] !== '' || match[2] !== '')) {
    if (match[1] === '') {
      // Suffix range: the last N bytes.
      start = Math.max(0, size - Number(match[2]));
      end = size - 1;
    } else {
      start = Number(match[1]);
      end = match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1);
    }
  }

  if (start < 0 || start > end || start >= size) {
    headers.set('Content-Range', `bytes */${size}`);
    headers.delete('Content-Length');
    return new Response(null, { status: 416, headers });
  }

  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : body.slice(start, end + 1), { status: 206, headers });
}
