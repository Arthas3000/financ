// Carteira — funciona offline depois do primeiro acesso.
const CACHE = "carteira-v3";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // páginas: tenta a rede (para receber atualizações), cai no cache se estiver offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { if (r.ok && (r.headers.get("content-type") || "").includes("text/html")) { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); } return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  // arquivos do app: cache primeiro
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r;
    }).catch(() => hit)));
  }
});
