// Service Worker for Teller Plan Magic PWA
const CACHE_NAME = 'teller-plan-magic-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline access
const CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/recipes\//,
  /\/api\/meal-plans\//,
  /\/api\/shopping-lists\//
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(handleOtherRequests(request));
});

// Check if request is for API
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Handle API requests with network-first, cache-fallback strategy
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    // Fall back to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical API failures
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'This content is not available offline',
        cached: false
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Network failed for navigation, showing offline page');
    
    // Fall back to offline page
    const cache = await caches.open(CACHE_NAME);
    const offlineResponse = await cache.match(OFFLINE_URL);
    return offlineResponse || new Response('Offline');
  }
}

// Handle other requests with cache-first strategy
async function handleOtherRequests(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fall back to network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response for future use
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Request failed:', request.url, error);
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Handle background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-recipes') {
    event.waitUntil(syncRecipes());
  } else if (event.tag === 'sync-shopping-lists') {
    event.waitUntil(syncShoppingLists());
  }
});

// Sync cached recipes with server
async function syncRecipes() {
  try {
    // This would sync with your actual API
    console.log('Syncing recipes...');
    
    // Post a message to the main thread to handle sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_RECIPES',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Recipe sync failed:', error);
  }
}

// Sync cached shopping lists with server
async function syncShoppingLists() {
  try {
    console.log('Syncing shopping lists...');
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_SHOPPING_LISTS',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Shopping list sync failed:', error);
  }
}

// Handle push notifications for cooking timers
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Teller Plan Magic',
    body: 'Timer finished!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    actions: [
      {
        action: 'dismiss',
        title: 'Dismiss'
      },
      {
        action: 'view',
        title: 'View Recipe'
      }
    ],
    requireInteraction: true,
    tag: 'cooking-timer'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app to the recipe or cooking page
    event.waitUntil(
      clients.openWindow('/recipes')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_RECIPE') {
    event.waitUntil(cacheRecipe(event.data.recipe));
  }
  
  if (event.data && event.data.type === 'SCHEDULE_TIMER') {
    event.waitUntil(scheduleTimer(event.data.timer));
  }
});

// Cache a specific recipe for offline access
async function cacheRecipe(recipe) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const recipeUrl = `/api/recipes/${recipe.id}`;
    
    // Create a mock response for the recipe
    const recipeResponse = new Response(JSON.stringify(recipe), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(recipeUrl, recipeResponse);
    console.log('Recipe cached for offline access:', recipe.name);
  } catch (error) {
    console.error('Failed to cache recipe:', error);
  }
}

// Schedule a cooking timer (would integrate with system notifications)
async function scheduleTimer(timer) {
  try {
    console.log('Timer scheduled:', timer);
    
    // In a real implementation, this would schedule a notification
    // after the specified duration
    setTimeout(() => {
      self.registration.showNotification('Cooking Timer', {
        body: `${timer.name} timer finished!`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        requireInteraction: true,
        tag: `timer-${timer.id}`
      });
    }, timer.duration);
    
  } catch (error) {
    console.error('Failed to schedule timer:', error);
  }
}