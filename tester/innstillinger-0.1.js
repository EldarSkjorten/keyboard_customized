const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await (await b.newContext({ viewport: { width: 880, height: 506 } })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('http://localhost:8123/index.html');
  // innstillinger slik 0.1 lagret dem
  await p.evaluate(() => localStorage.setItem('piano.settings.v1', JSON.stringify({ lo: 55, hi: 77, tAmt: 4, tOn: true, vol: 80, rev: 20 })));
  await p.reload();
  await p.click('#start');
  await p.waitForFunction(() => window.__piano && window.__piano.A.ctx && window.__piano.A.ctx.state === 'running');
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const S = window.__piano.S; return { v: window.__piano.VERSION, lo: S.lo, hi: S.hi, tOn: S.tOn, vol: S.vol, pads: S.pads, pVol: S.pVol, sLen: S.sLen, padsVisible: getComputedStyle(document.getElementById('pads')).display, lamp: document.getElementById('lamp').className }; });
  console.log(JSON.stringify(r), 'feil:', errs.length ? errs.join(' | ') : 'ingen');
  await b.close();
})();
