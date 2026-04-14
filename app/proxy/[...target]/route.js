export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BLOCKED_RESPONSE_HEADERS = [
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
  "frame-options",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "cross-origin-resource-policy",
  "permissions-policy",
];

function decodeTarget(targetParts = []) {
  const merged = targetParts.join("/");
  const decoded = decodeURIComponent(merged);
  if (/^https?:\/\//i.test(decoded)) return decoded;
  return `https://${decoded}`;
}

function shouldHaveBody(method) {
  return !["GET", "HEAD"].includes(method.toUpperCase());
}

function toProxyPath(url) {
  return `/proxy/${encodeURIComponent(url)}`;
}

function buildRuntimeProxyScript(baseUrl) {
  const serializedBaseUrl = JSON.stringify(baseUrl);
  return `
<script>
(() => {
  const PROXY_PREFIX = "/proxy/";
  const baseUrl = new URL(${serializedBaseUrl});

  const shouldBypass = (value) =>
    typeof value === "string" &&
    (value.startsWith("data:") ||
      value.startsWith("blob:") ||
      value.startsWith("javascript:") ||
      value.startsWith("mailto:") ||
      value.startsWith("tel:"));

  const toProxiedPath = (value) => {
    if (value instanceof URL) value = value.toString();
    if (typeof value !== "string") return value;
    if (shouldBypass(value)) return value;

    let absoluteUrl;
    try {
      absoluteUrl = new URL(value, baseUrl);
    } catch {
      return value;
    }

    if (
      absoluteUrl.origin === window.location.origin &&
      absoluteUrl.pathname.startsWith(PROXY_PREFIX)
    ) {
      return value;
    }

    return PROXY_PREFIX + encodeURIComponent(absoluteUrl.toString());
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (input instanceof Request) {
      const proxiedUrl = toProxiedPath(input.url);
      if (proxiedUrl === input.url) return originalFetch(input, init);
      return originalFetch(new Request(proxiedUrl, input), init);
    }
    return originalFetch(toProxiedPath(input), init);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function open(method, url, ...rest) {
    return originalOpen.call(this, method, toProxiedPath(url), ...rest);
  };
})();
</script>
`.trim();
}

function rewriteHtml(html, baseUrl) {
  const rewrittenHtml = html.replace(
    /(href|src|action)=(["'])([^"']+)\2/gi,
    (_match, attr, quote, value) => {
      if (
        value.startsWith("#") ||
        value.startsWith("data:") ||
        value.startsWith("javascript:") ||
        value.startsWith("mailto:") ||
        value.startsWith("tel:")
      ) {
        return `${attr}=${quote}${value}${quote}`;
      }

      let absolute;
      try {
        absolute = new URL(value, baseUrl).toString();
      } catch {
        return `${attr}=${quote}${value}${quote}`;
      }

      return `${attr}=${quote}${toProxyPath(absolute)}${quote}`;
    }
  );

  const runtimeScript = buildRuntimeProxyScript(baseUrl);
  if (/<head[^>]*>/i.test(rewrittenHtml)) {
    return rewrittenHtml.replace(/<head([^>]*)>/i, `<head$1>${runtimeScript}`);
  }

  return `${runtimeScript}${rewrittenHtml}`;
}

function buildRequestHeaders(incomingHeaders) {
  const forwarded = new Headers();
  const allowed = [
    "accept",
    "accept-language",
    "cache-control",
    "content-type",
    "pragma",
    "range",
    "user-agent",
  ];

  for (const name of allowed) {
    const value = incomingHeaders.get(name);
    if (value) forwarded.set(name, value);
  }

  return forwarded;
}

function buildResponseHeaders(upstreamHeaders) {
  const headers = new Headers(upstreamHeaders);
  for (const header of BLOCKED_RESPONSE_HEADERS) {
    headers.delete(header);
  }
  headers.set("access-control-allow-origin", "*");
  return headers;
}

async function handler(request, { params }) {
  const targetUrl = decodeTarget(params.target);
  const method = request.method.toUpperCase();

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(targetUrl, {
      method,
      headers: buildRequestHeaders(request.headers),
      body: shouldHaveBody(method) ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    });
  } catch (error) {
    return Response.json(
      { error: "Unable to fetch upstream URL", details: String(error) },
      { status: 502 }
    );
  }

  const contentType = upstreamResponse.headers.get("content-type") || "";
  const headers = buildResponseHeaders(upstreamResponse.headers);

  if (contentType.includes("text/html")) {
    const html = await upstreamResponse.text();
    return new Response(rewriteHtml(html, targetUrl), {
      status: upstreamResponse.status,
      headers,
    });
  }

  const body = await upstreamResponse.arrayBuffer();
  return new Response(body, {
    status: upstreamResponse.status,
    headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
