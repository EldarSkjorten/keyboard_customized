// visuell 0.2: Angre-feil, fast skala, Frys, linjer, navnemeny, lagring, deler i innstillinger
const { chromium } = require('playwright');
require('fs').mkdirSync(__dirname + '/shots', { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FEIL ') + m); if (!c) fails++; };
const URL = process.argv[2] || 'http://localhost:8123/visuell/';
const PFX = process.argv[3] || 'visuell';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL);
  await p.evaluate((k) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify({ lo: 67, hi: 77, dGap: 1.5 })); }, 'piano.settings.' + PFX + '.v1');
  await p.reload();
  await p.click('#start');
  await p.waitForFunction(() => window.__piano && window.__piano.A.ctx && window.__piano.A.ctx.state === 'running');
  await p.waitForTimeout(800);
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
  const btn = async (sel) => { const c = await center(sel); await tap(c.x, c.y); };
  const keyAt = (m) => p.evaluate((m) => { const k = window.__piano.keys().find((k) => k.midi === m); const r = k.el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 25 }; }, m);
  const play = async (ms, hold = 120) => { for (const m of ms) { const k = await keyAt(m); await tap(k.x, k.y, hold); } };
  const rows = () => p.evaluate(() => window.__piano.Vis.rows().map((r) => r.notes.map((n) => n.midi).join(',') + (r.label ? ' [' + r.label.p + r.label.k + ']' : '')));
  const geo = () => p.evaluate(() => { window.__piano.Vis.draw(); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(window.__piano.Vis.geo())))); });

  // 1) Angre-feilen: angre linje 3, spill igjen -> ny linje 3, ikke videre på linje 2
  await play([67, 69, 71]); await p.waitForTimeout(1700);
  await play([67, 69, 71]); await p.waitForTimeout(1700);
  await play([72, 71, 69]);
  ok((await rows()).length === 3, 'tre fraser gir tre linjer');
  await btn('#dUndo');
  ok((await rows()).length === 2, 'Angre fjerner linje 3');
  await play([74, 72]);
  let R = await rows();
  ok(R.length === 3 && R[1] === '67,69,71' && R[2] === '74,72', 'etter Angre havner neste tone på ny linje: ' + JSON.stringify(R));

  // 2) Fast skala: litt lengre linje gir ikke sammenpressing når det er plass
  const g1 = await geo();
  await p.waitForTimeout(1700);
  await play([67, 69, 71, 72, 74, 72, 71], 150);
  const g2 = await geo();
  ok(Math.abs(g1.pps - g2.pps) < 0.01, 'samme avstand (px/s) når neste linje er litt lengre: ' + g1.pps.toFixed(1) + ' -> ' + g2.pps.toFixed(1));
  // svært lang linje -> krymper (i faste trinn)
  await p.evaluate(() => { const r = window.__piano.Vis.rows(); r[r.length - 1].notes.push({ midi: 72, t: 30000, held: false }); });
  const g3 = await geo();
  ok(g3.pps < g2.pps, 'krymper bare når linjen ikke får plass: ' + g3.pps.toFixed(1));
  await btn('#dUndo'); // fjern den lange
  ok((await geo()).pps === g1.pps, 'tilbake til full avstand etter Angre');

  // 3) Frys
  await btn('#dFreeze');
  ok(await p.evaluate(() => window.__piano.S.dFrozen && document.getElementById('dFreeze').classList.contains('on')), 'Frys er på');
  const before = JSON.stringify(await rows());
  await play([67, 71, 74]);
  ok(JSON.stringify(await rows()) === before, 'frosset: spilling endrer ikke feltet');
  ok(await p.evaluate(() => window.__piano.A.voices.length) > 0, 'frosset: tonene klinger');
  await btn('#dFreeze');
  await play([77, 76]);
  R = await rows();
  ok(R[R.length - 1] === '77,76', 'etter Frys av: neste tone på ny linje: ' + R[R.length - 1]);

  // 4) Linjer
  await btn('#dGridKeys');
  ok(await p.evaluate(() => window.__piano.S.dGrid === 'keys' && document.getElementById('dGridKeys').classList.contains('on')), 'Rutenett på');
  await p.screenshot({ path: __dirname + '/shots/v5-rutenett.png' });
  await btn('#dGridStaff');
  ok(await p.evaluate(() => window.__piano.S.dGrid === 'staff' && !document.getElementById('dGridKeys').classList.contains('on')), 'Notelinjer på (Rutenett av)');
  await btn('#dGridStaff');
  ok(await p.evaluate(() => window.__piano.S.dGrid === 'off'), 'Notelinjer av igjen');
  await btn('#dGridStaff');

  // 5) Navnemeny
  const st = await p.evaluate(() => { const r = document.getElementById('dStage').getBoundingClientRect(); return { x: r.x, y: r.y }; });
  const rowH = (await geo()).rowH;
  await tap(st.x + 20, st.y + rowH * 0 + rowH / 2);
  ok(await p.evaluate(() => !document.getElementById('dMenu').hidden), 'trykk i venstre felt åpner menyen');
  await p.screenshot({ path: __dirname + '/shots/v5-meny.png' });
  await p.click('#dMenu .mbtn[data-p="p1"][data-k="o"]');
  await tap(st.x + 20, st.y + rowH * 1 + rowH / 2);
  await p.click('#dMenu .mbtn[data-p="p1"][data-k="r"]');
  await tap(st.x + 20, st.y + rowH * 2 + rowH / 2);
  await p.click('#dMenu .mbtn[data-p="p1"][data-k="v"]');
  await tap(st.x + 20, st.y + rowH * 3 + rowH / 2);
  await p.click('#dMenu .mbtn[data-p="p2"][data-k="o"]');
  R = await rows();
  ok(R[0].endsWith('[p1o]') && R[1].endsWith('[p1r]') && R[2].endsWith('[p1v]') && R[3].endsWith('[p2o]'), 'navn satt: ' + JSON.stringify(R));
  ok(await p.evaluate(() => document.getElementById('dMenu').hidden), 'menyen lukkes etter valg');
  // trykk utenfor lukker
  await tap(st.x + 20, st.y + rowH / 2);
  const kc = await keyAt(72); await tap(kc.x, kc.y);
  ok(await p.evaluate(() => document.getElementById('dMenu').hidden), 'trykk utenfor lukker menyen');
  await p.screenshot({ path: __dirname + '/shots/v5-farger-notelinjer.png' });
  // Angre beholder navn
  await btn('#dUndo');
  R = await rows();
  ok(R[0].endsWith('[p1o]') && R[1].endsWith('[p1r]'), 'Angre beholder navnene på linjene som står: ' + JSON.stringify(R));

  // 6) Lagring ved ny lasting
  await p.waitForTimeout(600);
  const saved = JSON.stringify(await rows());
  await p.reload();
  await p.click('#start');
  await p.waitForFunction(() => window.__piano && window.__piano.A.ctx && window.__piano.A.ctx.state === 'running');
  await p.waitForTimeout(500);
  ok(JSON.stringify(await rows()) === saved, 'linjer og navn står igjen etter ny lasting');
  await play([67]);
  R = await rows();
  ok(R[R.length - 1] === '67', 'etter ny lasting: første tone på ny linje');

  // 7) Deler i innstillinger
  await p.click('#btnSettings', { force: true }).catch(() => {});
  if (await p.evaluate(() => document.getElementById('settings').hidden)) await btn('#btnSettings');
  await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('#partsList .part').length === 3), 'tre deler som standard');
  await p.click('#btnAddPart');
  await p.fill('#partsList .part[data-i="3"] input', 'Spørsmål');
  await p.click('#partsList .part[data-i="3"] [data-act="up"]');
  await p.click('#partsList .part[data-i="0"] [data-act="color"]');
  const parts = await p.evaluate(() => window.__piano.S.dParts.map((x) => x.name + ':' + x.color).join(' | '));
  ok(parts === 'Motiv:yellow | Kontrast:orange | Spørsmål:green | Slutt:purple', 'legg til, gi navn, flytt, bytt farge: ' + parts);
  await p.screenshot({ path: __dirname + '/shots/v5-innstillinger.png' });
  await p.evaluate(() => document.getElementById('partsList').scrollIntoView());
  await p.screenshot({ path: __dirname + '/shots/v5-innstillinger-deler.png' });
  await p.click('#partsList .part[data-i="1"] [data-act="del"]');
  ok(await p.evaluate(() => window.__piano.S.dParts.length === 3), 'fjern del');
  const stored = await p.evaluate((k) => JSON.parse(localStorage.getItem(k)).dParts.map((x) => x.name).join(','), 'piano.settings.' + PFX + '.v1');
  ok(stored === 'Motiv,Spørsmål,Slutt', 'delene lagres: ' + stored);
  await p.click('#btnClose');
  await p.waitForTimeout(300);

  // 8) 8 linjer
  await p.evaluate(() => { const P = window.__piano; P.S.dRows = 8; P.Vis.draw(); });
  await p.waitForTimeout(200);
  await p.screenshot({ path: __dirname + '/shots/v5-etter.png' });
  ok(errs.length === 0, 'ingen feil i konsollen ' + (errs.length ? JSON.stringify(errs) : ''));
  console.log(fails ? fails + ' FEIL' : 'ALT OK');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
