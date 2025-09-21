import React, { useState, useEffect } from 'react';
import './OutfitGenerator.css';

const OutfitGenerator = ({ favorites, isVisible, onClose, onOutfitsGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [suggestions, setSuggestions] = useState([
    'for gym',
    'for lounge',
    'for beach',
    'for date night',
    'for weekend',
    'for party',
    'for yoga'
  ]);  const generateOutfits = async (userPrompt) => {
    if (!userPrompt.trim() || favorites.length < 2) return;

    setIsGenerating(true);
    console.log(`🎨 Generating outfits ${userPrompt} from ${favorites.length} favorites`);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const outfits = createSmartOutfits(userPrompt, favorites);
    setGeneratedOutfits(outfits);
    setIsGenerating(false);
    
    // Share outfits with parent for AI integration
    if (onOutfitsGenerated) {
      onOutfitsGenerated(outfits);
    }
  };

  const createSmartOutfits = (prompt, items) => {
    const lowerPrompt = prompt.toLowerCase();
    console.log('🎯 Creating outfits for prompt:', prompt);
    console.log('📦 Available items:', items.length);
    
    // Enhanced categorization with better filtering
    const categorized = {
      tops: items.filter(item => {
        const itemText = `${item.category || ''} ${item.name || ''}`.toLowerCase();
        // Check if it's explicitly a top
        const hasTopKeywords = (
          itemText.includes('top') || 
          itemText.includes('shirt') ||
          itemText.includes('bra') ||
          itemText.includes('blouse') ||
          itemText.includes('tank') ||
          itemText.includes('cami') ||
          itemText.includes('crop') ||
          itemText.includes('tee') ||
          itemText.includes('hoodie') ||
          itemText.includes('sweater') ||
          itemText.includes('sleeve')
        );
        // Exclude items that are clearly bottoms or dresses
        const hasBottomKeywords = (
          itemText.includes('bottom') || 
          itemText.includes('pant') || 
          itemText.includes('short') || 
          itemText.includes('jean') || 
          itemText.includes('skirt') ||
          itemText.includes('legging') ||
          itemText.includes('trouser')
        );
        const isDress = itemText.includes('dress') || itemText.includes('frock');
        
        return hasTopKeywords && !hasBottomKeywords && !isDress;
      }),
      bottoms: items.filter(item => {
        const itemText = `${item.category || ''} ${item.name || ''}`.toLowerCase();
        // Check if it's explicitly a bottom
        const hasBottomKeywords = (
          itemText.includes('bottom') ||
          itemText.includes('pant') ||
          itemText.includes('short') ||
          itemText.includes('jean') ||
          itemText.includes('skirt') ||
          itemText.includes('legging') ||
          itemText.includes('trouser') ||
          itemText.includes('jogger') ||
          // Add some items that might be categorized as bottoms
          (itemText.includes('ribbed') && (itemText.includes('pant') || itemText.includes('short'))) ||
          itemText.includes('wide leg') ||
          itemText.includes('flare')
        );
        // Exclude items that are clearly tops
        const hasTopKeywords = (
          itemText.includes('top') || 
          itemText.includes('bra') || 
          itemText.includes('shirt') || 
          itemText.includes('tank') || 
          itemText.includes('crop') ||
          itemText.includes('sleeve')
        );
        
        return hasBottomKeywords && !hasTopKeywords;
      }),
      dresses: items.filter(item => {
        const itemText = `${item.category || ''} ${item.name || ''}`.toLowerCase();
        return itemText.includes('dress') || itemText.includes('frock');
      }),
      bikinis: items.filter(item => {
        const itemText = `${item.category || ''} ${item.name || ''}`.toLowerCase();
        return itemText.includes('bikini') || itemText.includes('swimsuit') || itemText.includes('swimwear');
      }),
      beachwear: items.filter(item => {
        const itemText = `${item.category || ''} ${item.name || ''}`.toLowerCase();
        return (
          itemText.includes('bikini') ||
          itemText.includes('swimsuit') ||
          itemText.includes('swimwear') ||
          itemText.includes('beach') ||
          itemText.includes('sarong') ||
          itemText.includes('coverup') ||
          (itemText.includes('dress') && (itemText.includes('summer') || itemText.includes('maxi') || itemText.includes('sundress')))
        );
      }),
      accessories: items.filter(item => {
        const itemText = `${item.category || ''} ${item.name || ''}`.toLowerCase();
        return (
          itemText.includes('accessor') ||
          itemText.includes('bag') ||
          itemText.includes('tote') ||
          itemText.includes('hat') ||
          itemText.includes('sunglasses')
        );
      }),
      activewear: items.filter(item => {
        const itemText = `${item.brand || ''} ${item.name || ''} ${item.category || ''}`.toLowerCase();
        return (
          itemText.includes('gymshark') ||
          itemText.includes('alo') ||
          itemText.includes('vuori') ||
          itemText.includes('sport') ||
          itemText.includes('gym') ||
          itemText.includes('athletic') ||
          itemText.includes('workout') ||
          itemText.includes('active')
        );
      })
    };

    // Debug categorization
    console.log('📊 Categorization results:');
    console.log('👕 Tops:', categorized.tops.length, categorized.tops.map(t => t.name));
    console.log('👖 Bottoms:', categorized.bottoms.length, categorized.bottoms.map(b => b.name));
    console.log('👗 Dresses:', categorized.dresses.length);
    console.log('🏖️ Beachwear:', categorized.beachwear.length);
    
    // Fallback: If we don't have enough bottoms, try to find them differently
    if (categorized.bottoms.length === 0) {
      console.log('⚠️ No bottoms found, trying fallback categorization...');
      categorized.bottoms = items.filter(item => {
        const itemText = `${item.category || ''} ${item.name || ''}`.toLowerCase();
        return (
          !categorized.tops.some(top => top.id === item.id) && // Not already a top
          !categorized.dresses.some(dress => dress.id === item.id) && // Not a dress
          (
            itemText.includes('coast') ||
            itemText.includes('pant') ||
            itemText.includes('short') ||
            itemText.includes('skirt') ||
            itemText.includes('bottom') ||
            // Look for items that could be bottoms by brand and type
            (item.brand?.toLowerCase().includes('alo') && !itemText.includes('bra') && !itemText.includes('top'))
          )
        );
      });
      console.log('🔄 Fallback bottoms found:', categorized.bottoms.length, categorized.bottoms.map(b => b.name));
    }

    const outfits = [];

    // Smart gym outfit logic - brand-based mapping
    if (lowerPrompt.includes('gym') || lowerPrompt.includes('workout') || lowerPrompt.includes('exercise')) {
      // Filter gym items using brand intelligence
      const gymItems = items.filter(item => {
        const brand = (item.brand || '').toLowerCase();
        const occasions = (item.occasions || []).map(occ => occ.toLowerCase());
        const name = (item.name || '').toLowerCase();
        
        // Gymshark = gym focused, Alo Yoga = also great for gym
        const isGymBrand = brand.includes('gymshark') || brand.includes('alo yoga') || brand.includes('alo');
        
        // Also check occasion tags and keywords
        const hasGymOccasion = occasions.some(occ => 
          occ.includes('gym') || occ.includes('workout') || occ.includes('exercise')
        ) || name.includes('sport') || name.includes('athletic') || name.includes('workout');
        
        return isGymBrand || hasGymOccasion;
      });
      
      const gymTops = gymItems.filter(item => categorized.tops.some(top => top.id === item.id));
      const gymBottoms = gymItems.filter(item => categorized.bottoms.some(bottom => bottom.id === item.id));

      console.log(`🏋️‍♀️ Smart gym pairing: ${gymTops.length} tops, ${gymBottoms.length} bottoms (brand-based)`);
      
      // Smart pairing algorithm
      if (gymTops.length > 0 && gymBottoms.length > 0) {
        const smartPairs = [];
        
        gymTops.forEach(top => {
          gymBottoms.forEach(bottom => {
            if (top.id !== bottom.id) {
              let score = 0;
              const topBrand = (top.brand || '').toLowerCase();
              const bottomBrand = (bottom.brand || '').toLowerCase();
              
              // Same brand bonus (Alo + Alo = perfect gym set)
              if (topBrand && bottomBrand && topBrand === bottomBrand) {
                score += 40;
              }
              
              // Athletic brand compatibility
              if (gymBrands.some(b => topBrand.includes(b)) && gymBrands.some(b => bottomBrand.includes(b))) {
                score += 25;
              }
              
              // Color coordination
              const topColors = (top.colors || []).map(c => c.toLowerCase());
              const bottomColors = (bottom.colors || []).map(c => c.toLowerCase());
              const hasMatchingColors = topColors.some(tc => bottomColors.includes(tc));
              if (hasMatchingColors) score += 20;
              
              // Neutral color bonus (gym essentials)
              const neutrals = ['black', 'white', 'gray', 'grey'];
              const topHasNeutral = topColors.some(c => neutrals.includes(c));
              const bottomHasNeutral = bottomColors.some(c => neutrals.includes(c));
              if (topHasNeutral || bottomHasNeutral) score += 15;
              
              // Style consistency (sports bra + leggings = classic)
              const topName = (top.name || '').toLowerCase();
              const bottomName = (bottom.name || '').toLowerCase();
              if (topName.includes('bra') && bottomName.includes('legging')) score += 30;
              
              smartPairs.push({ 
                top, 
                bottom, 
                score, 
                topBrand: topBrand.includes('gymshark') ? 'Gymshark' : 
                         topBrand.includes('alo') ? 'Alo Yoga' : 
                         topBrand.includes('vuori') ? 'Vuori' : 'Athletic',
                bottomBrand: bottomBrand.includes('gymshark') ? 'Gymshark' : 
                            bottomBrand.includes('alo') ? 'Alo Yoga' : 
                            bottomBrand.includes('vuori') ? 'Vuori' : 'Athletic'
              });
            }
          });
        });
        
        // Sort by score and create best outfits
        smartPairs
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .forEach((pair, i) => {
            outfits.push({
              id: `gym_smart_${i}`,
              name: pair.topBrand === pair.bottomBrand && pair.topBrand !== 'Athletic' ? 
                    `${pair.topBrand} Set` : 'Gym Ready',
              description: 'Perfect workout combo',
              items: [pair.top, pair.bottom],
              occasion: 'Gym',
              confidence: Math.min(95, 70 + Math.round(pair.score / 2)),
              icon: 'GYM'
            });
          });
      }
    }

    // Smart yoga outfit logic - brand-based mapping
    if (lowerPrompt.includes('yoga') || lowerPrompt.includes('studio') || lowerPrompt.includes('meditation')) {
      // Filter for yoga items using brand intelligence + occasion tags
      const yogaItems = items.filter(item => {
        const occasions = (item.occasions || []).map(occ => occ.toLowerCase());
        const brand = (item.brand || '').toLowerCase();
        
        // Alo Yoga brand = yoga appropriate (majority of their items)
        const isYogaBrand = brand.includes('alo yoga') || brand.includes('alo');
        
        // Also check occasion tags for other brands
        const hasYogaOccasion = occasions.some(occ => 
          occ.includes('yoga') || occ.includes('studio') || occ.includes('meditation')
        );
        
        return isYogaBrand || hasYogaOccasion;
      });
      
      console.log(`🧘‍♀️ Found ${yogaItems.length} yoga items (brand-based + occasion tags)`);
      
      const yogaTops = yogaItems.filter(item => categorized.tops.some(top => top.id === item.id));
      const yogaBottoms = yogaItems.filter(item => categorized.bottoms.some(bottom => bottom.id === item.id));

      // Smart yoga pairing algorithm
      if (yogaTops.length > 0 && yogaBottoms.length > 0) {
        const yogaPairs = [];
        
        yogaTops.forEach(top => {
          yogaBottoms.forEach(bottom => {
            if (top.id !== bottom.id) {
              let score = 30; // Base score for yoga items
              const topBrand = (top.brand || '').toLowerCase();
              const bottomBrand = (bottom.brand || '').toLowerCase();
              
              // Same brand bonus (Alo Yoga sets are perfect for yoga)
              if (topBrand && bottomBrand && topBrand === bottomBrand) {
                score += 40;
              }
              
              // Yoga brand recognition
              const yogaBrands = ['alo', 'lululemon', 'beyond yoga'];
              if (yogaBrands.some(b => topBrand.includes(b)) && yogaBrands.some(b => bottomBrand.includes(b))) {
                score += 25;
              }
              
              // Color coordination for yoga
              const topColors = (top.colors || []).map(c => c.toLowerCase());
              const bottomColors = (bottom.colors || []).map(c => c.toLowerCase());
              const hasMatchingColors = topColors.some(tc => bottomColors.includes(tc));
              if (hasMatchingColors) score += 20;
              
              // Neutral yoga colors (flow better in practice)
              const yogaColors = ['black', 'white', 'gray', 'navy', 'sage', 'beige'];
              const topYogaColor = topColors.some(c => yogaColors.includes(c));
              const bottomYogaColor = bottomColors.some(c => yogaColors.includes(c));
              if (topYogaColor || bottomYogaColor) score += 15;
              
              // Yoga-appropriate style (flexible, breathable)
              const topName = (top.name || '').toLowerCase();
              const bottomName = (bottom.name || '').toLowerCase();
              if (topName.includes('tank') && bottomName.includes('legging')) score += 25;
              if (topName.includes('bra') && bottomName.includes('high-waist')) score += 20;
              
              yogaPairs.push({ 
                top, 
                bottom, 
                score, 
                topBrand: topBrand.includes('alo') ? 'Alo Yoga' : 
                         topBrand.includes('lululemon') ? 'Lululemon' : 'Yoga',
                bottomBrand: bottomBrand.includes('alo') ? 'Alo Yoga' : 
                            bottomBrand.includes('lululemon') ? 'Lululemon' : 'Yoga'
              });
            }
          });
        });
        
        // Sort by score and create best yoga outfits
        yogaPairs
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .forEach((pair, i) => {
            outfits.push({
              id: `yoga_smart_${i}`,
              name: pair.topBrand === pair.bottomBrand && pair.topBrand !== 'Yoga' ? 
                    `${pair.topBrand} Flow` : 'Yoga Flow',
              description: 'Perfect for your practice',
              items: [pair.top, pair.bottom],
              occasion: 'Yoga',
              confidence: Math.min(95, 60 + Math.round(pair.score)),
              icon: 'YOGA'
            });
          });
      }

      // Also include single yoga dresses/jumpsuits if available
      const yogaDresses = yogaItems.filter(item => categorized.dresses.some(dress => dress.id === item.id));
      yogaDresses.slice(0, 2).forEach((dress, i) => {
        outfits.push({
          id: `yoga_dress_${i}`,
          name: 'Yoga Dress',
          description: 'Flowing movement',
          items: [dress],
          occasion: 'Yoga',
          confidence: 88,
          icon: 'YOGA'
        });
      });
    }

    // Smart work outfit logic using occasion data
    if (lowerPrompt.includes('work') || lowerPrompt.includes('office') || lowerPrompt.includes('professional')) {
      // Filter items by their actual occasion tags from dataset
      const workItems = items.filter(item => {
        const occasions = (item.occasions || []).map(occ => occ.toLowerCase());
        return occasions.some(occ => 
          occ.includes('work') || occ.includes('office') || occ.includes('professional') || 
          occ.includes('business') || occ.includes('meeting') || occ.includes('formal')
        );
      });
      
      console.log(`💼 Found ${workItems.length} work-appropriate items by occasion tags`);
      
      const workTops = workItems.filter(item => categorized.tops.some(top => top.id === item.id));
      const workBottoms = workItems.filter(item => categorized.bottoms.some(bottom => bottom.id === item.id));
      const workDresses = workItems.filter(item => categorized.dresses.some(dress => dress.id === item.id));

      // Smart work pairing
      if (workTops.length > 0 && workBottoms.length > 0) {
        const workPairs = [];
        
        workTops.forEach(top => {
          workBottoms.forEach(bottom => {
            if (top.id !== bottom.id) {
              let score = 20; // Base score for work items
              
              // Same brand professional bonus
              if (top.brand === bottom.brand) score += 25;
              
              // Color professionalism bonus
              const professionalColors = ['black', 'white', 'navy', 'gray', 'beige', 'cream'];
              const topColors = (top.colors || []).map(c => c.toLowerCase());
              const bottomColors = (bottom.colors || []).map(c => c.toLowerCase());
              
              const topProfessional = topColors.some(c => professionalColors.includes(c));
              const bottomProfessional = bottomColors.some(c => professionalColors.includes(c));
              if (topProfessional && bottomProfessional) score += 30;
              
              // Color coordination
              const hasMatchingColors = topColors.some(tc => bottomColors.includes(tc));
              if (hasMatchingColors) score += 20;
              
              workPairs.push({ top, bottom, score });
            }
          });
        });
        
        workPairs
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .forEach((pair, i) => {
            outfits.push({
              id: `work_smart_${i}`,
              name: 'Office Chic',
              description: 'Professional and polished',
              items: [pair.top, pair.bottom],
              occasion: 'Work',
              confidence: Math.min(95, 60 + Math.round(pair.score)),
              icon: 'WORK'
            });
          });
      }

      // Work dresses with occasion validation
      workDresses.forEach((dress, i) => {
        outfits.push({
          id: `work_dress_${i}`,
          name: 'Work Dress',
          description: 'Effortlessly professional',
          items: [dress],
          occasion: 'Work',
          confidence: 92,
          icon: 'DRESS'
        });
      });
    }

    // Smart date night logic - focus on dresses and elegant pieces
    if (lowerPrompt.includes('date') || lowerPrompt.includes('romantic') || lowerPrompt.includes('dinner')) {
      // First priority: Items specifically tagged for dates
      const specificDateItems = items.filter(item => {
        const occasions = (item.occasions || []).map(occ => occ.toLowerCase());
        return occasions.some(occ => 
          occ.includes('date') || occ.includes('romantic') || occ.includes('dinner') || 
          occ.includes('evening') || occ.includes('cocktail') || occ.includes('party')
        );
      });
      
      // Second priority: Elegant non-athletic items (exclude gym/sports wear)
      const elegantItems = items.filter(item => {
        const occasions = (item.occasions || []).map(occ => occ.toLowerCase());
        const name = (item.name || '').toLowerCase();
        
        // Exclude athletic/gym items completely
        const isAthletic = occasions.some(occ => 
          occ.includes('gym') || occ.includes('studio') || occ.includes('yoga') || 
          occ.includes('running') || occ.includes('workout')
        ) || name.includes('bra') || name.includes('legging') || name.includes('sport');
        
        // Include versatile, elegant items
        const isElegant = occasions.some(occ => 
          occ.includes('versatile') || occ.includes('lounge')
        ) || name.includes('dress') || name.includes('blouse') || name.includes('trouser');
        
        return !isAthletic && isElegant;
      });
      
      const allDateItems = [...specificDateItems, ...elegantItems];
      console.log(`💕 Found ${specificDateItems.length} specific date items, ${elegantItems.length} elegant items`);
      
      const dateDresses = allDateItems.filter(item => categorized.dresses.some(dress => dress.id === item.id));
      const dateTops = allDateItems.filter(item => {
        const top = categorized.tops.find(t => t.id === item.id);
        if (!top) return false;
        
        // Exclude sports bras and athletic tops
        const name = (top.name || '').toLowerCase();
        return !name.includes('bra') && !name.includes('sport') && !name.includes('tank');
      });
      const dateBottoms = allDateItems.filter(item => {
        const bottom = categorized.bottoms.find(b => b.id === item.id);
        if (!bottom) return false;
        
        // Exclude leggings and athletic bottoms, prefer trousers/pants
        const name = (bottom.name || '').toLowerCase();
        return !name.includes('legging') && !name.includes('short') && 
               (name.includes('trouser') || name.includes('pant') || name.includes('skirt'));
      });

      // Prioritize dresses for date nights
      dateDresses.slice(0, 3).forEach((dress, i) => {
        outfits.push({
          id: `date_dress_${i}`,
          name: 'Date Night Glam',
          description: 'Romantic and stunning',
          items: [dress],
          occasion: 'Date',
          confidence: 94,
          icon: 'DATE'
        });
      });

      // Smart elegant combinations - ONLY if we have appropriate pieces
      if (dateTops.length > 0 && dateBottoms.length > 0) {
        const datePairs = [];
        
        dateTops.slice(0, 3).forEach(top => {
          dateBottoms.slice(0, 3).forEach(bottom => {
            if (top.id !== bottom.id) {
              let score = 30; // Higher base score for curated elegant items
              
              // Elegant color bonus
              const elegantColors = ['black', 'white', 'navy', 'burgundy', 'emerald'];
              const topColors = (top.colors || []).map(c => c.toLowerCase());
              const bottomColors = (bottom.colors || []).map(c => c.toLowerCase());
              
              const topElegant = topColors.some(c => elegantColors.includes(c));
              const bottomElegant = bottomColors.some(c => elegantColors.includes(c));
              if (topElegant && bottomElegant) score += 30;
              
              // Classic elegant combinations
              if (topColors.includes('black') && bottomColors.includes('black')) score += 35;
              if ((topColors.includes('white') && bottomColors.includes('black')) ||
                  (topColors.includes('black') && bottomColors.includes('white'))) score += 25;
              
              // Same brand elegance bonus
              if (top.brand === bottom.brand) score += 20;
              
              datePairs.push({ top, bottom, score });
            }
          });
        });
        
        // Only show high-scoring elegant combinations
        datePairs
          .filter(pair => pair.score >= 50) // High threshold for date outfits
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .forEach((pair, i) => {
            outfits.push({
              id: `date_smart_${i}`,
              name: 'Elegant Evening',
              description: 'Sophisticated and chic',
              items: [pair.top, pair.bottom],
              occasion: 'Date',
              confidence: Math.min(95, 60 + Math.round(pair.score)),
              icon: 'DATE'
            });
          });
      }
    }

    if (lowerPrompt.includes('casual') || lowerPrompt.includes('weekend') || lowerPrompt.includes('relax')) {
      // Smart casual item recognition using brand intelligence + item types
      const casualItems = items.filter(item => {
        const occasions = (item.occasions || []).map(occ => occ.toLowerCase());
        const name = (item.name || '').toLowerCase();
        const brand = (item.brand || '').toLowerCase();
        
        // Occasion tags
        const hasCasualOccasion = occasions.some(occ => 
          occ.includes('casual') || occ.includes('weekend') || occ.includes('lounge') || 
          occ.includes('streetwear') || occ.includes('versatile')
        );
        
        // Item type recognition - graphic tees, tank tops, casual pieces
        const isCasualType = name.includes('tee') || name.includes('tank') || 
                            name.includes('graphic') || name.includes('crew') || 
                            name.includes('hoodie') || name.includes('sweat') ||
                            name.includes('jogger') || name.includes('casual') ||
                            name.includes('pullover');
        
        // Exclude athletic/gym brands for casual (they go to gym/yoga)
        const isNotAthleticBrand = !brand.includes('gymshark') && 
                                  !(brand.includes('alo') && occasions.some(occ => 
                                     occ.includes('gym') || occ.includes('yoga')));
        
        return (hasCasualOccasion || isCasualType) && isNotAthleticBrand;
      });
      
      console.log(`😎 Found ${casualItems.length} casual items (brand-based + item types)`);
      
      const casualTops = casualItems.filter(item => categorized.tops.some(top => top.id === item.id));
      const casualBottoms = casualItems.filter(item => categorized.bottoms.some(bottom => bottom.id === item.id));

      if (casualTops.length > 0 && casualBottoms.length > 0) {
        casualTops.slice(0, 3).forEach((top, i) => {
          casualBottoms.slice(0, 2).forEach((bottom, j) => {
            if (outfits.length < 6 && top.id !== bottom.id) {
              outfits.push({
                id: `casual_${i}_${j}`,
                name: 'Weekend Vibes',
                description: 'Comfortable and stylish',
                items: [top, bottom],
                occasion: 'Casual',
                confidence: 85,
                icon: '😎'
              });
            }
          });
        });
      }
    }

    if (lowerPrompt.includes('lounge')) {
      const loungeItems = getItemsForOccasions(['lounge', 'relax', 'comfort']);
      console.log(`😴 Found ${loungeItems.length} lounge items`);
      
      const loungeTops = loungeItems.filter(item => categorized.tops.some(top => top.id === item.id));
      const loungeBottoms = loungeItems.filter(item => categorized.bottoms.some(bottom => bottom.id === item.id));

      if (loungeTops.length > 0 && loungeBottoms.length > 0) {
        loungeTops.slice(0, 2).forEach((top, i) => {
          loungeBottoms.slice(0, 2).forEach((bottom, j) => {
            if (top.id !== bottom.id) {
              outfits.push({
                id: `lounge_${i}_${j}`,
                name: 'Lounge Life',
                description: 'Ultimate comfort and relaxation',
                items: [top, bottom],
                occasion: 'Lounge',
                confidence: 88,
                icon: '😴'
              });
            }
          });
        });
      }
    }

    if (lowerPrompt.includes('party') || lowerPrompt.includes('night out') || lowerPrompt.includes('club')) {
      // Party outfits - bold and trendy
      const partyDresses = categorized.dresses.slice(0, 2);
      partyDresses.forEach((dress, i) => {
        outfits.push({
          id: `party_dress_${i}`,
          name: 'Party Perfect',
          description: 'Ready to dance the night away',
          items: [dress],
          occasion: 'Party',
          confidence: 94,
          icon: '🎉'
        });
      });
    }

    if (lowerPrompt.includes('beach') || lowerPrompt.includes('vacation') || lowerPrompt.includes('summer') || lowerPrompt.includes('pool')) {
      const beachItems = getItemsForOccasions(['beach', 'vacation', 'summer', 'pool', 'swimwear']);
      console.log(`🏖️ Found ${beachItems.length} beach items`);
      
      const beachTops = beachItems.filter(item => categorized.tops.some(top => top.id === item.id));
      const beachBottoms = beachItems.filter(item => categorized.bottoms.some(bottom => bottom.id === item.id));
      const beachDresses = beachItems.filter(item => categorized.dresses.some(dress => dress.id === item.id));

      // Single piece items (bikinis, swimsuits, dresses)
      beachDresses.slice(0, 2).forEach((dress, i) => {
        outfits.push({
          id: `beach_dress_${i}`,
          name: 'Beach Goddess',
          description: 'Perfect for seaside strolls',
          items: [dress],
          occasion: 'Beach',
          confidence: 92,
          icon: '🌺'
        });
      });

      // Combinations for beach casual
      if (beachTops.length > 0 && beachBottoms.length > 0) {
        beachTops.slice(0, 2).forEach((top, i) => {
          beachBottoms.slice(0, 2).forEach((bottom, j) => {
            if (top.id !== bottom.id && outfits.filter(o => o.occasion === 'Beach').length < 6) {
              outfits.push({
                id: `beach_combo_${i}_${j}`,
                name: 'Beach Casual',
                description: 'Comfortable and breezy',
                items: [top, bottom],
                occasion: 'Beach',
                confidence: 88,
                icon: '🌊'
              });
            }
          });
        });
      }
    }

    // If no specific outfits generated, create general combinations
    if (outfits.length === 0) {
      categorized.tops.slice(0, 3).forEach((top, i) => {
        categorized.bottoms.slice(0, 3).forEach((bottom, j) => {
          // Ensure we don't pair the same item with itself
          if (top.id !== bottom.id && outfits.length < 6) {
            outfits.push({
              id: `general_${i}_${j}`,
              name: 'Perfect Match',
              description: 'Great combination for any occasion',
              items: [top, bottom],
              occasion: 'General',
              confidence: 80,
              icon: '👌'
            });
          }
        });
      });

      categorized.dresses.slice(0, 2).forEach((dress, i) => {
        outfits.push({
          id: `general_dress_${i}`,
          name: 'Dress Up',
          description: 'Always a good choice',
          items: [dress],
          occasion: 'General',
          confidence: 82,
          icon: 'DRESS'
        });
      });
    }

    // Sort by confidence and return top 6
    return outfits
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateOutfits(prompt);
  };

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
    generateOutfits(suggestion);
  };

  if (!isVisible) return null;

  return (
    <div className="outfit-generator-overlay">
      <div className="outfit-generator-container">
        <div className="outfit-generator-header">
          <div className="header-content">
            <div className="header-icon">✨</div>
            <div className="header-text">
              <h2>AI OUTFIT GENERATOR</h2>
              <p>Smart styling powered by AI</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="outfit-generator-content">
          {!isGenerating && generatedOutfits.length === 0 && (
            <div className="prompt-section">
              <div className="intro">
                <div className="intro-icon">👗</div>
                <h3>Create outfits from your wardrobe!</h3>
                <p>Tell me the occasion and I'll mix and match items from your <span className="highlight">{favorites.length} saved pieces</span>.</p>
              </div>

              <form onSubmit={handleSubmit} className="prompt-form">
                <div className="input-group">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., for gym, for work, for date night..."
                    className="prompt-input"
                  />
                  <button 
                    type="submit" 
                    className="generate-btn"
                    disabled={!prompt.trim() || favorites.length < 2}
                  >
                    GENERATE
                  </button>
                </div>
              </form>

              <div className="suggestions">
                <div className="suggestions-header">
                  <span className="suggestions-icon">💡</span>
                  <p>Quick suggestions:</p>
                </div>
                <div className="suggestion-chips">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-chip"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {favorites.length < 2 && (
                <div className="insufficient-items">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-content">
                    <h4>Need More Items</h4>
                    <p>Add more items to your wardrobe to generate better outfits!</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {isGenerating && (
            <div className="generating-section">
              <div className="generating-animation">
                <div className="ai-spinner">
                  <div className="spinner-ring"></div>
                  <div className="spinner-core">🤖</div>
                </div>
                <h3>AI Building Outfits</h3>
                <p>Analyzing your style preferences...</p>
                <div className="generating-steps">
                  <span className="step active">Analyzing wardrobe</span>
                  <span className="step active">Matching colors</span>
                  <span className="step">Creating combinations</span>
                </div>
              </div>
            </div>
          )}

          {generatedOutfits.length > 0 && (
            <div className="outfits-section">
              <div className="outfits-header">
                <h3>GENERATED OUTFITS {prompt && `"${prompt}"`}</h3>
                <button 
                  className="new-prompt-btn"
                  onClick={() => {
                    setGeneratedOutfits([]);
                    setPrompt('');
                  }}
                >
                  NEW PROMPT
                </button>
              </div>

              <div className="outfits-grid">
                {generatedOutfits.map(outfit => (
                  <div key={outfit.id} className={`outfit-card ${outfit.occasion.toLowerCase()}-theme`}>
                    <div className="outfit-header">
                      <span className="outfit-icon">{outfit.icon}</span>
                      <div className="outfit-info">
                        <h4>{outfit.name}</h4>
                        <p><strong>{outfit.description}</strong></p>
                      </div>
                      <div className="confidence-score">
                        {outfit.confidence}%
                      </div>
                    </div>

                    <div className={`outfit-showcase ${outfit.items.length > 1 ? 'combo-showcase' : 'single-showcase'}`}>
                      {outfit.items.length === 1 ? (
                        // Single item - hero display
                        <div className="hero-item">
                          <div className="hero-image-wrapper">
                            <div className="hero-image-container">
                              <img 
                                src={outfit.items[0].imageUrl || outfit.items[0].image_url || outfit.items[0].image} 
                                alt={outfit.items[0].name}
                                loading="lazy"
                                onError={(e) => {
                                  const isBeach = outfit.occasion === 'Beach';
                                  const isGym = outfit.occasion === 'Gym';
                                  const bgColor = isBeach ? '3498db' : isGym ? 'e74c3c' : '667eea';
                                  const icon = isBeach ? 'BEACH' : isGym ? 'GYM' : 'OUTFIT';
                                  e.target.src = `https://via.placeholder.com/300x360/${bgColor}/ffffff?text=${icon}`;
                                }}
                                className="hero-image"
                              />
                              <div className="hero-overlay">
                                <div className="hero-badge">{outfit.items[0].brand}</div>
                              </div>
                            </div>
                            <div className="hero-info">
                              <h4 className="hero-name">{outfit.items[0].name}</h4>
                              <div className="hero-price">${outfit.items[0].price}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Combination - side by side showcase
                        <div className="combo-display">
                          {outfit.items.map((item, index) => (
                            <React.Fragment key={item.id}>
                              <div className={`combo-item ${index === 0 ? 'top-item' : 'bottom-item'}`}>
                                <div className="combo-card">
                                  <div className="combo-image-wrapper">
                                    <img 
                                      src={item.imageUrl || item.image_url || item.image} 
                                      alt={item.name}
                                      loading="lazy"
                                      onError={(e) => {
                                        const isBeach = outfit.occasion === 'Beach';
                                        const isGym = outfit.occasion === 'Gym';
                                        const bgColor = isBeach ? '3498db' : isGym ? 'e74c3c' : '667eea';
                                        const icon = isBeach ? 'BEACH' : isGym ? 'GYM' : 'OUTFIT';
                                        e.target.src = `https://via.placeholder.com/220x280/${bgColor}/ffffff?text=${icon}`;
                                      }}
                                      className="combo-image"
                                    />
                                    <div className="combo-type-tag">
                                      {index === 0 ? 'TOP' : 'BOTTOM'}
                                    </div>
                                  </div>
                                  <div className="combo-details">
                                    <div className="combo-brand">{item.brand}</div>
                                    <div className="combo-name">{item.name}</div>
                                    <div className="combo-price">${item.price}</div>
                                  </div>
                                </div>
                              </div>
                              {index === 0 && outfit.items.length > 1 && (
                                <div className="combo-connector">
                                  <div className="connector-plus">+</div>
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutfitGenerator;