 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index 81b21d56654722041e0b43d3cdf6b21509fa48b1..2823ad3b5765d79fa4080e1eae4c2f4e3d3a2979 100644
--- a/README.md
+++ b/README.md
@@ -1,24 +1,29 @@
-# Bypass x Frame
-It acts as a proxy and tries to remove cross origin blocking headers.
+# Bypass X Frame (Next.js)
 
-Still some work left to make it fully dynamic. It works good with static sites. 
+This repository is now a **standard Next.js app** with a proxy route that strips common iframe-blocking headers.
 
-If you try do any illegal activity with these code, I'm or this repo is not responsible for that.
+## Run locally
 
-## Do you need to use it
-If you just want to open iframe in your own browser, you may want to use something like a chrome plugin to achieve it. 
+```bash
+npm install
+npm run dev
+```
 
-## Requirements
-#### for client 
-Make sure that you run that file with http or https protocol. Yes, you can use live server. 
+Open `http://localhost:3000`.
 
-## Before
+## Routes
 
-<img width="1366" height="742" alt="screenshot_Wed Jul 23 06:45:34 PM +06 2025" src="https://github.com/user-attachments/assets/bc90317d-ce3f-48fc-8c7b-d286f0bcbd8e" />
+- `/` → UI with URL input and iframe.
+- `/proxy/<encoded-url>` → Proxy endpoint.
+- `/api/health` → Health check endpoint.
 
+## Example
 
-## After
-https://github.com/user-attachments/assets/c97752ef-c284-4976-ad9d-76609fe95980
+Proxy `https://example.com`:
 
+`/proxy/https%3A%2F%2Fexample.com`
 
+## Notes
 
+- The proxy removes headers like `x-frame-options` and CSP frame restrictions from upstream responses.
+- This is a best-effort compatibility proxy; many modern sites still use additional protections.
 
EOF
)
