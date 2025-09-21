import React, { useState, useRef, useCallback } from 'react';
import './SwipeInterface.css';

// Color mapping function to convert color names to hex values
const getColorHex = (colorName) => {
  const colorMap = {
    // Basic colors
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'blue': '#0000FF',
    'navy': '#000080',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'gray': '#808080',
    'grey': '#808080',
    'beige': '#F5F5DC',
    'cream': '#FFFDD0',
    'tan': '#D2B48C',
    'khaki': '#F0E68C',
    'olive': '#808000',
    'maroon': '#800000',
    'silver': '#C0C0C0',
    'gold': '#FFD700',
    
    // Fashion-specific colors
    'nude': '#E3C4A8',
    'blush': '#DE5D83',
    'coral': '#FF7F50',
    'mint': '#98FB98',
    'sage': '#9CAF88',
    'dusty rose': '#DCAE96',
    'mauve': '#E0B4D6',
    'taupe': '#483C32',
    'champagne': '#F7E7CE',
    'burgundy': '#800020',
    'teal': '#008080',
    'turquoise': '#40E0D0',
    'lavender': '#E6E6FA',
    'peach': '#FFCBA4',
    'salmon': '#FA8072',
    'magenta': '#FF00FF',
    'cyan': '#00FFFF',
    'lime': '#00FF00',
    'forest': '#228B22',
    'royal blue': '#4169E1',
    'sky blue': '#87CEEB',
    'hot pink': '#FF69B4',
    'light pink': '#FFB6C1',
    'dark blue': '#00008B',
    'light blue': '#ADD8E6',
    'dark green': '#006400',
    'light green': '#90EE90',
    'dark red': '#8B0000',
    'light gray': '#D3D3D3',
    'dark gray': '#A9A9A9',
    'off white': '#FAF0E6',
    
    // Additional common variations
    'charcoal': '#36454F',
    'slate': '#708090',
    'stone': '#928E85',
    'ivory': '#FFFFF0',
    'pearl': '#EAE0C8',
    'rose': '#FF007F',
    'fuchsia': '#FF00FF',
    'violet': '#8A2BE2',
    'indigo': '#4B0082',
    'aqua': '#00FFFF',
    'seafoam': '#93E9BE',
    'emerald': '#50C878',
    'jade': '#00A86B',
    'ruby': '#E0115F',
    'sapphire': '#0F52BA',
    'amber': '#FFBF00',
    'copper': '#B87333',
    
    // Heather variations (common in activewear)
    'black heather': '#2D2D2D',
    'midnight heather': '#191970',
    'smoke blue heather': '#6B8CAE',
    'cobblestone heather': '#8B8680',
    'bone heather': '#F5F5DC',
    'raisin heather': '#674C47',
    'bright iris heather': '#5D4E75',
    'pale heather camo': '#D3D3D3',
    'charcoal windowpane': '#36454F',
    'moss heather': '#8A9A5B',
    'rain heather': '#87CEEB',
    'pistachio heather': '#93C572',
    'isle blue heather': '#4682B4',
    'bronze': '#CD7F32',
    'platinum': '#E5E4E2',
    'ash': '#B2BEB5',
    'smoke': '#738276',
    'fog': '#D5D5D5',
    'mist': '#C4C4BC',
    'cloud': '#E6E6E6',
    'storm': '#4F666A',
    'midnight': '#191970',
    'coal': '#36454F',
    'onyx': '#353839',
    'jet': '#343434',
    'raven': '#2C2C2C',
    'ebony': '#555D50',
    'ink': '#2E2E2E',
    'shadow': '#8B8680',
    'ash gray': '#B2BEB5',
    'ash grey': '#B2BEB5',
    'light grey': '#D3D3D3',
    'medium gray': '#A0A0A0',
    'medium grey': '#A0A0A0',
    'steel': '#71797E',
    'iron': '#5C5C5C',
    'graphite': '#41424C',
    'concrete': '#A8A8A8',
    'cement': '#A8A8A8',
    
    // Alo Yoga specific colors
    'espresso': '#6F4E37',
    'anthracite': '#36454F',
    'pink wild rose': '#FF1493',
    'gravel': '#A0A0A0',
    'green olive': '#556B2F',
    'lunar grey': '#D3D3D3',
    'athletic heather grey': '#B8B8B8',
    'toasted almond': '#D2B48C',
    'smoky quartz': '#8A8A8A',
    'macadamia': '#F5E6D3',
    'winter ivy': '#4A5D23',
    'mushroom': '#C7B699',
    'seashell blue': '#87CEEB',
    'crystal clear blue': '#4FD0E7',
    'candy red': '#FF0800',
    'spearmint': '#16982B',
    'bold red': '#DC143C',
    'sweet pink': '#FFB6C1',
    'oatmeal heather': '#DEB887',
    'dark pink quartz heather': '#CD5C5C',
    'charcoal green': '#2F4F2F',
    'steel grey': '#71797E',
    'ivy garden': '#355E3B',
    'sandstone': '#C2B280',
    'titanium': '#878681',
    'bone': '#E3DAC9',
    
    // Additional mappings for common fashion colors
    'blush pink': '#DE5D83',
    'dusty pink': '#DCAE96',
    'forest green': '#228B22',
    'deep navy': '#000080',
    'warm gray': '#8B8680',
    'cool gray': '#8C92AC',
    'warm grey': '#8B8680',
    'cool grey': '#8C92AC',
    'gunmetal': '#36454F',
    'pewter': '#96A8A1',
    'clay': '#B66A50',
    'moss': '#8A9A5B'
  };
  
  const normalizedColor = colorName.toLowerCase().trim();
  
  // Debug: log unrecognized colors
  if (!colorMap[normalizedColor] && normalizedColor !== '') {
    console.log(`🎨 Unknown color: "${colorName}" (normalized: "${normalizedColor}")`);
  }
  
  // If color not found, try to generate a color based on the name
  if (!colorMap[normalizedColor]) {
    // Simple hash function to generate consistent colors for unknown color names
    let hash = 0;
    for (let i = 0; i < colorName.length; i++) {
      hash = colorName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 50%)`;
  }
  
  return colorMap[normalizedColor];
};

const SwipeInterface = ({ item, onSwipe, onBuildOutfit, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const cardRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const SWIPE_THRESHOLD = 90; // Comfortable threshold for smooth swipes
  const ROTATION_FACTOR = 0.08; // Subtle rotation for smooth visual feedback

  // Optimized touch/mouse start handler
  const handleStart = useCallback((clientX, clientY) => {
    if (disabled) return;
    
    setStartPos({ x: clientX, y: clientY });
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
    setIsDragging(true);
    
    // Add active class for immediate feedback
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  }, [disabled]);

  // Optimized move handler with RAF for smoothness
  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging || disabled || !cardRef.current || isAnimatingRef.current) return;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    
    // Use requestAnimationFrame for smooth 60fps updates
    requestAnimationFrame(() => {
      if (!cardRef.current) return;
      
      const rotation = deltaX * ROTATION_FACTOR;
      const opacity = Math.max(0.8, 1 - Math.abs(deltaX) / 250); // Higher min opacity, faster fade
      
      cardRef.current.style.transform = `translateX(${deltaX}px) translateY(${deltaY * 0.2}px) rotate(${rotation}deg)`;
      cardRef.current.style.opacity = opacity;
    });
    
    // Update state less frequently for better performance
    setDragOffset({ x: deltaX, y: deltaY * 0.2 });
    
    // Show swipe direction indicator with smooth progression
    const newDirection = Math.abs(deltaX) > 35 ? (deltaX > 0 ? 'right' : 'left') : null;
    if (newDirection !== swipeDirection) {
      setSwipeDirection(newDirection);
    }
  }, [isDragging, disabled, startPos, swipeDirection]);

  // Optimized end handler with smooth animations and animation locking
  const handleEnd = useCallback(() => {
    if (!isDragging || disabled || !cardRef.current || isAnimatingRef.current) return;
    
    const { x: deltaX } = dragOffset;
    const shouldSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD;
    
    setIsDragging(false);
    isAnimatingRef.current = true;
    
    if (shouldSwipe && item) {
      const direction = deltaX > 0 ? 'right' : 'left';
      const action = direction === 'right' ? 'like' : 'dislike';
      
      // Animate card out smoothly with gentle easing
      cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease-out';
      cardRef.current.style.transform = `translateX(${direction === 'right' ? '110%' : '-110%'}) rotate(${direction === 'right' ? '20deg' : '-20deg'})`;
      cardRef.current.style.opacity = '0';
      
      // Trigger swipe action with smooth timing
      setTimeout(() => {
        onSwipe(item, action);
        // Reset for next card
        requestAnimationFrame(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = 'none';
            cardRef.current.style.transform = 'none';
            cardRef.current.style.opacity = '1';
          }
          setDragOffset({ x: 0, y: 0 });
          setSwipeDirection(null);
          isAnimatingRef.current = false;
        });
      }, 120); // Comfortable timing for smooth experience
    } else {
      // Spring back to center smoothly with natural bounce
      cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.25s ease-out';
      cardRef.current.style.transform = 'none';
      cardRef.current.style.opacity = '1';
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = 'none';
        }
        setDragOffset({ x: 0, y: 0 });
        setSwipeDirection(null);
        isAnimatingRef.current = false;
      }, 400); // Natural timing for smooth spring-back
    }
  }, [isDragging, disabled, dragOffset, item, onSwipe]);

  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging) {
      e.preventDefault(); // Prevent scrolling while swiping
    }
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove, isDragging]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Add/remove mouse listeners based on dragging state
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset state when item changes
  React.useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
    setIsDragging(false);
  }, [item?.id]);

  // Card style based on drag offset - optimized for smooth experience
  const getCardStyle = () => {
    const { x, y } = dragOffset;
    const rotation = x * 0.04; // Gentle rotation for smooth visual feedback
    const scale = 1 - Math.abs(x) / (window.innerWidth * 2.5);
    const opacity = 1 - Math.abs(x) / (window.innerWidth * 2);
    
    return {
      transform: `translateX(${x}px) translateY(${y}px) rotate(${rotation}deg) scale(${Math.max(0.95, scale)})`,
      opacity: Math.max(0.7, opacity),
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-out',
      cursor: isDragging ? 'grabbing' : 'grab'
    };
  };

  const getOverlayOpacity = () => {
    return Math.min(Math.abs(dragOffset.x) / SWIPE_THRESHOLD, 1);
  };

  if (!item) {
    return (
      <div className="swipe-container">
        <div className="fashion-card loading-card">
          <div className="loading-placeholder">
            <div className="loading-spinner">⏳</div>
            <p>Loading next item...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-container">
      <div
        ref={cardRef}
        className={`fashion-card ${disabled ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
        style={getCardStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Swipe Direction Overlays */}
        {swipeDirection && (
          <div className={`swipe-overlay ${swipeDirection}-overlay`} 
               style={{ opacity: getOverlayOpacity() }}>
            <div className="overlay-content">
              {swipeDirection === 'right' ? (
                <>
                  <div className="overlay-text">LOVE IT</div>
                </>
              ) : (
                <>
                  <div className="overlay-text">PASS</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className="card-image">
          <img 
            src={item.image_url || item.imageUrl || item.image} 
            alt={item.name}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/400x600/667eea/ffffff?text=${encodeURIComponent(item.brand || 'Fashion')}`;
            }}
            draggable={false}
          />
          
          <div className="image-info">
            <div className="brand-badge">{item.brand}</div>
            <div className="price-badge">${item.price}</div>
          </div>
        </div>

        {/* Product Details */}
        <div className="card-details">
          <h3 className="product-name">{item.name}</h3>
          
          <div className="product-meta">
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="discount">
                {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {item.colors && item.colors.length > 0 && (
            <div className="color-options">
              {item.colors.slice(0, 5).map((color, index) => {
                const hexColor = getColorHex(color);
                // Debug: log colors for this item
                if (index === 0) {
                  console.log(`🎨 Colors for ${item.name}:`, item.colors);
                  console.log(`🎨 Color mappings:`, item.colors.map(c => `${c} -> ${getColorHex(c)}`));
                }
                return (
                  <div 
                    key={index}
                    className="color-swatch"
                    style={{ 
                      backgroundColor: hexColor,
                      border: hexColor === '#FFFFFF' ? '1px solid #ddd' : 'none'
                    }}
                    title={`${color} (${hexColor})`}
                  />
                );
              })}
            </div>
          )}



          {/* Action Buttons */}
          {onBuildOutfit && (
            <div className="action-buttons">
              <button 
                className="build-outfit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuildOutfit(item);
                }}
              >
                ✨ Build Outfit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeInterface;