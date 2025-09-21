import React, { useState, useRef } from 'react';
import './StyleMatcher.css';

const StyleMatcher = ({ dataset, isVisible, onClose, onStyleMatch }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [matchedItems, setMatchedItems] = useState([]);
  const fileInputRef = useRef(null);

  // Color analysis using HTML5 Canvas
  const analyzeImageColors = (imageElement) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      
      ctx.drawImage(imageElement, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Extract dominant colors
      const colorCounts = {};
      
      for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel for performance
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];
        
        if (alpha > 128) { // Ignore transparent pixels
          const colorKey = `${Math.floor(r/32)*32}-${Math.floor(g/32)*32}-${Math.floor(b/32)*32}`;
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }
      }
      
      // Get top 5 dominant colors
      const dominantColors = Object.entries(colorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([colorKey]) => {
          const [r, g, b] = colorKey.split('-').map(Number);
          return { r, g, b, hex: `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}` };
        });
      
      resolve(dominantColors);
    });
  };

  // Color theory for complementary colors
  const getComplementaryColors = (dominantColors) => {
    return dominantColors.map(color => {
      // Simple complementary color (opposite on color wheel)
      const compR = 255 - color.r;
      const compG = 255 - color.g;
      const compB = 255 - color.b;
      
      return {
        original: color,
        complementary: {
          r: compR,
          g: compG,
          b: compB,
          hex: `#${compR.toString(16).padStart(2,'0')}${compG.toString(16).padStart(2,'0')}${compB.toString(16).padStart(2,'0')}`
        }
      };
    });
  };

  // Color similarity calculation
  const calculateColorSimilarity = (color1, color2) => {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    
    const distance = Math.sqrt(dr*dr + dg*dg + db*db);
    const maxDistance = Math.sqrt(255*255 + 255*255 + 255*255);
    
    return 1 - (distance / maxDistance); // Convert to similarity score
  };

  // Convert color name to RGB
  const colorNameToRgb = (colorName) => {
    const colorMap = {
      'black': { r: 0, g: 0, b: 0 },
      'white': { r: 255, g: 255, b: 255 },
      'red': { r: 255, g: 0, b: 0 },
      'blue': { r: 0, g: 0, b: 255 },
      'green': { r: 0, g: 128, b: 0 },
      'yellow': { r: 255, g: 255, b: 0 },
      'orange': { r: 255, g: 165, b: 0 },
      'purple': { r: 128, g: 0, b: 128 },
      'pink': { r: 255, g: 192, b: 203 },
      'brown': { r: 165, g: 42, b: 42 },
      'gray': { r: 128, g: 128, b: 128 },
      'grey': { r: 128, g: 128, b: 128 },
      'navy': { r: 0, g: 0, b: 128 },
      'beige': { r: 245, g: 245, b: 220 },
      'tan': { r: 210, g: 180, b: 140 },
      'coral': { r: 255, g: 127, b: 80 },
      'mint': { r: 152, g: 251, b: 152 },
      'sage': { r: 156, g: 175, b: 136 }
    };
    
    return colorMap[colorName.toLowerCase()] || { r: 128, g: 128, b: 128 };
  };

  // Find matching items based on color analysis
  const findStyleMatches = (dominantColors, complementaryColors) => {
    const matches = [];
    
    dataset.forEach(item => {
      let colorScore = 0;
      let maxScore = 0;
      
      if (item.colors && item.colors.length > 0) {
        // Check color compatibility
        item.colors.forEach(itemColor => {
          const itemRgb = colorNameToRgb(itemColor);
          
          // Check similarity with dominant colors
          dominantColors.forEach(domColor => {
            const similarity = calculateColorSimilarity(domColor, itemRgb);
            maxScore = Math.max(maxScore, similarity);
          });
          
          // Check similarity with complementary colors
          complementaryColors.forEach(compSet => {
            const similarity = calculateColorSimilarity(compSet.complementary, itemRgb);
            maxScore = Math.max(maxScore, similarity * 1.2); // Boost complementary matches
          });
        });
        
        colorScore = maxScore;
      }
      
      // Additional scoring factors
      let styleScore = 0;
      
      // Occasion matching (if we can detect from name/category)
      if (item.occasions && item.occasions.length > 0) {
        styleScore += 0.1;
      }
      
      // Brand consistency bonus
      if (item.brand) {
        styleScore += 0.05;
      }
      
      const totalScore = (colorScore * 0.7) + (styleScore * 0.3);
      
      if (totalScore > 0.3) { // Minimum threshold
        matches.push({
          ...item,
          matchScore: totalScore,
          colorScore,
          styleScore,
          matchReason: totalScore > 0.6 ? 'Perfect Match' : 
                      totalScore > 0.45 ? 'Great Match' : 'Good Match'
        });
      }
    });
    
    // Sort by match score and return top 10
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsAnalyzing(true);
    
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    // Create image element for analysis
    const img = new Image();
    img.onload = async () => {
      try {
        console.log('🎨 Analyzing uploaded image for style matching...');
        
        // Analyze colors
        const dominantColors = await analyzeImageColors(img);
        const complementaryColors = getComplementaryColors(dominantColors);
        
        console.log('🎯 Dominant colors found:', dominantColors);
        
        // Find matches
        const matches = findStyleMatches(dominantColors, complementaryColors);
        
        const results = {
          dominantColors,
          complementaryColors,
          totalMatches: matches.length,
          confidence: matches.length > 0 ? Math.round(matches[0].matchScore * 100) : 0
        };
        
        setAnalysisResults(results);
        setMatchedItems(matches);
        setIsAnalyzing(false);
        
        console.log(`✨ Found ${matches.length} style matches!`);
        
        // Notify parent component
        if (onStyleMatch) {
          onStyleMatch(matches, results);
        }
        
      } catch (error) {
        console.error('❌ Error analyzing image:', error);
        setIsAnalyzing(false);
      }
    };
    
    img.src = imageUrl;
  };

  const handleClearAnalysis = () => {
    setUploadedImage(null);
    setAnalysisResults(null);
    setMatchedItems([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="style-matcher-overlay">
      <div className="style-matcher-container">
        <div className="style-matcher-header">
          <h2>AI Style Matcher</h2>
          <p>Upload any clothing item and find perfect matches!</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="style-matcher-content">
          {!uploadedImage ? (
            <div className="upload-area">
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon">📸</div>
                <h3>Upload Fashion Item</h3>
                <p>Take a photo or upload an image of any clothing item</p>
                <button className="upload-btn">Choose Image</button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="analysis-section">
              <div className="uploaded-image">
                <img src={uploadedImage} alt="Uploaded item" />
                <button className="clear-btn" onClick={handleClearAnalysis}>
                  New Image
                </button>
              </div>

              {isAnalyzing ? (
                <div className="analyzing">
                  <div className="spinner"></div>
                  <h3>Analyzing Style...</h3>
                  <p>Finding perfect matches from 7,475+ items</p>
                </div>
              ) : analysisResults ? (
                <div className="results-section">
                  <div className="analysis-summary">
                    <h3>Style Analysis Complete!</h3>
                    <div className="confidence-score">
                      {analysisResults.confidence}% Match Confidence
                    </div>
                    <p>Found {analysisResults.totalMatches} perfect matches</p>
                  </div>

                  <div className="color-analysis">
                    <h4>Dominant Colors</h4>
                    <div className="color-palette">
                      {analysisResults.dominantColors.map((color, index) => (
                        <div
                          key={index}
                          className="color-swatch"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="matched-items">
                    <h4>Perfect Style Matches</h4>
                    <div className="matches-grid">
                      {matchedItems.slice(0, 6).map((item, index) => (
                        <div key={item.id} className="match-card">
                          <div className="match-image">
                            <img
                              src={item.image_url || item.imageUrl}
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/200x250/667eea/ffffff?text=${encodeURIComponent(item.brand)}`;
                              }}
                            />
                            <div className="match-score">
                              {Math.round(item.matchScore * 100)}%
                            </div>
                          </div>
                          <div className="match-info">
                            <h5>{item.name}</h5>
                            <p className="brand">{item.brand}</p>
                            <p className="price">${item.price}</p>
                            <span className="match-reason">{item.matchReason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="style-matcher-footer">
          <div className="feature-info">
            <p>✨ AI-powered color analysis and style matching</p>
            <p>🎯 Instant results from 7,475+ fashion items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleMatcher;