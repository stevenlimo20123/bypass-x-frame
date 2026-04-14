# Bypass X Frame (Next.js)

This repository is now a **standard Next.js app** with a proxy route that strips common iframe-blocking headers.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

- `/` → UI with URL input and iframe.
- `/proxy/<encoded-url>` → Proxy endpoint.
- `/api/health` → Health check endpoint.

## Example

Proxy `https://example.com`:

`/proxy/https%3A%2F%2Fexample.com`

## Notes

- The proxy removes headers like `x-frame-options` and CSP frame restrictions from upstream responses.
- This is a best-effort compatibility proxy; many modern sites still use additional protections.
