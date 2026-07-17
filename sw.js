const CACHE_NAME = 'fluxo-venda-v2';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png?v=5', './icon-512.png?v=5', './icon-maskable-192.png?v=5', './icon-maskable-512.png?v=5'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Nunca cachear chamadas à nuvem (Supabase): sempre buscar da rede.
  if (url.includes('supabase.co')) {
    return;
  }
  // Rede primeiro: sempre busca a versão mais nova quando há internet, e só usa
  // o cache (para funcionar offline) se a busca na rede falhar. Isso evita que
  // alterações fiquem "presas" no cache antigo do navegador/celular.
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).then((resp) => {
      const copia = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
      return resp;
    }).catch(() => caches.match(event.request))
  );
});
