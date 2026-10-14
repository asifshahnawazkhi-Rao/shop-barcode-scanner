# Scan-only prototype

Open https://asifshahnawazkhi-rao.github.io/shop-barcode-scanner/ directly on a phone. Tap Start camera, allow camera access, and hold a product barcode steady in good light. The result preserves leading zeroes. Stop the camera before changing cameras. Copy and clear act only on the displayed result.

Detection is not a Stock OUT transaction. This version has no Apps Script URL, Sheets connection, login, PIN, inventory lookup or stock-saving code. Existing Google Apps Script and spreadsheet data are not touched. The pinned html5-qrcode 2.3.8 library is loaded with an integrity check from jsDelivr. Camera processing happens locally.

## Safe integration later

1. Back up the existing Apps Script project and spreadsheet. Inspect the current stock-saving function and column schema privately; never copy inventory or credentials into this public repository. Test against a separate spreadsheet copy first.
2. Prefer a restricted, signed-in Apps Script web app for the inventory workflow. It can serve its own interface and invoke server functions through google.script.run. Choose execution identity and access restrictions intentionally; do not make an owner-authority write endpoint anonymously accessible just to solve browser access problems.
3. If keeping the Pages interface, add an authenticated backend with verified user identity and server-side authorization. GitHub Pages is static and cannot securely hold secrets. Store service credentials only on that backend. A secret endpoint URL, CORS rule or client-side PIN check is not authentication. Never put a PIN, token, password or Google OAuth token in HTML, JavaScript, query strings, localStorage or Git history. A server-side PIN alone is weaker than individual sign-in; if required, use secure transport, server-side verification, rate limits, and avoid logging it.
4. Validate barcode as a string, item existence, positive integer quantity, available stock and the staff member's permissions on the server. Require an explicit confirmation showing item and quantity before saving. Keep detection, pending submission, confirmed save, rejected save and unknown outcome separate in the interface.
5. Use a unique transaction/request ID and server-side duplicate prevention. Protect stock checks and updates against concurrent writes, for example with Apps Script LockService. Keep an audit record. Design partial-failure recovery because spreadsheets do not provide a general multi-write transaction.
6. Return a structured success response with transaction ID only after the stock operation is complete. Show "Stock OUT saved" only after checking that response. A successful scan, HTTP 200, opened URL, or opaque no-cors fetch response does not prove a stock save. On timeout, show "Save status unknown" and reconcile by request ID before retrying.
7. Test denied access, invalid barcode/quantity, insufficient stock, duplicate requests, concurrency, network failure and acknowledgement loss on the test copy before enabling production writes.

Official references:
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/html/communication
- https://developers.google.com/apps-script/reference/lock/lock-service

## Publishing

The site is buildless: index.html, styles.css and scanner.js at repository root. GitHub Pages should publish main / (root). No secrets or inventory files are needed. A real device camera test is still required to confirm barcode readability on the user's phone.
