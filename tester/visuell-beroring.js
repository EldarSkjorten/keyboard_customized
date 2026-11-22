// Berøringstest av knappene i «Spill», og at pianoet ellers er urørt
const { chromium } = require('playwright');
require('fs').mkdirSync(__dirname + '/shots', { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FEIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 700 }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8123/visuell/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('piano.settings.visuell.v1', JSON.stringify({ lo: 67, hi: 77 })); });
  await p.reload();
  await p.click('#start');
  await p.waitForFunction(() => window.__piano && window.__piano.A.ctx && window.__piano.A.ctx.state === 'running');
  await p.waitForTimeout(1000);
  const cdp = await ctx.newCDPSession(p);
  let tid = 10;
  const tap = async (x, y, hold = 60) => {
    const id = tid++;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id }] });
    await p.waitForTimeout(hold);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await p.waitForTimeout(60);
  };
  const center = (sel) => p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  const keyAt = (m) => p.evaluate((m) => { const k = window.__piano.keys().find((k) => k.midi === m); const r = k.el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 25 }; }, m);
  const rows = () => p.evaluate(() => window.__piano.Vis.rows().map((r) => r.notes.map((n) => n.midi).join(',') + (r.label ? ' [' + r.label + ']' : '')));
  for (const m of [67, 69, 71]) { const k = await keyAt(m); await tap(k.x, k.y, 150); }
  ok(JSON.stringify(await rows()) === JSON.stringify(['67,69,71']), 'tre trykk på tangentene gir tre noter: ' + JSON.stringify(await rows()));
  const lat = await p.evaluate(() => window.__piano.A.voices.length);
  ok(lat >= 3, 'tonene ble spilt (' + lat + ' stemmer)');
  let c = await center('#dNewRow'); await tap(c.x, c.y);
  for (const m of [72, 71]) { const k = await keyAt(m); await tap(k.x, k.y, 150); }
  ok((await rows()).length === 2, '«Ny linje» gir ny linje: ' + JSON.stringify(await rows()));
  // trykk i venstre felt på linje 1 -> meny -> «Repetisjon» av Motiv
  const g = await p.evaluate(() => { const r = document.getElementById('dStage').getBoundingClientRect(); return { x: r.x + 20, y: r.y + 15 }; });
  await tap(g.x, g.y);
  const mb = await center('#dMenu .mbtn[data-p="p1"][data-k="r"]'); await p.mouse.click(mb.x, mb.y);
  ok(await p.evaluate(() => JSON.stringify(window.__piano.Vis.rows()[0].label) === '{"p":"p1","k":"r"}'), 'navn på linje 1 via menyen');
  c = await center('#dUndo'); await tap(c.x, c.y);
  ok((await rows()).length === 1, '«Angre» fjerner siste linje');
  c = await center('#dClear'); await tap(c.x, c.y);
  ok((await rows()).length === 0, '«Tøm» tømmer');
  c = await center('#dUndo'); await tap(c.x, c.y);
  ok((await rows()).length === 1, '«Angre» etter «Tøm» henter linjene tilbake');
  // bytt til «Bilder» og tilbake med berøring
  c = await center('.seg .dbtn[data-mode="img"]'); await tap(c.x, c.y);
  ok(await p.evaluate(() => document.body.classList.contains('mode-img')), 'bytte til «Bilder»');
  c = await center('.seg .dbtn[data-mode="live"]'); await tap(c.x, c.y);
  ok(await p.evaluate(() => document.body.classList.contains('mode-live')), 'bytte til «Spill»');
  // pads virker som før
  c = await center('.pad[data-pad="1"]'); await tap(c.x, c.y);
  ok(await p.evaluate(() => window.__piano.pad().activePad === 1), 'pad C starter');
  await tap(c.x, c.y);
  // grepfeltet øverst er fortsatt tomt
  const top = await p.evaluate(() => [...new Set([100, 400, 700, 950].map((x) => { const e = document.elementFromPoint(x, 15); return e.id || e.tagName; }))]);
  ok(top.every((h) => h === 'app'), 'grepfeltet øverst er tomt: ' + top);
  // visningsfeltet av -> som vanlig piano
  await p.evaluate(() => { const P = window.__piano; P.S.disp = false; P.Vis.apply(); });
  await p.waitForTimeout(300);
  const off = await p.evaluate(() => ({ disp: getComputedStyle(document.getElementById('display')).display, pads: document.getElementById('pads').getBoundingClientRect().height }));
  ok(off.disp === 'none' && off.pads > 100, 'visningsfelt av: skjult, pads har vanlig høyde (' + Math.round(off.pads) + ')');
  ok(errs.length === 0, 'ingen feil i konsollen' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(fails ? fails + ' FEIL' : 'Alle tester bestått');
  process.exit(fails ? 1 : 0);
})();
