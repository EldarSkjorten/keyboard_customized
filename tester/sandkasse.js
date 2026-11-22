// sandkasse 0.1: Under/Etter, Del for del, Melodier, lysende toner når frosset
const { chromium } = require('playwright');
require('fs').mkdirSync(__dirname + '/shots', { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FEIL ') + m); if (!c) fails++; };
const ROWS = { v: 1, rows: [
  { l: { p: 'p1', k: 'o' }, n: [[67, 0], [69, 480], [71, 1000], [67, 1500], [72, 2000]] },
  { l: { p: 'p1', k: 'r' }, n: [[67, 0], [69, 510], [71, 990], [67, 1520], [72, 2010]] },
  { l: { p: 'p1', k: 'v' }, n: [[67, 0], [69, 500], [71, 1000], [74, 1500], [72, 1750], [71, 2000]] },
  { l: { p: 'p2', k: 'o' }, n: [[76, 0], [74, 260], [72, 500], [71, 1000], [69, 1500], [70, 2000]] },
] };
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  let dialogAnswer = null;
  p.on('dialog', async (d) => { if (d.type() === 'prompt') await d.accept(dialogAnswer); else await d.accept(); });
  await p.goto('http://localhost:8123/sandkasse/');
  await p.evaluate((r) => { localStorage.clear(); localStorage.setItem('piano.settings.sandkasse.v1', JSON.stringify({ lo: 67, hi: 77 })); localStorage.setItem('piano.sandkasse.rows.v1', JSON.stringify(r)); }, ROWS);
  await p.reload();
  await p.click('#start');
  await p.waitForFunction(() => window.__piano && window.__piano.A.ctx && window.__piano.A.ctx.state === 'running');
  await p.waitForTimeout(600);
  const cdp = await ctx.newCDPSession(p);
  let tid = 10;
  const tap = async (x, y, hold = 60) => { const id = tid++; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id }] }); await p.waitForTimeout(hold); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(80); };
  const swipe = async (x1, y, x2) => { const id = tid++; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y, id }] }); for (let k = 1; k <= 5; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * k / 5, y, id }] }); await p.waitForTimeout(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(80); };
  const center = (sel) => p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  const btn = async (sel) => { const c = await center(sel); await tap(c.x, c.y); };
  const keyAt = (m) => p.evaluate((m) => { const k = window.__piano.keys().find((k) => k.midi === m); const r = k.el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 25 }; }, m);
  const V = (f) => p.evaluate(f);
  const st = await V(() => { const r = document.getElementById('dStage').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const settle = () => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  ok((await V(() => window.__piano.Vis.rows().length)) === 4, 'fire lagrede linjer lastet');
  // Frys -> Del for del
  await btn('#dFreeze');
  ok(await V(() => document.body.classList.contains('frozen') && getComputedStyle(document.getElementById('dReveal')).display !== 'none' && document.getElementById('dNewRow').offsetParent === null), 'frosset: «Del for del» vises, «Ny linje/Angre/Tøm» skjules');
  await btn('#dReveal');
  ok((await V(() => window.__piano.Vis.reveal().k)) === 0, 'Del for del: alt skjult (0)');
  await tap(st.x + st.w / 2, st.y + st.h / 2);
  ok((await V(() => window.__piano.Vis.reveal().k)) === 1, 'trykk i feltet: 1 del');
  await swipe(st.x + st.w * 0.7, st.y + st.h / 2, st.x + st.w * 0.3);
  ok((await V(() => window.__piano.Vis.reveal().k)) === 2, 'sveip venstre: 2 deler');
  await p.keyboard.press('PageDown');
  ok((await V(() => window.__piano.Vis.reveal().k)) === 3, 'PageDown (klikker): 3 deler');
  await p.keyboard.press('ArrowLeft');
  ok((await V(() => window.__piano.Vis.reveal().k)) === 2, 'pil venstre: 2 deler');
  await btn('#dRNext');
  ok((await V(() => document.getElementById('dRCount').textContent)) === '3 / 4', 'teller: ' + await V(() => document.getElementById('dRCount').textContent));
  await settle();
  await p.screenshot({ path: __dirname + '/shots/v6-delfordel.png' });
  // toner lyser når frosset
  const k = await keyAt(67);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: k.x, y: k.y, id: 99 }] });
  await settle();
  await p.screenshot({ path: __dirname + '/shots/v6-lyser.png' });
  ok((await V(() => window.__piano.Vis.rows().length)) === 4, 'frosset: tonen skrives ikke');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  // Etter hverandre
  await btn('.seg .dbtn[data-layout="seq"]');
  await settle();
  const g = await V(() => window.__piano.Vis.geo());
  ok(g.seq && g.place.length === 4 && Math.max(...g.place.map((q) => q.line)) < 4, 'Etter hverandre: 4 deler på ' + (Math.max(...g.place.map((q) => q.line)) + 1) + ' linje(r)');
  await p.screenshot({ path: __dirname + '/shots/v6-etter-3av4.png' });
  await btn('#dRNext');
  await btn('#dGridStaff');
  await settle();
  await p.screenshot({ path: __dirname + '/shots/v6-etter-noter.png' });
  // Del for del av -> trykk på en del åpner navnemenyen
  await btn('#dReveal');
  const g2 = await V(() => window.__piano.Vis.geo());
  const q = g2.place[1];
  await tap(st.x + q.bx + q.bw / 2, st.y + q.line * g2.rowH + g2.rowH / 2);
  ok(await V(() => !document.getElementById('dMenu').hidden), 'Etter: trykk på en del åpner navnemenyen');
  await p.click('#dMenuNone');
  ok((await V(() => window.__piano.Vis.rows()[1].label)) === null, 'navnet fjernet fra del 2');
  // Melodier: lagre, tøm, hent
  await btn('#dMelBtn');
  ok(await V(() => !document.getElementById('dMel').hidden), 'Melodier-menyen åpnes');
  dialogAnswer = 'Øvemelodi';
  await p.click('#dMelSave');
  ok((await V(() => window.__piano.Vis.loadMelodies().map((m) => m.name).join())) === 'Øvemelodi', 'melodi lagret');
  await btn('#dMelBtn');
  ok(await V(() => document.getElementById('dMel').hidden), 'Melodier-knappen lukker menyen igjen');
  await btn('#dFreeze');
  await btn('#dClear');
  ok((await V(() => window.__piano.Vis.rows().length)) === 0, 'tømt');
  await btn('#dMelBtn');
  await p.click('#dMel .mel .load');
  ok((await V(() => window.__piano.Vis.rows().length)) === 4 && await V(() => window.__piano.S.dFrozen), 'melodi hentet (4 linjer, frosset)');
  ok((await V(() => JSON.stringify(window.__piano.Vis.rows()[2].label))) === '{"p":"p1","k":"v"}', 'navnene følger med');
  // en del som er slettet, kommer tilbake når melodien hentes
  await V(() => { const P = window.__piano; P.S.dParts = P.S.dParts.filter((x) => x.id !== 'p2'); });
  await btn('#dMelBtn');
  await p.click('#dMel .mel .load');
  ok(await V(() => window.__piano.S.dParts.some((x) => x.id === 'p2' && x.name === 'Kontrast')), 'slettet del legges til igjen fra melodien');
  await btn('#dMelBtn');
  await p.click('#dMel .mel .del');
  ok((await V(() => window.__piano.Vis.loadMelodies().length)) === 0, 'melodi slettet');
  await btn('#dMelBtn');
  // Under igjen, frys av, spill -> ny linje
  await btn('.seg .dbtn[data-layout="stack"]');
  await btn('#dFreeze');
  const k2 = await keyAt(72); await tap(k2.x, k2.y, 120);
  const R = await V(() => window.__piano.Vis.rows().map((r) => r.notes.length));
  ok(R[R.length - 1] === 1, 'frys av + spill: ny linje (' + JSON.stringify(R) + ')');
  await settle();
  await p.screenshot({ path: __dirname + '/shots/v6-slutt.png' });
  ok(errs.length === 0, 'ingen feil i konsollen ' + (errs.length ? JSON.stringify(errs) : ''));
  console.log(fails ? fails + ' FEIL' : 'ALT OK');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
