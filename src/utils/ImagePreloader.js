// Image preloader utility for smooth image loading in the swipe interface

export class ImagePreloader {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }

  async preloadImage(url) {
    if (!url) return null;
    
    // Return from cache if already loaded
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // Return existing promise if already loading
    if (this.loading.has(url)) {
      return this.loading.get(url);
    }

    // Create new loading promise
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(url, img);
        this.loading.delete(url);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loading.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // Set crossOrigin for external images
      img.crossOrigin = 'anonymous';
      img.src = url;
    });

    this.loading.set(url, loadPromise);
    return loadPromise;
  }

  async preloadBatch(urls, batchSize = 3) {
    if (!Array.isArray(urls) || urls.length === 0) return [];

    const results = [];
    
    // Process in batches to avoid overwhelming the browser
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map(url => 
        this.preloadImage(url).catch(error => {
          console.warn('Image preload failed:', url, error);
          return null;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to prevent blocking
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return results;
  }

  isLoaded(url) {
    return this.cache.has(url);
  }

  getFromCache(url) {
    return this.cache.get(url);
  }

  clearCache() {
    this.cache.clear();
    this.loading.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }
}

// Singleton instance
export const imagePreloader = new ImagePreloader();