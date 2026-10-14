# Scanner with owner-only test Stock OUT review

Open https://asifshahnawazkhi-rao.github.io/shop-barcode-scanner/ directly on your phone. Start the camera and scan a barcode, then choose Review Stock OUT in test copy. Sign in to the Google app as the inventory owner, preview the item, set quantity, and explicitly confirm the save.

Camera detection never saves stock. GitHub Pages only passes the detected barcode to a restricted Apps Script page. It contains no PIN, password or token. The barcode is included in the navigation URL; do not use barcode values to carry secrets.

The new Google deployment is owner-only and writes only to the approved test spreadsheet. Existing deployed app and original inventory functions were retained. The test server validates the owner identity, barcode, quantity, price and available stock, uses a shared document lock, and records request IDs in Scanner Test Requests. A completed same-ID retry returns the recorded response without another stock write. PENDING requests stop and require reconciliation instead of another stock deduction. Google Sheets does not provide a general multi-write transaction, so partial failures still require inspection of the audit entry and recorded Stock OUT row.

Only a verified structured server response produces Stock OUT saved — TEST COPY ONLY. Detection, preview, saving and unknown outcome have separate messages. On an unknown outcome, reuse the same request ID and inspect the ledger. Do not refresh and submit the same sale as a new transaction.

Live test: one authorized test transaction was verified in Stock OUT and the SAVED request ledger; stock decreased by one unit. Unit checks covered authorization, invalid quantity, unknown barcode, insufficient stock, lock contention, formula preservation, same-ID retry, mismatched requests, pending requests and price changes. Duplicate prevention checks used simulated Sheets; concurrent and network-failure testing against live Google Sheets remains outstanding. The scan-to-review flow still needs a phone camera test.

Before production: complete live concurrency and timeout/reconciliation tests, review staff access and backup/retention requirements, and explicitly select the production spreadsheet. Do not change the test spreadsheet target casually. Keep secrets server-side; restricted access and server-side identity checks are required. Never use a secret URL, CORS or a browser PIN check as authentication.

Official references:
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/html/communication
- https://developers.google.com/apps-script/reference/lock/lock-service

