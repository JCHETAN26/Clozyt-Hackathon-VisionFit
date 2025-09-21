import React, { useState, useEffect } from 'react';
import './SmartOutfitRecommendations.css';

const SmartOutfitRecommendations = ({ 
  dataset, 
  isVisible, 
  onClose, 
  selectedItem,
  onOutfitSelected 
}) => {
  const [outfitRecommendations, setOutfitRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  useEffect(() => {
    if (isVisible && selectedItem && dataset.length > 0) {
      generateSmartOutfits();
    }
  }, [isVisible, selectedItem, dataset]);

  // Smart outfit generation based on the selected item
  const generateSmartOutfits = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🎯 Generating smart outfits for:', selectedItem.name);
      
      // Define outfit categories and their required pieces
      const outfitTemplates = [
        {
          name: 'Casual Chic',
          required: ['top', 'bottom'],
          optional: ['jacket', 'accessories'],
          style: 'casual'
        },
        {
          name: 'Work Professional',
          required: ['top', 'bottom'],
          optional: ['blazer', 'accessories'],
          style: 'professional'
        },
        {
          name: 'Date Night',
          required: ['dress_or_top', 'bottom_if_top'],
          optional: ['jacket', 'accessories'],
          style: 'romantic'
        },
        {
          name: 'Weekend Vibes',
          required: ['top', 'bottom'],
          optional: ['jacket', 'sneakers'],
          style: 'relaxed'
        }
      ];

      const outfits = [];

      for (const template of outfitTemplates) {
        const outfit = await buildOutfitFromTemplate(selectedItem, template);
        if (outfit && outfit.items.length >= 2) {
          outfits.push(outfit);
        }
      }

      setOutfitRecommendations(outfits);
      console.log(`✨ Generated ${outfits.length} smart outfit recommendations`);
      
    } catch (error) {
      console.error('❌ Error generating outfits:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Build outfit based on template and selected item
  const buildOutfitFromTemplate = async (baseItem, template) => {
    const outfit = {
      name: template.name,
      style: template.style,
      items: [baseItem],
      totalPrice: parseFloat(baseItem.price) || 0,
      confidence: 0
    };

    // Determine what category the base item is
    const baseCategory = categorizeItem(baseItem);
    
    // Find complementary pieces
    const complementaryItems = findComplementaryItems(baseItem, baseCategory, template);
    
    // Add the best matches to the outfit
    complementaryItems.forEach(item => {
      if (outfit.items.length < 4) { // Limit outfit size
        outfit.items.push(item);
        outfit.totalPrice += parseFloat(item.price) || 0;
      }
    });

    // Calculate outfit confidence based on color harmony and style consistency
    outfit.confidence = calculateOutfitConfidence(outfit.items);

    return outfit;
  };

  // Categorize item into clothing type
  const categorizeItem = (item) => {
    const name = item.name.toLowerCase();
    const category = item.category?.toLowerCase() || '';
    
    if (name.includes('dress') || category.includes('dress')) return 'dress';
    if (name.includes('top') || name.includes('shirt') || name.includes('blouse') || 
        name.includes('tee') || name.includes('tank') || category.includes('top')) return 'top';
    if (name.includes('bottom') || name.includes('pant') || name.includes('jean') || 
        name.includes('short') || name.includes('skirt') || category.includes('bottom')) return 'bottom';
    if (name.includes('jacket') || name.includes('blazer') || name.includes('cardigan') || 
        category.includes('outerwear')) return 'jacket';
    if (name.includes('shoe') || name.includes('boot') || name.includes('sneaker') || 
        category.includes('shoes')) return 'shoes';
    
    return 'accessory';
  };

  // Find items that complement the base item
  const findComplementaryItems = (baseItem, baseCategory, template) => {
    const complementaryItems = [];
    const baseColors = baseItem.colors || [];
    const baseBrand = baseItem.brand;
    const basePrice = parseFloat(baseItem.price) || 0;

    // Define what we need based on the base item
    let neededCategories = [];
    
    if (baseCategory === 'dress') {
      neededCategories = ['jacket', 'shoes', 'accessory'];
    } else if (baseCategory === 'top') {
      neededCategories = ['bottom', 'jacket', 'shoes'];
    } else if (baseCategory === 'bottom') {
      neededCategories = ['top', 'jacket', 'shoes'];
    } else if (baseCategory === 'jacket') {
      neededCategories = ['top', 'bottom', 'shoes'];
    }

    // Find items for each needed category
    neededCategories.forEach(neededCategory => {
      const candidateItems = dataset
        .filter(item => {
          const itemCategory = categorizeItem(item);
          return itemCategory === neededCategory && item.id !== baseItem.id;
        })
        .map(item => {
          // Calculate compatibility score
          let score = 0;
          
          // Color harmony (30% of score)
          if (item.colors && baseColors.length > 0) {
            const colorMatch = calculateColorHarmony(baseColors, item.colors);
            score += colorMatch * 0.3;
          }
          
          // Price compatibility (20% of score)
          const itemPrice = parseFloat(item.price) || 0;
          const priceRatio = Math.min(itemPrice, basePrice) / Math.max(itemPrice, basePrice);
          score += priceRatio * 0.2;
          
          // Brand compatibility (15% of score)
          if (item.brand === baseBrand) {
            score += 0.15;
          }
          
          // Style consistency (25% of score)
          const styleMatch = calculateStyleConsistency(baseItem, item);
          score += styleMatch * 0.25;
          
          // Random variety (10% of score)
          score += Math.random() * 0.1;
          
          return { ...item, compatibilityScore: score };
        })
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 2); // Take top 2 candidates per category

      complementaryItems.push(...candidateItems);
    });

    return complementaryItems;
  };

  // Calculate color harmony between two color arrays
  const calculateColorHarmony = (colors1, colors2) => {
    if (!colors1.length || !colors2.length) return 0.5;

    const harmonious = [
      ['black', 'white'], ['black', 'gray'], ['white', 'gray'],
      ['blue', 'white'], ['blue', 'black'], ['navy', 'white'],
      ['red', 'black'], ['red', 'white'], ['pink', 'white'],
      ['green', 'white'], ['brown', 'beige'], ['brown', 'white']
    ];

    for (const color1 of colors1) {
      for (const color2 of colors2) {
        for (const [h1, h2] of harmonious) {
          if ((color1.toLowerCase().includes(h1) && color2.toLowerCase().includes(h2)) ||
              (color1.toLowerCase().includes(h2) && color2.toLowerCase().includes(h1))) {
            return 0.9;
          }
        }
        
        // Same color family bonus
        if (color1.toLowerCase() === color2.toLowerCase()) {
          return 0.8;
        }
      }
    }

    return 0.4; // Neutral score for unknown combinations
  };

  // Calculate style consistency between items
  const calculateStyleConsistency = (item1, item2) => {
    const occasions1 = item1.occasions || [];
    const occasions2 = item2.occasions || [];
    
    // Check for matching occasions
    for (const occ1 of occasions1) {
      for (const occ2 of occasions2) {
        if (occ1.toLowerCase() === occ2.toLowerCase()) {
          return 0.8;
        }
      }
    }
    
    return 0.5; // Neutral score
  };

  // Calculate overall outfit confidence
  const calculateOutfitConfidence = (items) => {
    if (items.length < 2) return 0;
    
    let totalScore = 0;
    let comparisons = 0;
    
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1Colors = items[i].colors || [];
        const item2Colors = items[j].colors || [];
        
        const colorHarmony = calculateColorHarmony(item1Colors, item2Colors);
        const styleConsistency = calculateStyleConsistency(items[i], items[j]);
        
        totalScore += (colorHarmony + styleConsistency) / 2;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalScore / comparisons : 0.5;
  };

  if (!isVisible) return null;

  return (
    <div className="smart-outfit-overlay">
      <div className="smart-outfit-container">
        <div className="smart-outfit-header">
          <h2>Smart Outfit Builder</h2>
          <p>Complete outfits based on your selection</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="smart-outfit-content">
          {selectedItem && (
            <div className="selected-item-display">
              <img 
                src={selectedItem.image_url || selectedItem.imageUrl} 
                alt={selectedItem.name}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/100x120/667eea/ffffff?text=${encodeURIComponent(selectedItem.brand)}`;
                }}
              />
              <div className="selected-item-info">
                <h3>{selectedItem.name}</h3>
                <p>{selectedItem.brand} • ${selectedItem.price}</p>
              </div>
            </div>
          )}

          {isGenerating ? (
            <div className="generating-outfits">
              <div className="spinner"></div>
              <h3>Creating Perfect Outfits...</h3>
              <p>Analyzing colors, styles, and trends</p>
            </div>
          ) : (
            <div className="outfit-recommendations">
              {outfitRecommendations.map((outfit, index) => (
                <div 
                  key={index} 
                  className={`outfit-card ${selectedOutfit?.index === index ? 'selected' : ''}`}
                  onClick={() => setSelectedOutfit({ ...outfit, index })}
                >
                  <div className="outfit-header">
                    <h3>{outfit.name}</h3>
                    <div className="confidence-score">
                      {Math.round(outfit.confidence * 100)}% Match
                    </div>
                  </div>
                  
                  <div className="outfit-items">
                    {outfit.items.map((item, itemIndex) => (
                      <div key={item.id} className="outfit-item">
                        <img 
                          src={item.image_url || item.imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/80x100/667eea/ffffff?text=${encodeURIComponent(item.brand)}`;
                          }}
                        />
                        {itemIndex === 0 && <div className="selected-indicator">Selected</div>}
                      </div>
                    ))}
                  </div>
                  
                  <div className="outfit-footer">
                    <div className="total-price">Total: ${outfit.totalPrice.toFixed(2)}</div>
                    <button 
                      className="select-outfit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOutfitSelected) {
                          onOutfitSelected(outfit);
                        }
                      }}
                    >
                      Select Outfit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartOutfitRecommendations;