const CACHE_VERSION = 'v5.1';
const CACHE_NAME = `insomnia-journal-${CACHE_VERSION}`;

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json'
];

// Install event
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Caching files');
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache error (non-critical):', err);
        return cache.addAll(urlsToCache.filter(url => url !== './'));
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Return cached version or offline page
        return caches.match(event.request).then(response => {
          return response || caches.match('./index.html');
        });
      });
    })
  );
});
