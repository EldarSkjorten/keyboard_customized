// Service worker: lagrer pianoet og lydene på iPad-en, så det virker selv om nettet faller ut.
const VERSION = '0.1.0';
const CORE_CACHE = 'piano-core-' + VERSION;
const SAMPLE_CACHE = 'piano-samples-v1'; // lydfilene endres ikke; bytt navn hvis de gjør det

const CORE_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];
const SAMPLE_NAMES = [];
for (let m = 21; m <= 108; m += 3) {
  const name = { 0: 'C', 3: 'Ds', 6: 'Fs', 9: 'A' }[m % 12] + (Math.floor(m / 12) - 1);
  SAMPLE_NAMES.push('./samples/' + name + '.mp3');
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const core = await caches.open(CORE_CACHE);
    await Promise.all(CORE_FILES.map((u) => core.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    const samples = await caches.open(SAMPLE_CACHE);
    await Promise.all(SAMPLE_NAMES.map(async (u) => {
      try {
        if (await samples.match(u)) return;
        const r = await fetch(u);
        if (r.ok) await samples.put(u, r);
      } catch (e) { /* prøves igjen ved bruk */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([CORE_CACHE, SAMPLE_CACHE]);
    for (const name of await caches.keys()) {
      if (name.startsWith('piano-') && !keep.has(name)) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Lydfiler: fra lageret først (raskt og uten nett)
  if (url.pathname.includes('/samples/')) {
    event.respondWith((async () => {
      const cache = await caches.open(SAMPLE_CACHE);
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok) cache.put(req, r.clone()).catch(() => {});
      return r;
    })());
    return;
  }

  // Selve siden: nyeste versjon fra nettet, men lageret hvis nettet er tregt eller borte
  event.respondWith((async () => {
    const cache = await caches.open(CORE_CACHE);
    const cached = (await cache.match(req, { ignoreSearch: true })) ||
      (req.mode === 'navigate' ? ((await cache.match('./index.html')) || (await cache.match('./'))) : undefined);
    const network = fetch(req, { cache: 'no-cache' }).then((r) => {
      if (r.ok) cache.put(req, r.clone()).catch(() => {});
      return r;
    });
    if (!cached) return network;
    try {
      return await withTimeout(network, 4000);
    } catch (e) {
      network.catch(() => {});
      return cached;
    }
  })());
});
