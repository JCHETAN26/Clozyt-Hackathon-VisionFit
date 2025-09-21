import React, { useState, useEffect, useRef } from 'react';
import SwipeInterface from './SwipeInterface';
import FavoritesPage from './FavoritesPage';
import DataPreview from './DataPreview';
import OutfitGenerator from './OutfitGenerator';
import VirtualTryOn from './VirtualTryOn';
import AIStyleAssistant from './AIStyleAssistant';
import StyleMatcher from './StyleMatcher';
import SmartOutfitRecommendations from './SmartOutfitRecommendations';
// Professional futuristic UI - completely removed
import MLRecommendationEngine from '../utils/MLRecommendationEngine';
import SimplifiedDatasetProcessor from '../utils/SimplifiedDatasetProcessor';
import { imagePreloader } from '../utils/ImagePreloader';
import './TikTokStyleApp.css';

const TikTokStyleApp = () => {
  const [currentView, setCurrentView] = useState('discover'); // 'discover' or 'favorites'
  const [currentItem, setCurrentItem] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userProfile, setUserProfile] = useState({
    preferences: { brands: {}, categories: {}, colors: {}, priceRange: {} },
    interactions: [],
    explorationRate: 0.3
  });
  const [isLoading, setIsLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [processedDataset, setProcessedDataset] = useState([]);
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  
  // Advanced Features State
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [showOutfitGenerator, setShowOutfitGenerator] = useState(false);
  const [itemHistory, setItemHistory] = useState([]);
  const [showStyleMatcher, setShowStyleMatcher] = useState(false);
  const [styleMatchResults, setStyleMatchResults] = useState([]);
  const [showSmartOutfits, setShowSmartOutfits] = useState(false);
  const [selectedItemForOutfit, setSelectedItemForOutfit] = useState(null);
  // Analytics removed for cleaner interface
  
  const mlEngine = useRef(null);
  const userId = useRef(`user_${Date.now()}`);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing VisionFit with cleaned dataset...');
      
      // Initialize simplified dataset processor
      const dataProcessor = new SimplifiedDatasetProcessor();
      console.log('� Loading pre-cleaned merged dataset...');
      
      // Load the cleaned dataset
      const masterDataset = await dataProcessor.loadCleanedDataset();
      setProcessedDataset(masterDataset);
      
      // Get statistics
      const statistics = dataProcessor.getStatistics();
      console.log('📈 Dataset Statistics:', statistics);
      
      // Initialize ML recommendation engine
      mlEngine.current = new MLRecommendationEngine();
      await mlEngine.current.initialize();
      
      // Load real fashion data
      await mlEngine.current.loadFashionData(masterDataset);
      
      // Get initial recommendations
      const initialRecs = await mlEngine.current.getRecommendations(userId.current, userProfile);
      setRecommendations(initialRecs);
      setCurrentItem(initialRecs[0]);
      
      // Preload next few images for smooth swiping
      if (initialRecs.length > 0) {
        const imagesToPreload = initialRecs
          .slice(0, 5)
          .map(item => item.image_url || item.imageUrl)
          .filter(Boolean);
        
        imagePreloader.preloadBatch(imagesToPreload).then(() => {
          console.log('🖼️ Preloaded initial images for smooth swiping');
        });
      }
      
      setIsLoading(false);
      console.log('✅ VisionFit initialized with cleaned dataset!');
      console.log(`🎯 Loaded ${masterDataset.length} fashion items from ${statistics.brands} brands`);
      console.log('📊 Available brands:', statistics.brandList.join(', '));
      
    } catch (error) {
      console.error('❌ Initialization error:', error);
      setIsLoading(false);
    }
  };

  // Handler for building outfits from a specific item
  const handleBuildOutfit = (item) => {
    setSelectedItemForOutfit(item);
    setShowSmartOutfits(true);
    console.log('💡 Building smart outfits for:', item.name);
  };

  const handleSwipe = async (item, action) => {
    // Prevent multiple swipes in quick succession
    if (isProcessingSwipe) {
      console.log('⏸️ Swipe ignored - already processing');
      return;
    }
    
    setIsProcessingSwipe(true);
    console.log(`👆 Swipe ${action} on:`, item.name);
    
    try {
      // Update swipe count
      setSwipeCount(prev => prev + 1);
      
      // Add to favorites if liked
      if (action === 'like') {
        setFavorites(prev => {
          const exists = prev.find(fav => fav.id === item.id);
          return exists ? prev : [...prev, { ...item, savedAt: Date.now() }];
        });
      }
      
      // Update ML model with user interaction
      const interaction = {
        itemId: item.id,
        action,
        timestamp: Date.now(),
        context: { swipeCount, currentView }
      };
      
      const updatedProfile = await mlEngine.current.updateUserProfile(
        userId.current, 
        interaction, 
        userProfile
      );
      setUserProfile(updatedProfile);
      
      // Get next recommendation
      const nextRecommendations = await mlEngine.current.getRecommendations(
        userId.current, 
        updatedProfile
      );
      
      setRecommendations(nextRecommendations);
      
      // Set new item with a slight delay to ensure smooth transition
      const nextItem = nextRecommendations[0];
      if (nextItem) {
        console.log('🔄 Setting next item:', nextItem.name);
        // Add current item to history before switching
        if (currentItem) {
          setItemHistory(prev => [...prev.slice(-4), currentItem]); // Keep last 5 items
        }
        setCurrentItem(nextItem);
      } else {
        console.warn('⚠️ No next item available');
      }
      
      // Preload next few images for smooth experience
      if (nextRecommendations.length > 1) {
        const imagesToPreload = nextRecommendations
          .slice(1, 4)
          .map(item => item.image_url || item.imageUrl)
          .filter(Boolean);
        
        imagePreloader.preloadBatch(imagesToPreload, 2);
      }
      
    } catch (error) {
      console.error('❌ Error processing swipe:', error);
    } finally {
      // Add a small delay to prevent rapid-fire swipes
      setTimeout(() => {
        setIsProcessingSwipe(false);
      }, 200); // Reduced delay for faster transitions
    }
  };

  const handleTabSwitch = (tab) => {
    setCurrentView(tab);
  };

  const handleFavoriteRemove = (itemId) => {
    setFavorites(prev => prev.filter(fav => fav.id !== itemId));
  };

  const handleAddFavorite = (item) => {
    setFavorites(prev => {
      const exists = prev.find(fav => fav.id === item.id);
      if (exists) return prev; // Don't add duplicates
      
      const newFavorite = {
        ...item,
        savedAt: Date.now()
      };
      
      console.log('💖 Added to favorites:', newFavorite.name);
      return [...prev, newFavorite];
    });
  };

  const getRecommendationsForFavorite = async (favoriteItem) => {
    return await mlEngine.current.getSimilarItems(favoriteItem, favorites);
  };

  const handleGoBack = () => {
    if (currentView === 'favorites') {
      console.log('⬅️ Going back to discover page');
      setCurrentView('discover');
    } else if (itemHistory.length > 0) {
      // Go back to previous item
      const previousItem = itemHistory.pop();
      setCurrentItem(previousItem);
      setItemHistory([...itemHistory]);
    }
  };

  // Advanced Feature Handlers
  const handleVirtualTryOn = () => {
    setShowVirtualTryOn(true);
  };

  const handleAIStyleQuery = (recommendations) => {
    console.log('🤖 AI Style Recommendations:', recommendations);
    // Filter items based on AI recommendations
    // This would integrate with your ML engine
  };

  // Professional UI - streamlined for clean, futuristic interface

  if (isLoading) {
    return (
      <div className="app-container loading">
        <div className="loading-screen">
          <div className="loading-logo">VISIONFIT</div>
          <h2>VisionFit</h2>
          <p>Advanced Dataset Processing Pipeline...</p>
          <div className="loading-details">
            <p>� Loading 8 fashion brand datasets</p>
            <p>🔍 Analyzing schemas & mapping fields</p>
            <p>🧹 Data cleaning & standardization</p>
            <p>🔄 Merging into unified catalog</p>
            <p>🎯 Feature engineering for ML</p>
            <p>Training recommendation engine</p>
          </div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            {itemHistory.length > 0 && (
              <button 
                className="back-btn"
                onClick={handleGoBack}
                title="Go back to previous item"
              >
                ←
              </button>
            )}
          </div>
          <h1 className="app-title">VisionFit</h1>
          <div className="user-stats">
            <span className="swipe-count">{swipeCount} swipes</span>
            <span className="favorites-count">{favorites.length} saved</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {currentView === 'discover' ? (
          <div className="discover-feed">
            {/* Professional futuristic UI - streamlined interface */}
            
            <div className="swipe-area">
              <SwipeInterface 
                key={currentItem?.id || 'loading'}
                item={currentItem}
                onSwipe={handleSwipe}
                onBuildOutfit={handleBuildOutfit}
                disabled={isLoading || isProcessingSwipe}
              />
            </div>
            
            {/* Enhanced Quick Actions */}
            <div className="quick-actions">
              <button 
                className="action-btn skip-btn"
                onClick={() => {
                  console.log('👎 Button clicked - Pass');
                  handleSwipe(currentItem, 'dislike');
                }}
                disabled={isLoading || isProcessingSwipe}
              >
                <span>👎</span>
                <span>Pass</span>
              </button>
              
              <button 
                className="action-btn tryon-btn"
                onClick={handleVirtualTryOn}
                disabled={!currentItem}
              >
                <span>🪞</span>
                <span>Try On</span>
              </button>
              
              <button 
                className="action-btn save-btn"
                onClick={() => {
                  console.log('💖 Button clicked - Save');
                  handleSwipe(currentItem, 'like');
                }}
                disabled={isLoading || isProcessingSwipe}
              >
                <span>💖</span>
                <span>Save</span>
              </button>
            </div>
            

          </div>
        ) : (
          <FavoritesPage 
            favorites={favorites}
            onRemoveFavorite={handleFavoriteRemove}
            onGetRecommendations={getRecommendationsForFavorite}
            onAddFavorite={handleAddFavorite}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-btn ${currentView === 'discover' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('discover')}
        >
          <span className="nav-label">DISCOVER</span>
        </button>
        
        <button 
          className="nav-btn ai-nav"
          onClick={() => setShowStyleMatcher(true)}
        >
          <span className="nav-label">AI MATCH</span>
        </button>
        
        <button 
          className="nav-btn outfit-nav"
          onClick={() => setShowOutfitGenerator(true)}
          disabled={favorites.length < 2}
        >
          <span className="nav-label">OUTFITS</span>
        </button>
        
        <button 
          className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('favorites')}
        >
          <span className="nav-label">
            SAVED
            {favorites.length > 0 && (
              <span className="nav-badge">{favorites.length}</span>
            )}
          </span>
        </button>
      </nav>

      {/* Clean professional interface - debug panel removed */}

      {/* Feature Modals */}
      {showDataPreview && (
        <DataPreview 
          dataset={processedDataset}
          onClose={() => setShowDataPreview(false)}
        />
      )}
      
      {/* Virtual Try-On Modal */}
      <VirtualTryOn 
        item={currentItem}
        onClose={() => setShowVirtualTryOn(false)}
        isVisible={showVirtualTryOn}
      />
      
      {/* AI Style Assistant Modal */}
      <AIStyleAssistant 
        onStyleRecommendation={handleAIStyleQuery}
        userProfile={userProfile}
        isVisible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        generatedOutfits={generatedOutfits}
      />
      
      {/* Streamlined UI - analytics feature removed */}
      
      {/* Outfit Generator Modal */}
      <OutfitGenerator 
        favorites={favorites}
        isVisible={showOutfitGenerator}
        onClose={() => setShowOutfitGenerator(false)}
        onOutfitsGenerated={setGeneratedOutfits}
      />
      
      {/* AI Style Matcher Modal */}
      <StyleMatcher 
        dataset={processedDataset}
        isVisible={showStyleMatcher}
        onClose={() => setShowStyleMatcher(false)}
        onStyleMatch={(matches, results) => {
          setStyleMatchResults(matches);
          console.log('🎯 Style matches found:', matches.length, results);
        }}
      />
      
      {/* Smart Outfit Recommendations Modal */}
      <SmartOutfitRecommendations 
        dataset={processedDataset}
        isVisible={showSmartOutfits}
        onClose={() => setShowSmartOutfits(false)}
        selectedItem={selectedItemForOutfit}
        onOutfitSelected={(outfit) => {
          console.log('✨ Outfit selected:', outfit);
          // Add outfit items to favorites
          const newFavorites = [...favorites];
          outfit.items.forEach(item => {
            if (!newFavorites.find(fav => fav.id === item.id)) {
              newFavorites.push(item);
            }
          });
          setFavorites(newFavorites);
          setShowSmartOutfits(false);
        }}
      />
    </div>
  );
};



export default TikTokStyleApp;
