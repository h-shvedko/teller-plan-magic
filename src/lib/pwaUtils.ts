// PWA utilities for offline functionality and service worker management
import { Recipe } from './types';

// IndexedDB configuration
const DB_NAME = 'TellerPlanMagicDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  RECIPES: 'recipes',
  SHOPPING_LISTS: 'shoppingLists',
  MEAL_PLANS: 'mealPlans',
  CACHED_DATA: 'cachedData'
} as const;

// IndexedDB wrapper for offline storage
export class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create recipes store
        if (!db.objectStoreNames.contains(STORES.RECIPES)) {
          const recipeStore = db.createObjectStore(STORES.RECIPES, { keyPath: 'id' });
          recipeStore.createIndex('name', 'name', { unique: false });
          recipeStore.createIndex('cuisine', 'cuisine', { unique: false });
          recipeStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }

        // Create shopping lists store
        if (!db.objectStoreNames.contains(STORES.SHOPPING_LISTS)) {
          const shoppingStore = db.createObjectStore(STORES.SHOPPING_LISTS, { keyPath: 'id' });
          shoppingStore.createIndex('createdAt', 'createdAt', { unique: false });
          shoppingStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Create meal plans store
        if (!db.objectStoreNames.contains(STORES.MEAL_PLANS)) {
          const mealPlanStore = db.createObjectStore(STORES.MEAL_PLANS, { keyPath: 'id' });
          mealPlanStore.createIndex('createdAt', 'createdAt', { unique: false });
          mealPlanStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // Create cached data store
        if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
          const cachedStore = db.createObjectStore(STORES.CACHED_DATA, { keyPath: 'key' });
          cachedStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAll<T>(storeName: string, indexName?: string, value?: any): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request: IDBRequest;
      if (indexName && value !== undefined) {
        const index = store.index(indexName);
        request = index.getAll(value);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Offline recipe management
export interface OfflineRecipe extends Recipe {
  lastAccessed: Date;
  isFavorite: boolean;
  downloadedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export class OfflineRecipeManager {
  private storage: OfflineStorage;

  constructor(storage: OfflineStorage) {
    this.storage = storage;
  }

  async cacheRecipe(recipe: Recipe): Promise<void> {
    const offlineRecipe: OfflineRecipe = {
      ...recipe,
      lastAccessed: new Date(),
      isFavorite: false,
      downloadedAt: new Date(),
      syncStatus: 'synced'
    };

    await this.storage.put(STORES.RECIPES, offlineRecipe);
  }

  async getRecipe(id: string): Promise<OfflineRecipe | null> {
    const recipe = await this.storage.get<OfflineRecipe>(STORES.RECIPES, id);
    
    if (recipe) {
      // Update last accessed time
      recipe.lastAccessed = new Date();
      await this.storage.put(STORES.RECIPES, recipe);
    }

    return recipe;
  }

  async getAllRecipes(): Promise<OfflineRecipe[]> {
    return this.storage.getAll<OfflineRecipe>(STORES.RECIPES);
  }

  async getFavoriteRecipes(): Promise<OfflineRecipe[]> {
    const recipes = await this.getAllRecipes();
    return recipes.filter(recipe => recipe.isFavorite);
  }

  async toggleFavorite(id: string): Promise<void> {
    const recipe = await this.getRecipe(id);
    if (recipe) {
      recipe.isFavorite = !recipe.isFavorite;
      recipe.syncStatus = 'pending';
      await this.storage.put(STORES.RECIPES, recipe);
    }
  }

  async getRecentlyAccessed(limit = 10): Promise<OfflineRecipe[]> {
    const recipes = await this.getAllRecipes();
    return recipes
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
      .slice(0, limit);
  }

  async searchRecipes(query: string): Promise<OfflineRecipe[]> {
    const recipes = await this.getAllRecipes();
    const lowercaseQuery = query.toLowerCase();
    
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(lowercaseQuery) ||
      recipe.description.toLowerCase().includes(lowercaseQuery) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.storage.delete(STORES.RECIPES, id);
  }

  async syncPendingChanges(): Promise<void> {
    // This would sync with the backend in a real implementation
    const recipes = await this.storage.getAll<OfflineRecipe>(
      STORES.RECIPES, 
      'syncStatus', 
      'pending'
    );

    for (const recipe of recipes) {
      try {
        // Simulate API sync
        recipe.syncStatus = 'synced';
        await this.storage.put(STORES.RECIPES, recipe);
      } catch (error) {
        recipe.syncStatus = 'conflict';
        await this.storage.put(STORES.RECIPES, recipe);
      }
    }
  }
}

// Shopping list offline sync
export interface OfflineShoppingList {
  id: string;
  name: string;
  items: OfflineShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
  isCompleted: boolean;
}

export interface OfflineShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  isCompleted: boolean;
  notes?: string;
}

export class OfflineShoppingManager {
  private storage: OfflineStorage;

  constructor(storage: OfflineStorage) {
    this.storage = storage;
  }

  async saveShoppingList(list: OfflineShoppingList): Promise<void> {
    list.updatedAt = new Date();
    list.syncStatus = 'pending';
    await this.storage.put(STORES.SHOPPING_LISTS, list);
  }

  async getShoppingList(id: string): Promise<OfflineShoppingList | null> {
    return this.storage.get<OfflineShoppingList>(STORES.SHOPPING_LISTS, id);
  }

  async getAllShoppingLists(): Promise<OfflineShoppingList[]> {
    return this.storage.getAll<OfflineShoppingList>(STORES.SHOPPING_LISTS);
  }

  async getActiveShoppingLists(): Promise<OfflineShoppingList[]> {
    const lists = await this.getAllShoppingLists();
    return lists.filter(list => !list.isCompleted);
  }

  async toggleItemCompleted(listId: string, itemId: string): Promise<void> {
    const list = await this.getShoppingList(listId);
    if (list) {
      const item = list.items.find(item => item.id === itemId);
      if (item) {
        item.isCompleted = !item.isCompleted;
        await this.saveShoppingList(list);
      }
    }
  }

  async addItem(listId: string, item: OfflineShoppingItem): Promise<void> {
    const list = await this.getShoppingList(listId);
    if (list) {
      list.items.push(item);
      await this.saveShoppingList(list);
    }
  }

  async removeItem(listId: string, itemId: string): Promise<void> {
    const list = await this.getShoppingList(listId);
    if (list) {
      list.items = list.items.filter(item => item.id !== itemId);
      await this.saveShoppingList(list);
    }
  }

  async updateItem(listId: string, itemId: string, updates: Partial<OfflineShoppingItem>): Promise<void> {
    const list = await this.getShoppingList(listId);
    if (list) {
      const itemIndex = list.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        list.items[itemIndex] = { ...list.items[itemIndex], ...updates };
        await this.saveShoppingList(list);
      }
    }
  }

  async deleteShoppingList(id: string): Promise<void> {
    await this.storage.delete(STORES.SHOPPING_LISTS, id);
  }

  async syncPendingChanges(): Promise<void> {
    const lists = await this.storage.getAll<OfflineShoppingList>(
      STORES.SHOPPING_LISTS,
      'syncStatus',
      'pending'
    );

    for (const list of lists) {
      try {
        // Simulate API sync
        list.syncStatus = 'synced';
        await this.storage.put(STORES.SHOPPING_LISTS, list);
      } catch (error) {
        list.syncStatus = 'conflict';
        await this.storage.put(STORES.SHOPPING_LISTS, list);
      }
    }
  }
}

// Network status management
export class NetworkManager {
  private isOnline = navigator.onLine;
  private callbacks: Array<(online: boolean) => void> = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks();
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks();
      this.handleOffline();
    });
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.isOnline));
  }

  private async handleOnline(): Promise<void> {
    // Sync pending changes when coming back online
    try {
      const storage = new OfflineStorage();
      await storage.init();
      
      const recipeManager = new OfflineRecipeManager(storage);
      const shoppingManager = new OfflineShoppingManager(storage);

      await Promise.all([
        recipeManager.syncPendingChanges(),
        shoppingManager.syncPendingChanges()
      ]);

      // Show success notification
      if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Sync Complete', {
            body: 'Your data has been synchronized with the server.',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png'
          });
        });
      }
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }

  private handleOffline(): void {
    // Show offline notification
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('You are offline', {
          body: 'Don\'t worry! You can still access your cached recipes and shopping lists.',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png'
        });
      });
    }
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  onStatusChange(callback: (online: boolean) => void): () => void {
    this.callbacks.push(callback);
    
    // Return cleanup function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}

// Service worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              if (confirm('New content is available! Click OK to refresh.')) {
                window.location.reload();
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  return null;
}

// PWA installation
export function setupPWAInstallPrompt(): void {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to the install prompt: ${outcome}`);
          deferredPrompt = null;
          installButton.style.display = 'none';
        }
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    
    // Hide install button
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  });
}

// Cache management utilities
export async function clearCache(): Promise<void> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }
}

export async function getCacheSize(): Promise<number> {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
}

export async function getCacheInfo(): Promise<{size: number, quota: number}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      size: estimate.usage || 0,
      quota: estimate.quota || 0
    };
  }
  return { size: 0, quota: 0 };
}

// Export singleton instances
export const offlineStorage = new OfflineStorage();
export const networkManager = new NetworkManager();