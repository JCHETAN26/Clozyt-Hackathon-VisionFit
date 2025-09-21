// Simplified Dataset Processor for VisionFit
// Uses the pre-cleaned merged dataset

import Papa from 'papaparse';

export class SimplifiedDatasetProcessor {
  constructor() {
    this.dataset = [];
    this.isLoaded = false;
  }

  // Load the pre-cleaned merged dataset
  async loadCleanedDataset() {
    try {
      console.log('📂 Loading pre-cleaned merged dataset...');
      
      const response = await fetch('/cleaned_products_2.csv');
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          transform: (value) => value.trim(),
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }
            
            // Process and clean the data
            const processedData = this.processDataset(results.data);
            
            this.dataset = processedData;
            this.isLoaded = true;
            
            console.log(`✅ Loaded ${processedData.length} fashion items from cleaned dataset`);
            console.log('📊 Sample item:', processedData[0]);
            
            resolve(processedData);
          },
          error: (error) => {
            console.error('❌ CSV parsing error:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('❌ Failed to load cleaned dataset:', error);
      throw error;
    }
  }

  // Process and standardize the cleaned dataset
  processDataset(rawData) {
    const processed = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const item = rawData[i];
      
      try {
        // Skip items with missing critical data
        if (!item.name || !item.brand || !item.image_url) {
          continue;
        }
        
        const processedItem = {
          id: item.product_id || `item_${i}`,
          name: this.cleanString(item.name),
          brand: this.cleanString(item.brand),
          category: this.standardizeCategory(item.category),
          price: this.parsePrice(item.price),
          originalPrice: this.parsePrice(item.original_price) || this.parsePrice(item.price),
          discount: this.parseDiscount(item.discount),
          image_url: this.cleanImageUrl(item.image_url),
          imageUrl: this.cleanImageUrl(item.image_url), // Fallback for compatibility
          url: item.url || '',
          colors: this.parseColors(item.available_colors || item.color),
          sizes: this.parseSizes(item.available_sizes),
          availability: item.availability || 'Available',
          occasions: this.parseOccasions(item.occasion),
          
          // Additional ML features
          styleFeatures: this.extractStyleFeatures(item.name, item.category),
          priceRange: this.getPriceRange(this.parsePrice(item.price)),
          colorFamily: this.getColorFamily(item.available_colors || item.color),
          
          // Metadata
          processedAt: Date.now()
        };
        
        // Calculate discount if not provided
        if (!processedItem.discount && processedItem.originalPrice > processedItem.price) {
          processedItem.discount = Math.round(((processedItem.originalPrice - processedItem.price) / processedItem.originalPrice) * 100);
        }
        
        processed.push(processedItem);
        
      } catch (error) {
        console.warn('⚠️ Error processing item:', item.name, error);
        continue;
      }
    }
    
    return processed;
  }

  // Utility functions
  cleanString(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ').substring(0, 200);
  }

  parsePrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : Math.round(price * 100) / 100;
  }

  parseDiscount(discountStr) {
    if (!discountStr) return 0;
    const cleaned = discountStr.toString().replace(/[^0-9]/g, '');
    const discount = parseInt(cleaned);
    return isNaN(discount) ? 0 : Math.min(discount, 90);
  }

  cleanImageUrl(url) {
    if (!url) return '';
    const cleanUrl = url.toString().trim();
    
    // Validate URL format
    try {
      new URL(cleanUrl);
      return cleanUrl;
    } catch {
      // If not a valid URL, return empty string (will use placeholder)
      return '';
    }
  }

  parseColors(colorStr) {
    if (!colorStr) return [];
    
    const colors = colorStr.toString()
      .split(/[,;|]/)
      .map(color => color.trim())
      .filter(color => {
        // Filter out numbers, empty strings, and very short/long strings
        return color.length > 0 && 
               color.length < 25 && 
               !(/^\d+$/.test(color)) && // Not just a number
               color.toLowerCase() !== 'available' && // Not the word 'available'
               !/^\d+\.\d+$/.test(color); // Not a decimal number
      })
      .slice(0, 8); // Limit to 8 colors max
    
    // Remove duplicates while preserving order
    const seen = new Set();
    return colors.filter(color => {
      const normalized = color.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  }

  parseSizes(sizeStr) {
    if (!sizeStr) return [];
    
    const sizes = sizeStr.toString()
      .split(/[,;|]/)
      .map(size => size.trim().toUpperCase())
      .filter(size => size.length > 0 && size.length < 10)
      .slice(0, 10); // Limit to 10 sizes max
    
    return [...new Set(sizes)]; // Remove duplicates
  }

  parseOccasions(occasionStr) {
    if (!occasionStr) return [];
    
    const occasions = occasionStr.toString()
      .split(/[,;|]/)
      .map(occasion => occasion.trim().toLowerCase())
      .filter(occasion => occasion.length > 0 && occasion.length < 20)
      .slice(0, 5); // Limit to 5 occasions max
    
    return [...new Set(occasions)]; // Remove duplicates
  }

  standardizeCategory(rawCategory) {
    if (!rawCategory) return 'fashion';
    
    const category = rawCategory.toString().toLowerCase();
    
    const categoryMap = {
      'tops': ['top', 'shirt', 't-shirt', 'tshirt', 'blouse', 'tank', 'camisole', 'crop', 'sweater', 'hoodie', 'cardigan'],
      'bottoms': ['bottom', 'pant', 'pants', 'jean', 'jeans', 'short', 'shorts', 'skirt', 'legging', 'leggings', 'trouser'],
      'dresses': ['dress', 'gown', 'frock', 'maxi', 'mini', 'midi'],
      'activewear': ['activewear', 'sportswear', 'athletic', 'workout', 'gym', 'fitness', 'yoga', 'running', 'training'],
      'swimwear': ['swim', 'swimwear', 'bikini', 'swimsuit', 'beachwear', 'bathing'],
      'outerwear': ['coat', 'jacket', 'blazer', 'outerwear', 'windbreaker', 'bomber'],
      'lingerie': ['bra', 'underwear', 'lingerie', 'intimate', 'panties', 'briefs'],
      'accessories': ['bag', 'accessory', 'belt', 'hat', 'scarf', 'jewelry', 'watch', 'sunglasses'],
      'shoes': ['shoe', 'shoes', 'sneaker', 'boot', 'sandal', 'heel', 'flat']
    };
    
    for (const [standardCat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(keyword => category.includes(keyword))) {
        return standardCat;
      }
    }
    
    return 'fashion';
  }

  extractStyleFeatures(name, category) {
    if (!name) return [];
    
    const text = name.toLowerCase();
    const features = [];
    
    // Style keywords
    const styleKeywords = {
      'casual': ['casual', 'everyday', 'comfort', 'relaxed'],
      'formal': ['formal', 'elegant', 'dress', 'blazer'],
      'sporty': ['sport', 'athletic', 'gym', 'workout', 'active'],
      'trendy': ['trendy', 'fashion', 'style', 'modern'],
      'vintage': ['vintage', 'retro', 'classic', 'timeless'],
      'minimalist': ['minimal', 'simple', 'basic', 'clean'],
      'bohemian': ['boho', 'bohemian', 'flowy', 'hippie'],
      'edgy': ['edgy', 'rock', 'punk', 'leather', 'studded']
    };
    
    for (const [style, keywords] of Object.entries(styleKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        features.push(style);
      }
    }
    
    return features.slice(0, 3); // Limit to 3 features
  }

  getPriceRange(price) {
    if (price < 25) return 'budget';
    if (price < 75) return 'mid-range';
    if (price < 150) return 'premium';
    return 'luxury';
  }

  getColorFamily(colorStr) {
    if (!colorStr) return 'neutral';
    
    const color = colorStr.toString().toLowerCase();
    
    const colorFamilies = {
      'warm': ['red', 'orange', 'yellow', 'pink', 'coral', 'peach'],
      'cool': ['blue', 'green', 'purple', 'turquoise', 'teal', 'mint'],
      'neutral': ['black', 'white', 'gray', 'brown', 'beige', 'cream', 'tan', 'nude'],
      'bold': ['neon', 'bright', 'electric', 'hot', 'fluorescent']
    };
    
    for (const [family, colors] of Object.entries(colorFamilies)) {
      if (colors.some(c => color.includes(c))) {
        return family;
      }
    }
    
    return 'neutral';
  }

  // Get dataset statistics
  getStatistics() {
    if (!this.isLoaded || this.dataset.length === 0) {
      return null;
    }
    
    const brands = [...new Set(this.dataset.map(item => item.brand))];
    const categories = [...new Set(this.dataset.map(item => item.category))];
    const priceRange = {
      min: Math.min(...this.dataset.map(item => item.price)),
      max: Math.max(...this.dataset.map(item => item.price)),
      avg: Math.round(this.dataset.reduce((sum, item) => sum + item.price, 0) / this.dataset.length * 100) / 100
    };
    
    return {
      totalItems: this.dataset.length,
      brands: brands.length,
      brandList: brands,
      categories: categories.length,
      categoryList: categories,
      priceRange,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get the processed dataset
  getDataset() {
    return this.dataset;
  }

  // Check if dataset is loaded
  isDatasetLoaded() {
    return this.isLoaded;
  }
}

export default SimplifiedDatasetProcessor;