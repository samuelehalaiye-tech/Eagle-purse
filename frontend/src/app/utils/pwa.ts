// PWA Registration Utility for EaglePurse

export function registerPWA() {
  // Add manifest link to document head
  if (typeof document !== 'undefined') {
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (!existingManifest) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }

    // Add theme color meta tag
    const existingTheme = document.querySelector('meta[name="theme-color"]');
    if (!existingTheme) {
      const themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      themeColor.content = '#0B6623';
      document.head.appendChild(themeColor);
    }

    // Add apple-mobile-web-app-capable meta tag
    const existingApple = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!existingApple) {
      const appleCapable = document.createElement('meta');
      appleCapable.name = 'apple-mobile-web-app-capable';
      appleCapable.content = 'yes';
      document.head.appendChild(appleCapable);
    }

    // Register Service Worker (if supported)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Service worker registration would go here
        // Note: Service worker file needs to be served from public directory
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('ServiceWorker registered:', registration);
          })
          .catch((error) => {
            console.log('ServiceWorker registration failed:', error);
          });
      });
    }
  }
}

// Call this function when the app initializes
export function initializePWA() {
  if (typeof window !== 'undefined') {
    registerPWA();
  }
}
