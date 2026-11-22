const { chromium } = require('playwright');
const SH = __dirname + '/shots/', IM = __dirname + '/testbilder/';
require('fs').mkdirSync(__dirname + '/shots', { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  // lag tre lysbilder (bredformat) med notehoder
  const mk = await b.newPage({ viewport: { width: 1920, height: 800 } });
  const slides = [
    ['Motiv', [[0, 4], [1, 4], [2, 5], [3, 4], [4, 7], [5.5, 6]]],
    ['Motiv + repetisjon', [[0, 4], [1, 4], [2, 5], [3, 4], [4, 7], [5.5, 6]]],
    ['Variasjon', [[0, 4], [1, 4], [2, 5], [3, 4], [4, 8], [5.5, 7]]],
  ];
  for (let i = 0; i < slides.length; i++) {
    const [title, notes] = slides[i];
    const heads = notes.map(([x, y]) => `<div style="position:absolute;left:${260 + x * 190}px;top:${620 - y * 52}px;width:78px;height:56px;border-radius:50%;background:#1d2026;transform:rotate(-19deg)"></div>`).join('');
    await mk.setContent(`<body style="margin:0;width:1920px;height:800px;background:#fff;font-family:Helvetica,Arial;position:relative"><div style="position:absolute;left:80px;top:50px;font-size:84px;font-weight:700;color:#4b3f8f">${title}</div>${heads}</body>`);
    await mk.screenshot({ path: IM + `Lysbilde.${String(i + 1).padStart(3, '0')}.png` });
  }
  await mk.close();
  const ctx = await b.newContext({ viewport: { width: 1194, height: 834 }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8123/visuell/');
  await p.evaluate(() => localStorage.setItem('piano.settings.visuell.v1', JSON.stringify({ lo: 67, hi: 77, dMode: 'img' })));
  await p.reload();
  await p.click('#start');
  await p.waitForFunction(() => window.__piano && window.__piano.A.ctx);
  await p.screenshot({ path: SH + 'vis-bilder-tom.png' });
  // velg bildene i omvendt rekkefølge: skal sorteres etter navn
  await p.setInputFiles('#fileImgs', [IM + 'Lysbilde.003.png', IM + 'Lysbilde.001.png', IM + 'Lysbilde.002.png']);
  await p.waitForFunction(() => window.__piano.Vis.images().length === 3, null, { timeout: 5000 });
  const names = await p.evaluate(() => window.__piano.Vis.images().map((x) => x.name));
  console.log('rekkefølge:', names.join(', '));
  const count = () => p.evaluate(() => document.getElementById('dCount').textContent);
  console.log('teller:', await count());
  // sveip til venstre med touch (CDP)
  const cdp = await ctx.newCDPSession(p);
  const swipe = async (x1, x2, y) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y, id: 5 }] });
    for (let k = 1; k <= 5; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * k / 5, y, id: 5 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await p.waitForTimeout(150);
  };
  await swipe(800, 500, 250);
  console.log('etter sveip venstre:', await count());
  await swipe(800, 500, 250);
  await swipe(800, 500, 250);
  console.log('etter 2 sveip til (siste):', await count());
  await swipe(500, 800, 250);
  console.log('etter sveip høyre:', await count());
  await p.screenshot({ path: SH + 'vis-bilder.png' });
  // tangent spilt i bildemodus skal ikke tegnes
  await p.evaluate(() => { const P = window.__piano; P.press('z', P.keys()[0]); P.release('z'); });
  console.log('linjer i bildemodus:', await p.evaluate(() => window.__piano.Vis.rows().length));
  // ny innlasting: bildene og posisjonen er husket
  await p.reload();
  await p.waitForFunction(() => window.__piano && window.__piano.Vis.images().length === 3, null, { timeout: 5000 });
  console.log('etter ny innlasting:', await count());
  console.log('feil:', errs.length ? errs.join(' | ') : 'ingen');
  await b.close();
})();
