// Arena GM Service Worker
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `arena-gm-${CACHE_VERSION}`

const PRECACHE_URLS = [
  '/',
  '/session',
  '/players',
  '/events',
  '/loot',
  '/rules',
  '/manifest.json'
]

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('arena-gm-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET and external requests
  if (request.method !== 'GET') return
  if (!request.url.startsWith(self.location.origin)) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Serve from cache on network failure
        return caches.match(request).then((cached) => {
          if (cached) return cached

          // Fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/') || new Response('Offline', { status: 503 })
          }

          return new Response('Offline', { status: 503 })
        })
      })
  )
})
