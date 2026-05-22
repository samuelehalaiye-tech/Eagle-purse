# PWA Setup for EaglePurse

This app is configured as a Progressive Web App (PWA) for installation on mobile devices.

## Files

- `manifest.json` - App manifest with metadata, icons, and shortcuts
- `sw.js` - Service worker for offline caching (needs to be created as .js file)

## Service Worker

Create a file `public/sw.js` with the following content:

```javascript
const CACHE_NAME = 'eaglepurse-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/log-expense',
  '/coach',
  '/meal-plan',
  '/simulator',
  '/settings',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

## Icons

The manifest references two icon files:
- `public/icon-192.png` - 192x192px app icon
- `public/icon-512.png` - 512x512px app icon

Create these icons with the EaglePurse eagle logo on a forest green background (#0B6623).

## Testing

1. Serve the app over HTTPS (required for PWA)
2. Open Chrome DevTools > Application > Manifest to verify
3. On mobile, the browser will prompt to "Add to Home Screen"
4. Test offline functionality after installation
