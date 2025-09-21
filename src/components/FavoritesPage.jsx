import React, { useState, useEffect } from 'react';
import './FavoritesPage.css';

const FavoritesPage = ({ favorites, onRemoveFavorite, onGetRecommendations, onAddFavorite }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'brand', 'price'
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', ...new Set(favorites.map(item => item.category))];

  const sortedFavorites = favorites
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.savedAt - a.savedAt;
        case 'brand':
          return a.brand.localeCompare(b.brand);
        case 'price':
          return a.price - b.price;
        default:
          return 0;
      }
    });

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    if (onGetRecommendations) {
      const recs = await onGetRecommendations(item);
      setRecommendations(recs);
    }
  };

  const getOutfitSuggestions = () => {
    // Group favorites by category for outfit building
    const categorized = favorites.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});

    const outfits = [];
    
    // Simple outfit generation logic
    if (categorized.tops && categorized.bottoms) {
      for (let i = 0; i < Math.min(3, categorized.tops.length); i++) {
        for (let j = 0; j < Math.min(2, categorized.bottoms.length); j++) {
          outfits.push({
            id: `outfit_${i}_${j}`,
            items: [categorized.tops[i], categorized.bottoms[j]],
            name: `${categorized.tops[i].brand} + ${categorized.bottoms[j].brand}`
          });
        }
      }
    }

    return outfits;
  };

  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <div className="empty-state">
          <div className="empty-icon">💖</div>
          <h2>Your Wardrobe Awaits</h2>
          <p>Start swiping to build your personal collection of fashion favorites.</p>
          <div className="empty-features">
            <div className="feature">
              <span className="feature-icon">OUTFITS</span>
              <span>Save items you love</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🧠</span>
              <span>Get AI recommendations</span>
            </div>
            <div className="feature">
              <span className="feature-icon">STYLE</span>
              <span>Build complete outfits</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      {/* Header */}
      <div className="favorites-header">
        <div className="header-top">
          <h2>My Wardrobe</h2>
          <span className="item-count">{favorites.length} items</span>
        </div>
        
        {/* Controls */}
        <div className="favorites-controls">
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <span>⚏</span>
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span>☰</span>
            </button>
          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Most Recent</option>
            <option value="brand">Brand A-Z</option>
            <option value="price">Price Low-High</option>
          </select>
          
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Outfit Suggestions */}
      {getOutfitSuggestions().length > 0 && (
        <div className="outfit-suggestions">
          <h3>OUTFIT IDEAS</h3>
          <div className="outfit-grid">
            {getOutfitSuggestions().slice(0, 3).map(outfit => (
              <div key={outfit.id} className="outfit-card">
                <div className="outfit-items">
                  {outfit.items.map((item, index) => (
                    <div key={item.id} className="outfit-item">
                      <img src={item.imageUrl} alt={item.name} />
                    </div>
                  ))}
                </div>
                <p className="outfit-name">{outfit.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites Grid/List */}
      <div className={`favorites-content ${viewMode}`}>
        {sortedFavorites.map(item => (
          <div 
            key={item.id} 
            className="favorite-item"
            onClick={() => handleItemClick(item)}
          >
            <div className="item-image">
              <img src={item.imageUrl} alt={item.name} />
              <button 
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFavorite(item.id);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="item-details">
              <h4 className="item-name">{item.name}</h4>
              <p className="item-brand">{item.brand}</p>
              <div className="item-meta">
                <span className="item-price">${item.price}</span>
                <span className="item-category">{item.category}</span>
              </div>
              
              {item.colors && (
                <div className="item-colors">
                  {item.colors.slice(0, 3).map((color, index) => (
                    <div 
                      key={index}
                      className="color-dot"
                      style={{ backgroundColor: '#CCCCCC' }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="item-modal" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>
            
            <div className="modal-body">
              <div className="modal-image">
                <img src={selectedItem.imageUrl} alt={selectedItem.name} />
              </div>
              
              <div className="modal-details">
                <h3>{selectedItem.name}</h3>
                <p className="modal-brand">{selectedItem.brand}</p>
                <p className="modal-price">${selectedItem.price}</p>
                
                {selectedItem.styleFeatures && (
                  <div className="modal-features">
                    {selectedItem.styleFeatures.map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                )}
                
                {recommendations.length > 0 && (
                  <div className="modal-recommendations">
                    <h4>You might also like:</h4>
                    <div className="rec-grid">
                      {recommendations.slice(0, 4).map(rec => {
                        const isAlreadyFavorited = favorites.some(fav => fav.id === rec.id);
                        return (
                          <div key={rec.id} className="rec-item">
                            <div className="rec-image-container">
                              <img src={rec.imageUrl || rec.image_url || rec.image} alt={rec.name} />
                              <button 
                                className={`heart-btn ${isAlreadyFavorited ? 'favorited' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isAlreadyFavorited && onAddFavorite) {
                                    onAddFavorite(rec);
                                  }
                                }}
                                disabled={isAlreadyFavorited}
                                title={isAlreadyFavorited ? 'Already in wardrobe' : 'Add to wardrobe'}
                              >
                                {isAlreadyFavorited ? '💖' : '🤍'}
                              </button>
                            </div>
                            <div className="rec-details">
                              <p className="rec-name">{rec.name}</p>
                              <div className="rec-meta">
                                <span className="rec-price">${rec.price}</span>
                                <span className="rec-brand">{rec.brand}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Stats */}
      <div className="wardrobe-stats">
        <div className="stat-item">
          <span className="stat-number">{favorites.length}</span>
          <span className="stat-label">Items Saved</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{new Set(favorites.map(f => f.brand)).size}</span>
          <span className="stat-label">Brands</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            ${Math.round(favorites.reduce((sum, f) => sum + f.price, 0))}
          </span>
          <span className="stat-label">Total Value</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getOutfitSuggestions().length}</span>
          <span className="stat-label">Outfit Ideas</span>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;