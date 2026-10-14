'use strict';
const el = id => document.getElementById(id);
let scanner = null;
let running = false;
let busy = false;
let lastText = '';
let lastTime = 0;
function buttons() {
  el('start').disabled = running || busy;
  el('stop').disabled = !running || busy;
  el('camera').disabled = running || busy;
}
function detected(text, decoded) {
  const now = Date.now();
  if (text === lastText && now - lastTime < 2000) return;
  lastText = text; lastTime = now;
  el('result').value = text;
  const format = decoded?.result?.format?.formatName || 'Barcode';
  el('details').textContent = `${format} detected at ${new Date(now).toLocaleTimeString()}. Stock OUT not saved.`;
  el('status').textContent = 'Barcode detected. Camera remains on for the next scan.';
  el('copy').disabled = false; el('clear').disabled = false;
}
async function start() {
  if (busy || running) return;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    el('status').textContent = 'Camera unavailable. Open the HTTPS page directly in a supported browser.'; return;
  }
  if (typeof Html5Qrcode === 'undefined') {
    el('status').textContent = 'Barcode decoder could not load. Check your internet connection and reload this page.'; return;
  }
  busy = true; buttons(); el('status').textContent = 'Starting camera. Allow camera access when asked…';
  try {
    if (!scanner) {
      const f = Html5QrcodeSupportedFormats;
      scanner = new Html5Qrcode('reader', {formatsToSupport:[f.EAN_13,f.EAN_8,f.UPC_A,f.UPC_E,f.CODE_128,f.CODE_39,f.ITF],verbose:false});
    }
    const source = el('camera').value || {facingMode:'environment'};
    await scanner.start(source, {fps:10}, detected, () => {});
    running = true;
    el('status').textContent = 'Camera ready. Point at a barcode. No inventory changes will be made.';
    try {
      const cameras = await Html5Qrcode.getCameras();
      const selected = el('camera').value;
      el('camera').replaceChildren(new Option('Rear camera (automatic)', ''));
      cameras.forEach((c,i) => el('camera').add(new Option(c.label || `Camera ${i+1}`, c.id)));
      el('camera').value = selected;
    } catch { /* Camera scanning can continue without enumerating devices. */ }
  } catch (error) {
    const msg = String(error?.name || error);
    el('status').textContent = /NotAllowed|Permission|denied/i.test(msg)
      ? 'Camera permission denied. Allow camera access in site settings, then tap Start camera.'
      : /NotFound|DevicesNotFound/i.test(msg)
      ? 'No camera found. Try this page on a phone or connect a camera.'
      : 'Could not start camera. Close other camera apps, check site permissions, or choose another camera and retry.';
  } finally {
    busy = false; buttons();
    if (document.hidden && running) await stop();
  }
}
async function stop() {
  if (!running || busy) return;
  busy = true; buttons();
  try { await scanner.stop(); running = false; el('status').textContent = 'Camera stopped. Displayed barcode has not been saved to inventory.'; }
  catch { el('status').textContent = 'Could not stop camera. Close this tab to release it.'; }
  finally { busy = false; buttons(); }
}
el('start').addEventListener('click', start);
el('stop').addEventListener('click', stop);
el('clear').addEventListener('click', () => {
  el('result').value = ''; lastText = ''; lastTime = 0;
  el('details').textContent = 'Result cleared. No stock transaction was saved.';
  el('copy').disabled = true; el('clear').disabled = true;
});
el('copy').addEventListener('click', async () => {
  const value = el('result').value;
  try { await navigator.clipboard.writeText(value); el('details').textContent = 'Barcode copied. Stock OUT not saved.'; }
  catch { el('result').select(); el('details').textContent = 'Select and copy the barcode manually. Stock OUT not saved.'; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) void stop(); });
window.addEventListener('pagehide', () => { if (running) void stop(); });
