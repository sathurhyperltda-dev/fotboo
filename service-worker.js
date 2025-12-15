const CACHE_NAME = 'world-pro-v17';
const urlsToCache = [
    './',
    'index.html',
    'style.css',
    'manager.css',
    'jogador.css',
    'game.js',
    'manager.js',
    'jogador.js',
    'database.js',
    'database_Jo.js',
    'manifest.json',
    // Adicione mais URLs de assets (imagens, logos, etc.) aqui
    'icons/icon-192x192.png' 
];

// Instalação: Cacheia todos os recursos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch: Tenta buscar na rede, se falhar, retorna do cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se o recurso está no cache, usa-o
                if (response) {
                    return response;
                }
                // Se não, busca na rede
                return fetch(event.request);
            })
    );
});