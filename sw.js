// Service Worker para PWA - Sistema de Gestión de Candidatos
const CACHE_NAME = 'gestion-candidatos-v2.0.0';
const urlsToCache = [
  '/',
  '/candidatos',
  '/style.css',
  '/style-candidatos.css',
  '/script.js',
  '/script-candidatos.js',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Cache abierto');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('SW: Error cacheando algunos recursos:', error);
          // No fallar completamente si algunos recursos no se pueden cachear
        });
      })
  );
  // Activar inmediatamente
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediatamente
  return self.clients.claim();
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No cachear requests de API
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('SW: Sirviendo desde cache:', event.request.url);
          return response;
        }

        // Fetch from network
        console.log('SW: Fetching desde red:', event.request.url);
        return fetch(event.request).then((response) => {
          // Solo cachear respuestas exitosas
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar respuesta para cache
          var responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.log('SW: Error en fetch:', error);
          // Retornar página offline si está disponible
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

console.log('SW: Cargado correctamente');
