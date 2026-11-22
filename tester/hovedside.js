// Tester for v0.4: kryssfade mellom pads, grå C-tangenter, grepfelt langs toppen
const { chromium } = require('playwright');
const URL = process.argv[2] || 'http://localhost:8123/index.html';
const SHOTS = __dirname + '/shots';
require('fs').mkdirSync(SHOTS, { recursive: true });

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'FEIL ') + msg); if (!cond) fails++; };

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 880, height: 506 }, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.click('#start');
  await page.waitForFunction(() => window.__piano && window.__piano.A.ctx && window.__piano.A.ctx.state === 'running', null, { timeout: 15000 });
  await page.waitForTimeout(1500);

  ok((await page.evaluate(() => window.__piano.VERSION)).startsWith('0.4'), 'versjon 0.4');

  // ---------- Grå C-tangenter (G4..F6 som på bildet) ----------
  await page.evaluate(() => {
    const P = window.__piano; P.S.lo = 67; P.S.hi = 77; window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(300);
  const keyInfo = await page.evaluate(() => window.__piano.keys().filter((k) => k.white).map((k) => ({
    midi: k.midi, c: k.el.classList.contains('c'), bg: getComputedStyle(k.el).backgroundImage.slice(0, 60),
  })));
  const cs = keyInfo.filter((k) => k.c).map((k) => k.midi);
  ok(JSON.stringify(cs) === JSON.stringify([72]), 'bare C5 (72) er markert i G4–F5: ' + JSON.stringify(cs));
  ok(keyInfo.find((k) => k.midi === 72).bg !== keyInfo.find((k) => k.midi === 71).bg, 'C har annen farge enn H');
  await page.screenshot({ path: SHOTS + '/v4-g-til-f.png' });

  // Nedtrykt C blir blå (ikke grå)
  const cKey = await page.evaluate(() => { const k = window.__piano.keys().find((k) => k.midi === 72); const r = k.el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 20 }; });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cKey.x, y: cKey.y, id: 1 }] });
  await page.waitForTimeout(80);
  const downBg = await page.evaluate(() => { const k = window.__piano.keys().find((k) => k.midi === 72); return { down: k.el.classList.contains('down'), bg: getComputedStyle(k.el).backgroundImage }; });
  ok(downBg.down && /188, 214, 242/.test(downBg.bg), 'nedtrykt C vises blå');
  const voices = await page.evaluate(() => window.__piano.A.voices.filter((v) => v.held).map((v) => v.note));
  ok(voices.length === 1, 'trykk på C gir én tone: ' + JSON.stringify(voices));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: cKey.x, y: cKey.y, id: 1 }] });
  await page.waitForTimeout(80);

  // ---------- Grepfelt langs toppen ----------
  const geo = await page.evaluate(() => {
    const r = (sel) => document.querySelector(sel).getBoundingClientRect();
    const hits = [];
    for (let x = 2; x < innerWidth; x += 20) for (const y of [2, 10, 20, 29]) {
      const el = document.elementFromPoint(x, y);
      hits.push(el ? (el.id || el.className || el.tagName) : 'null');
    }
    return { pads: r('#pads').top, strip: r('#btnSustain').top, kb: r('#kb').top, hits: [...new Set(hits)] };
  });
  ok(geo.pads >= 30, 'pads starter under grepfeltet: ' + geo.pads);
  ok(geo.strip >= 48, 'Sustain starter under vindusknappene: ' + geo.strip);
  ok(geo.hits.every((h) => ['app', 'strip', 'main', 'grab'].includes(h)), 'øverste 30 px treffer ingen knapp/pad/tangent: ' + geo.hits.join(','));
  // Trykk i grepfeltet skal ikke gi lyd eller starte pad
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 440, y: 12, id: 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 500, y: 14, id: 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: 500, y: 14, id: 2 }] });
  await page.waitForTimeout(80);
  const after = await page.evaluate(() => ({ held: window.__piano.A.voices.filter((v) => v.held).length, pad: window.__piano.pad().activePad }));
  ok(after.held === 0 && after.pad === null, 'dra i grepfeltet gir verken tone eller pad');

  // Uten pads: tangentene starter også under grepfeltet
  await page.evaluate(() => { window.__piano.S.pads = false; document.body.classList.add('nopads'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(300);
  ok((await page.evaluate(() => document.querySelector('#kb').getBoundingClientRect().top)) >= 30, 'uten pads: tangentene starter under grepfeltet');
  await page.screenshot({ path: SHOTS + '/v4-uten-pads.png' });
  await page.evaluate(() => { window.__piano.S.pads = true; document.body.classList.remove('nopads'); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS + '/v4-med-pads.png' });

  // Lite vindu (ca. 1/3 høyde)
  await page.setViewportSize({ width: 790, height: 280 });
  await page.waitForTimeout(300);
  const small = await page.evaluate(() => {
    const r = (sel) => document.querySelector(sel).getBoundingClientRect();
    return { pads: r('#pads').height, kb: r('#kb').height, sus: r('#btnSustain').height, susTop: r('#btnSustain').top };
  });
  ok(small.pads >= 44 && small.kb >= 120 && small.sus >= 50, 'lite vindu 790×280: pads ' + small.pads.toFixed(0) + ', tangenter ' + small.kb.toFixed(0) + ', Sustain ' + small.sus.toFixed(0) + ' (topp ' + small.susTop.toFixed(0) + ')');
  await page.screenshot({ path: SHOTS + '/v4-lite.png' });
  await page.setViewportSize({ width: 880, height: 506 });
  await page.waitForTimeout(300);

  // ---------- Pad-lyd: nivå over tid ----------
  await page.evaluate(() => {
    const P = window.__piano, A = P.A;
    const an = A.ctx.createAnalyser(); an.fftSize = 1024;
    A.padVol.connect(an);
    window.__an = an;
    window.__level = () => { const d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); };
    window.__trace = (ms, step) => new Promise((res) => {
      const out = []; const t0 = performance.now();
      const id = setInterval(() => { out.push([Math.round(performance.now() - t0), window.__level()]); if (performance.now() - t0 > ms) { clearInterval(id); res(out); } }, step);
    });
  });
  const level = () => page.evaluate(() => window.__level());

  // Fra stillhet: myk start
  await page.evaluate(() => window.__piano.togglePad(0));
  const startTrace = await page.evaluate(() => window.__trace(900, 25));
  const steady0 = await level();
  ok(steady0 > 0.02, 'Bb spiller: nivå ' + steady0.toFixed(4));
  const at100 = startTrace.find((p) => p[0] >= 100)[1];
  ok(at100 < steady0 * 0.25, 'start fra stillhet er fortsatt myk (100 ms: ' + (at100 / steady0 * 100).toFixed(0) + ' %)');

  // Bytte Bb -> C: ingen hull (opptak sample for sample, 150 ms RMS-vindu)
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const A = window.__piano.A, ctx = A.ctx;
    const sp = ctx.createScriptProcessor(2048, 2, 1);
    window.__rec = [];
    sp.onaudioprocess = (e) => { const L = e.inputBuffer.getChannelData(0), R = e.inputBuffer.getChannelData(1); const m = new Float32Array(L.length); for (let i = 0; i < L.length; i++) m[i] = (L[i] + R[i]) / 2; window.__rec.push({ t: e.playbackTime, d: m }); };
    A.padVol.connect(sp); const z = ctx.createGain(); z.gain.value = 0; sp.connect(z); z.connect(ctx.destination);
    window.__sp = sp;
  });
  await page.waitForTimeout(400);
  const tSw = await page.evaluate(() => { window.__piano.togglePad(1); return window.__piano.pad().activeChord.t0; });
  await page.waitForTimeout(1300);
  const xf = await page.evaluate((t0) => {
    window.__piano.A.padVol.disconnect(window.__sp);
    const sr = window.__piano.A.ctx.sampleRate, W = 0.15, win = Math.round(sr * W);
    const all = []; const start = window.__rec[0].t;
    for (const b of window.__rec) for (const x of b.d) all.push(x);
    const out = [];
    for (let t = 0; t < all.length / sr - W; t += 0.025) {
      const i0 = Math.round(t * sr); let q = 0; for (let i = i0; i < i0 + win; i++) q += all[i] * all[i];
      out.push([Math.round((start + t + W / 2 - t0) * 1000), Math.sqrt(q / win)]);
    }
    return out;
  }, tSw);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const pre = avg(xf.filter((p) => p[0] < -50).map((p) => p[1]));
  const post = avg(xf.filter((p) => p[0] > 700).map((p) => p[1]));
  const ref = Math.min(pre, post);
  const seg = xf.filter((p) => p[0] >= -50 && p[0] <= 900);
  const minRel = Math.min(...seg.map((p) => p[1])) / ref;
  console.log('     kryssfade (ms: %): ' + seg.filter((p, i) => i % 2 === 0).slice(0, 18).map((p) => p[0] + ':' + (p[1] / ref * 100).toFixed(0)).join(' '));
  ok(minRel > 0.85, 'bytte Bb→C uten hull: laveste nivå ' + (minRel * 100).toFixed(0) + ' % (v0.3: ca. 56 %)');
  const steady1 = post;
  const at400 = seg.find((p) => p[0] >= 400)[1];
  ok(at400 > steady1 * 0.85, 'ny akkord er fullt inne etter 0,4 s (' + (at400 / steady1 * 100).toFixed(0) + ' %)');

  // Raske bytter fram og tilbake: ingen feil, én aktiv
  for (const i of [2, 0, 1, 2]) { await page.evaluate((i) => window.__piano.togglePad(i), i); await page.waitForTimeout(60); }
  ok((await page.evaluate(() => window.__piano.pad().activePad)) === 2, 'raske bytter: Dm er aktiv');
  await page.waitForTimeout(1500);

  // Frekvenser med transponering +4 (Dm -> F#m)
  const freqs = await page.evaluate(() => {
    const P = window.__piano; P.S.tOn = true; P.S.tAmt = 4;
    P.togglePad(2); P.togglePad(2); // stopp og start på nytt med ny transponering
    return P.pad().activeChord.oscs.slice(1).map((o) => o.frequency.value);
  });
  const uniq = [...new Set(freqs.map((f) => f.toFixed(1)))];
  ok(JSON.stringify(uniq) === JSON.stringify(['185.0', '220.0', '277.2', '370.0', '92.5']), 'Dm +4 gir F#m: ' + uniq.join(','));

  // Stopp: fade ca. 1 s
  await page.waitForTimeout(900);
  const s0 = await level();
  await page.evaluate(() => window.__piano.togglePad(2));
  const st = await page.evaluate(() => window.__trace(1600, 25));
  const r300 = st.find((p) => p[0] >= 300)[1] / s0, r1500 = st.find((p) => p[0] >= 1500)[1] / s0;
  ok(r300 > 0.2 && r300 < 0.6 && r1500 < 0.03, 'stopp-fade som før: 300 ms ' + (r300 * 100).toFixed(0) + ' %, 1,5 s ' + (r1500 * 100).toFixed(1) + ' %');

  ok(errors.length === 0, 'ingen feil i konsollen' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(fails ? `\n${fails} FEIL` : '\nAlle tester bestått');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
