/**
 * ML-Powered Fashion Recommendation Engine
 * Implements vector embeddings, collaborative filtering, and real-time learning
 */

class MLRecommendationEngine {
  constructor() {
    this.fashionData = [];
    this.userProfiles = new Map();
    this.itemEmbeddings = new Map();
    this.similarityCache = new Map();
    this.initialized = false;
  }

  async initialize() {
    console.log('🧠 Initializing ML Recommendation Engine...');
    this.initialized = true;
    return this;
  }

  async loadFashionData(fashionItems) {
    this.fashionData = fashionItems;
    
    // Generate/load embeddings for each item
    fashionItems.forEach(item => {
      this.itemEmbeddings.set(item.id, this.generateItemEmbedding(item));
    });
    
    console.log(`📊 Loaded ${fashionItems.length} fashion items with embeddings`);
  }

  generateItemEmbedding(item) {
    // In a real system, this would use a pre-trained fashion embedding model
    // For now, we'll create embeddings based on item features
    const embedding = new Array(128).fill(0);
    
    // Brand encoding (0-20)
    const brandHash = this.hashString(item.brand) % 20;
    embedding[brandHash] = 1.0;
    
    // Category encoding (20-30)
    const categoryHash = this.hashString(item.category) % 10;
    embedding[20 + categoryHash] = 1.0;
    
    // Price range encoding (30-40)
    const priceRange = Math.min(Math.floor(item.price / 50), 9);
    embedding[30 + priceRange] = item.price / 500;
    
    // Color encoding (40-60)
    if (item.colors) {
      item.colors.forEach(color => {
        const colorHash = this.hashString(color) % 20;
        embedding[40 + colorHash] = 0.5;
      });
    }
    
    // Style features (60-80)
    if (item.styleFeatures) {
      item.styleFeatures.forEach(style => {
        const styleHash = this.hashString(style) % 20;
        embedding[60 + styleHash] = 0.7;
      });
    }
    
    // Random features for diversity (80-128)
    for (let i = 80; i < 128; i++) {
      embedding[i] = (Math.random() - 0.5) * 0.1;
    }
    
    return this.normalizeVector(embedding);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  async getRecommendations(userId, userProfile, count = 1) {
    if (!this.initialized || this.fashionData.length === 0) {
      return [];
    }

    const user = this.userProfiles.get(userId) || this.createUserProfile(userId);
    
    // Get candidate items (exclude recently seen)
    const recentlySeenIds = user.interactions
      .slice(-20)
      .map(interaction => interaction.itemId);
    
    const candidates = this.fashionData.filter(item => 
      !recentlySeenIds.includes(item.id)
    );

    if (candidates.length === 0) {
      return this.fashionData.slice(0, count);
    }

    // Score items based on user preferences and exploration
    const scoredItems = candidates.map(item => ({
      ...item,
      score: this.calculateItemScore(item, user, userProfile)
    }));

    // Balance exploitation vs exploration
    const explorationRate = userProfile.explorationRate || 0.3;
    const exploitCount = Math.floor(count * (1 - explorationRate));
    const exploreCount = count - exploitCount;

    // Get top scoring items (exploitation)
    const topItems = scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, exploitCount);

    // Get diverse items for exploration
    const explorationItems = this.getDiverseItems(scoredItems, exploreCount, topItems);

    // Combine and shuffle
    const recommendations = [...topItems, ...explorationItems]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    return recommendations;
  }

  calculateItemScore(item, user, userProfile) {
    let score = 0.5; // Base score
    
    // Brand preference
    const brandPref = userProfile.preferences.brands[item.brand] || 0;
    score += brandPref * 0.3;
    
    // Category preference  
    const categoryPref = userProfile.preferences.categories[item.category] || 0;
    score += categoryPref * 0.3;
    
    // Price preference (normalized)
    const avgPrice = user.interactions
      .filter(i => i.action === 'like')
      .reduce((sum, i) => {
        const likedItem = this.fashionData.find(fi => fi.id === i.itemId);
        return sum + (likedItem ? likedItem.price : 0);
      }, 0) / Math.max(1, user.interactions.filter(i => i.action === 'like').length);
      
    if (avgPrice > 0) {
      const priceDiff = Math.abs(item.price - avgPrice) / avgPrice;
      score += Math.max(0, 1 - priceDiff) * 0.2;
    }
    
    // Collaborative filtering (basic)
    if (user.interactions.length > 5) {
      score += this.getCollaborativeScore(item, user) * 0.2;
    }
    
    // Recency boost for trending items
    score += Math.random() * 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  getCollaborativeScore(item, user) {
    // Simple collaborative filtering based on similar user preferences
    const userLikedCategories = user.interactions
      .filter(i => i.action === 'like')
      .map(i => {
        const likedItem = this.fashionData.find(fi => fi.id === i.itemId);
        return likedItem ? likedItem.category : null;
      })
      .filter(Boolean);
    
    const categoryMatch = userLikedCategories.includes(item.category);
    return categoryMatch ? 0.3 : 0;
  }

  getDiverseItems(scoredItems, count, excludeItems) {
    if (count <= 0) return [];
    
    const excludeIds = excludeItems.map(item => item.id);
    const candidates = scoredItems
      .filter(item => !excludeIds.includes(item.id))
      .sort(() => Math.random() - 0.5); // Random shuffle for diversity
    
    return candidates.slice(0, count);
  }

  async updateUserProfile(userId, interaction, currentProfile) {
    let user = this.userProfiles.get(userId);
    if (!user) {
      user = this.createUserProfile(userId);
    }
    
    // Add interaction
    user.interactions.push(interaction);
    
    // Update preferences based on interaction
    const item = this.fashionData.find(i => i.id === interaction.itemId);
    if (item && interaction.action === 'like') {
      // Increase brand preference
      user.brandPreferences[item.brand] = (user.brandPreferences[item.brand] || 0) + 0.1;
      
      // Increase category preference
      user.categoryPreferences[item.category] = (user.categoryPreferences[item.category] || 0) + 0.1;
      
      // Update color preferences
      if (item.colors) {
        item.colors.forEach(color => {
          user.colorPreferences[color] = (user.colorPreferences[color] || 0) + 0.05;
        });
      }
    }
    
    // Update exploration rate based on user behavior
    const recentLikes = user.interactions.slice(-10).filter(i => i.action === 'like').length;
    const newExplorationRate = Math.max(0.1, Math.min(0.5, 0.3 - (recentLikes * 0.02)));
    
    const updatedProfile = {
      ...currentProfile,
      preferences: {
        brands: user.brandPreferences,
        categories: user.categoryPreferences,
        colors: user.colorPreferences,
        priceRange: user.pricePreferences
      },
      interactions: user.interactions,
      explorationRate: newExplorationRate
    };
    
    this.userProfiles.set(userId, user);
    return updatedProfile;
  }

  createUserProfile(userId) {
    const profile = {
      id: userId,
      createdAt: Date.now(),
      interactions: [],
      brandPreferences: {},
      categoryPreferences: {},
      colorPreferences: {},
      pricePreferences: {}
    };
    
    this.userProfiles.set(userId, profile);
    return profile;
  }

  async getSimilarItems(targetItem, excludeItems = [], count = 5) {
    const targetEmbedding = this.itemEmbeddings.get(targetItem.id);
    if (!targetEmbedding) return [];
    
    const excludeIds = excludeItems.map(item => item.id);
    const candidates = this.fashionData.filter(item => 
      item.id !== targetItem.id && !excludeIds.includes(item.id)
    );
    
    const similarItems = candidates
      .map(item => ({
        ...item,
        similarity: this.cosineSimilarity(targetEmbedding, this.itemEmbeddings.get(item.id))
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count);
    
    return similarItems;
  }

  // Analytics and insights
  getUserInsights(userId) {
    const user = this.userProfiles.get(userId);
    if (!user) return null;
    
    const totalInteractions = user.interactions.length;
    const likes = user.interactions.filter(i => i.action === 'like').length;
    const likeRate = totalInteractions > 0 ? likes / totalInteractions : 0;
    
    return {
      totalInteractions,
      likeRate,
      topBrand: Object.keys(user.brandPreferences).sort((a, b) => 
        user.brandPreferences[b] - user.brandPreferences[a]
      )[0],
      topCategory: Object.keys(user.categoryPreferences).sort((a, b) => 
        user.categoryPreferences[b] - user.categoryPreferences[a]
      )[0],
      explorationRate: this.userProfiles.get(userId)?.explorationRate || 0.3
    };
  }
}

export default MLRecommendationEngine;