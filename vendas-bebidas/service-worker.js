self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('pwa-store').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/app.js',
                '/manifest.json',
                '/print/ticket.html',
                '/print/ticket.css'
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
