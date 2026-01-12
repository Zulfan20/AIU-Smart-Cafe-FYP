// Custom Service Worker for AIU Smart Cafe
// Cache menu data and pages for offline access

const CACHE_NAME = 'aiu-cafe-v1'
const OFFLINE_CACHE = 'aiu-cafe-offline-v1'

// Pages and assets to cache immediately
const PRECACHE_URLS = [
  '/',
  '/student-dashboard',
  '/login',
  '/register',
  '/offline.html'
]

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache menu API responses
  if (url.pathname.includes('/api/menu') || url.pathname.includes('/api/recommendations')) {
    event.respondWith(
      caches.open(OFFLINE_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => {
            // Return cached version when offline
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              // Return empty array for failed API calls
              return new Response(JSON.stringify([]), {
                headers: { 'Content-Type': 'application/json' }
              })
            })
          })
      })
    )
    return
  }

  // Cache images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone())
            return response
          })
        })
      })
    )
    return
  }

  // For navigation requests, try network first, then cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            return caches.match('/offline.html')
          })
        })
    )
    return
  }

  // Default: cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).catch(() => {
        // Return offline page for failed requests
        if (request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
    })
  )
})
