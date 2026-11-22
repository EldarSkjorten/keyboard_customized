// visuell 0.3: standardlyd, knapper over pads (til venstre-modus), størrelse på feltet, «Ikke angre likevel»,
// tonelengde, bilder som legges til (ikke erstatter), bilder samlet i linjer, fjerne ett bilde
// Kjør: node tester/med-server.js tester/visuell-0.3.js
const { chromium } = require('playwright');
const SH = __dirname + '/shots/', IM = __dirname + '/testbilder/';
require('fs').mkdirSync(SH, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FEIL ') + m); if (!c) fails++; };
const KEY = 'piano.settings.visuell.v1';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 698 }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('dialog', (d) => d.accept());
  await p.goto('http://localhost:8123/visuell/');
  // gammel lagring (fra 0.2) med andre lydverdier
  await p.evaluate((k) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify({ lo: 60, hi: 77, vol: 60, rev: 20, sLen: 7, pVol: 50, pRev: 30, dSide: true, dGap: 1.5 })); }, KEY);
  await p.reload();
  await p.click('#start');
  await p.waitForFunction(() => window.__piano && window.__piano.A.ctx && window.__piano.A.ctx.state === 'running');
  await p.waitForTimeout(700);
  const S = () => p.evaluate(() => window.__piano.S);
  let s = await S();
  ok(s.vol === 75 && s.rev === 0 && s.sLen === 5 && s.pVol === 70 && s.pRev === 50, 'nye standardverdier for lyd tatt i bruk: ' + [s.vol, s.rev, s.sLen, s.pVol, s.pRev].join(', '));
  await p.evaluate(() => { const P = window.__piano; P.S.sLen = 8; localStorage.setItem('piano.settings.visuell.v1', JSON.stringify(P.S)); });
  await p.reload(); await p.click('#start');
  await p.waitForFunction(() => window.__piano && window.__piano.A.ctx && window.__piano.A.ctx.state === 'running');
  await p.waitForTimeout(500);
  ok((await S()).sLen === 8, 'egne lydvalg etterpå blir stående (bare én gang)');

  const cdp = await ctx.newCDPSession(p);
  let tid = 10;
  const tap = async (x, y, hold = 60) => {
    const id = tid++;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id }] });
    await p.waitForTimeout(hold);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await p.waitForTimeout(60);
  };
  const rect = (sel) => p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; }, sel);
  const btn = async (sel, hold) => { const r = await rect(sel); await tap(r.x + r.w / 2, r.y + r.h / 2, hold); };
  const keyAt = (m) => p.evaluate((m) => { const k = window.__piano.keys().find((k) => k.midi === m); const r = k.el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height - 20 }; }, m);
  const play = async (ms, hold = 150) => { for (const m of ms) { const k = await keyAt(m); await tap(k.x, k.y, hold); } };
  const rows = () => p.evaluate(() => window.__piano.Vis.rows().map((r) => r.notes.map((n) => n.midi).join(',')));
  const settings = async (fn) => {
    await btn('#btnSettings'); await p.waitForTimeout(150);
    await fn();
    await p.click('#btnClose'); await p.waitForTimeout(250);
  };
  const setRange = (sel, v) => p.evaluate(([sel, v]) => { const e = document.querySelector(sel); e.value = String(v); e.dispatchEvent(new Event('input')); }, [sel, v]);

  // 1) Til venstre: knappene over pads, feltet tar halve bredden
  ok(await p.evaluate(() => document.getElementById('strip').parentNode.id === 'main'), 'til venstre: knappene ligger i høyre kolonne');
  let st = await rect('#strip'), pd = await rect('#pads'), dp = await rect('#display'), kb = await rect('#kb');
  ok(st.x >= dp.r && Math.abs(st.b + 5 - pd.y) < 2, 'knappene står rett over pads, til høyre for feltet');
  ok(dp.x < 12, 'feltet starter helt til venstre (x = ' + dp.x.toFixed(0) + ')');
  ok(Math.abs(dp.w / (dp.w + kb.w) - 0.5) < 0.02, 'feltet tar 50 % av bredden: ' + (dp.w / (dp.w + kb.w) * 100).toFixed(1));
  await play([60, 62, 64, 62, 60]); await p.waitForTimeout(1700);
  await play([60, 62, 64, 62, 60]); await p.waitForTimeout(1700);
  await play([60, 62, 64, 62, 67, 65, 64]); await p.waitForTimeout(1700);
  await play([70, 70, 69, 67]);
  await p.screenshot({ path: SH + 'v3-venstre.png' });
  await btn('#dGridKeys');
  await p.screenshot({ path: SH + 'v3-venstre-rutenett.png' });
  await settings(() => setRange('#rngDSize', 40));
  dp = await rect('#display'); kb = await rect('#kb');
  ok(Math.abs(dp.w / (dp.w + kb.w) - 0.4) < 0.02, 'størrelse 40 %: ' + (dp.w / (dp.w + kb.w) * 100).toFixed(1));
  await p.screenshot({ path: SH + 'v3-venstre-40.png' });

  // 2) Over: knappene til venstre som før, høyden deles
  await settings(async () => { await p.selectOption('#selSide', 'top'); });
  ok(await p.evaluate(() => document.getElementById('strip').parentNode.id === 'app'), 'over: knappene til venstre som før');
  dp = await rect('#display');
  const mainH = await p.evaluate(() => document.getElementById('main').clientHeight - 10);
  ok(Math.abs(dp.h / mainH - 0.5) < 0.04, 'over: feltet tar ca. 50 % av høyden: ' + (dp.h / mainH * 100).toFixed(1));
  await p.screenshot({ path: SH + 'v3-over-rutenett.png' });
  const kb1 = (await rect('#kb')).h;
  await settings(() => setRange('#rngDSize', 35));
  const kb2 = (await rect('#kb')).h;
  ok(kb2 > kb1 + 20, 'over: mindre felt gir høyere tangenter: ' + kb1.toFixed(0) + ' -> ' + kb2.toFixed(0));
  await p.screenshot({ path: SH + 'v3-over-35.png' });
  s = await S();
  ok(s.dSzTop === 35 && s.dSzSide === 40, 'størrelsen huskes for hver plassering');
  await btn('#dGridKeys');

  // 3) Angre / «Ikke angre likevel»
  const n0 = (await rows()).length;
  await btn('#dUndo');
  ok((await rows()).length === n0 - 1, 'kort trykk på Angre angrer');
  await btn('#dUndo', 800);
  ok(await p.evaluate(() => !document.getElementById('dRedo').hidden), 'hold inne Angre: «Ikke angre likevel» vises');
  ok((await rows()).length === n0 - 1, 'hold inne angrer ikke en gang til');
  await p.screenshot({ path: SH + 'v3-ikke-angre.png' });
  await p.click('#dRedoBtn');
  ok((await rows()).length === n0 && await p.evaluate(() => document.getElementById('dRedo').hidden), '«Ikke angre likevel» henter linjen tilbake og lukkes');
  await btn('#dUndo'); await btn('#dUndo');
  await btn('#dUndo', 800); await p.click('#dRedoBtn');
  ok((await rows()).length === n0 - 1 && await p.evaluate(() => !document.getElementById('dRedo').hidden), 'flere steg: menyen blir stående så lenge det er mer å gjøre om');
  await p.click('#dRedoBtn');
  ok((await rows()).length === n0, 'to steg gjort om');
  await btn('#dUndo'); await play([72]);
  await btn('#dUndo', 800);
  ok(await p.evaluate(() => document.getElementById('dRedoBtn').disabled), 'ny tone etter Angre: ingenting å gjøre om');
  await tap(5, 300);

  // 4) Tonelengde lagres (til senere avspilling)
  await p.waitForTimeout(600);
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('piano.visuell.rows.v1')).rows);
  const last = saved[saved.length - 1].n[0];
  ok(last.length === 3 && last[2] > 100 && last[2] < 400, 'tonelengde lagret: ' + JSON.stringify(last));

  // 5) Bilder: legges til, sorteres, samles i linjer
  await settings(async () => { await p.selectOption('#selSide', 'side'); });
  await btn('.seg .dbtn[data-mode="img"]');
  await p.setInputFiles('#fileImgs', [IM + 'Lysbilde.002.png', IM + 'Lysbilde.001.png']);
  await p.waitForFunction(() => window.__piano.Vis.images().length === 2, null, { timeout: 5000 });
  await p.setInputFiles('#fileImgs', [IM + 'Lysbilde.003.png']);
  await p.waitForFunction(() => window.__piano.Vis.images().length === 3, null, { timeout: 5000 }).catch(() => {});
  const names = await p.evaluate(() => window.__piano.Vis.images().map((x) => x.name).join(', '));
  ok(names === 'Lysbilde.001.png, Lysbilde.002.png, Lysbilde.003.png', 'nytt bilde legges til (erstatter ikke): ' + names);
  const shown = () => p.evaluate(() => [...document.querySelectorAll('#dSlots img')].filter((e) => !e.hidden).length);
  const count = () => p.evaluate(() => document.getElementById('dCount').textContent);
  ok(await shown() === 0 && await count() === '0 / 3' && await p.evaluate(() => !document.getElementById('dEmpty').hidden), 'starter tomt: ' + await count());
  dp = await rect('#dStage');
  await tap(dp.x + dp.w / 2, dp.y + dp.h / 2);
  await tap(dp.x + dp.w / 2, dp.y + dp.h / 2);
  ok(await shown() === 2 && await count() === '2 / 3', 'trykk i feltet viser ett og ett, og de blir stående: ' + await count());
  ok(await p.evaluate(() => document.querySelectorAll('#dSlots .slot').length) === 4, 'fire plasser (som fire linjer i «Spill»)');
  await p.screenshot({ path: SH + 'v3-bilder-venstre.png' });
  await btn('#dPrev');
  ok(await shown() === 1, '‹ skjuler siste bilde');
  await settings(async () => {
    const t = await p.evaluate(() => document.getElementById('imgRatio').textContent);
    ok(/ca\. \d+,\d : 1/.test(t), 'innstillinger viser formen som passer: ' + t);
    ok(await p.evaluate(() => document.querySelectorAll('#imgList .imgitem').length) === 3, 'bildeliste med tre bilder');
    await p.evaluate(() => document.getElementById('imgList').scrollIntoView());
    await p.screenshot({ path: SH + 'v3-innstillinger-bilder.png' });
    await p.click('#imgList .imgitem[data-k="1"] [data-act="del"]');
    await p.waitForFunction(() => window.__piano.Vis.images().length === 2, null, { timeout: 5000 }).catch(() => {});
    const n = await p.evaluate(() => window.__piano.Vis.images().map((x) => x.name).join(', '));
    ok(n === 'Lysbilde.001.png, Lysbilde.003.png', 'ett bilde fjernet: ' + n);
    await p.selectOption('#selSide', 'top');
  });
  ok(await p.evaluate(() => getComputedStyle(document.getElementById('dSlots')).gridTemplateColumns.split(' ').length) === 2, 'over: to bilder per linje');
  await tap(dp.x + 300, dp.y + 100);
  await p.screenshot({ path: SH + 'v3-bilder-over.png' });
  await settings(async () => { await p.selectOption('#selImgLay', 'one'); });
  ok(await p.evaluate(() => getComputedStyle(document.getElementById('dImg')).display !== 'none' && !!document.getElementById('dImg').getAttribute('src')), '«Ett og ett» viser ett bilde i hele feltet');
  await p.screenshot({ path: SH + 'v3-bilder-ett.png' });

  ok(errs.length === 0, 'ingen feil i konsollen ' + (errs.length ? JSON.stringify(errs) : ''));
  console.log(fails ? fails + ' FEIL' : 'ALT OK');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
