// Lukusali: pieni välimuisti, jotta sivu aukeaa myös ilman verkkoa.
// Kun muutat sivua, nosta versionumeroa, niin selain hakee uuden version.
const VERSIO = 'lukusali-v8';
const TIEDOSTOT = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'some.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSIO).then((c) => c.addAll(TIEDOSTOT)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((avaimet) => Promise.all(avaimet.filter((a) => a !== VERSIO).map((a) => caches.delete(a)))).then(() => self.clients.claim())
  );
});

// Verkko ensin, välimuisti varalla. Näin päivitykset näkyvät heti, kun verkko toimii.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((vastaus) => {
      const kopio = vastaus.clone();
      caches.open(VERSIO).then((c) => c.put(e.request, kopio));
      return vastaus;
    }).catch(() => caches.match(e.request))
  );
});
