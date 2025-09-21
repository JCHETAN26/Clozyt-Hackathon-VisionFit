import React, { useState, useEffect } from 'react';
import './AIStyleAssistant.css';

const AIStyleAssistant = ({ onStyleRecommendation, userProfile, isVisible, onClose, generatedOutfits = [] }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (isVisible && 'webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };

      speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    }
  }, [isVisible]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    
    // Add user message to conversation
    const userMessage = { type: 'user', message: command, timestamp: Date.now() };
    setConversationHistory(prev => [...prev, userMessage]);

    // Simulate AI processing
    const response = await generateAIResponse(command, userProfile);
    
    // Add AI response to conversation
    const aiMessage = { type: 'ai', message: response.text, timestamp: Date.now() };
    setConversationHistory(prev => [...prev, aiMessage]);
    
    setAiResponse(response.text);
    setIsProcessing(false);

    // Trigger style recommendations if applicable
    if (response.recommendations) {
      onStyleRecommendation(response.recommendations);
    }

    // Text-to-speech response
    speakResponse(response.text);
  };

  const generateAIResponse = async (command, profile) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerCommand = command.toLowerCase();
    
    // Pattern matching for different types of requests
    if ((lowerCommand.includes('casual') || lowerCommand.includes('weekend')) && isOutfitRequest) {
      const casualOutfits = generatedOutfits.filter(outfit => 
        outfit.occasion === 'Casual' || outfit.name.toLowerCase().includes('casual')
      ).sort((a, b) => b.confidence - a.confidence);
      
      if (casualOutfits.length > 0) {
        const bestOutfit = casualOutfits[0];
        return {
          text: `Perfect! I found a ${bestOutfit.confidence}% confidence casual outfit: "${bestOutfit.name}" - ${bestOutfit.description}. This combo includes ${bestOutfit.items.map(item => item.name).join(' and ')}. It's exactly what you need for relaxed weekend vibes!`,
          recommendations: ['casual', 'comfort', 'weekend'],
          outfitRecommendation: bestOutfit
        };
      }
      return {
        text: "I'd love to recommend some comfortable casual pieces! Let me show you some relaxed fits perfect for weekend vibes. Try generating some casual outfits first so I can pick the best one for you!",
        recommendations: ['casual', 'comfort', 'weekend']
      };
    }
    
    if (lowerCommand.includes('casual') || lowerCommand.includes('weekend')) {
      return {
        text: "I'd recommend some comfortable casual pieces! Let me show you some relaxed fits perfect for weekend vibes. Think cozy sweaters, joggers, and sneakers.",
        recommendations: ['casual', 'comfort', 'weekend']
      };
    }
    
    if ((lowerCommand.includes('work') || lowerCommand.includes('office') || lowerCommand.includes('professional')) && isOutfitRequest) {
      const workOutfits = generatedOutfits.filter(outfit => 
        outfit.occasion === 'Work' || outfit.name.toLowerCase().includes('office') || outfit.name.toLowerCase().includes('work')
      ).sort((a, b) => b.confidence - a.confidence);
      
      if (workOutfits.length > 0) {
        const bestOutfit = workOutfits[0];
        return {
          text: `Excellent choice! I found a ${bestOutfit.confidence}% confidence work outfit: "${bestOutfit.name}" - ${bestOutfit.description}. This includes ${bestOutfit.items.map(item => item.name).join(' and ')}. You'll look absolutely professional and polished!`,
          recommendations: ['professional', 'work', 'formal'],
          outfitRecommendation: bestOutfit
        };
      }
      return {
        text: "For a professional look, I'm thinking blazers, tailored pants, and classic button-downs. Generate some work outfits first and I'll pick the highest-rated one for you!",
        recommendations: ['professional', 'work', 'formal']
      };
    }
    
    if (lowerCommand.includes('work') || lowerCommand.includes('office') || lowerCommand.includes('professional')) {
      return {
        text: "For a professional look, I'm thinking blazers, tailored pants, and classic button-downs. Let me find some sophisticated pieces that'll make you look amazing at work!",
        recommendations: ['professional', 'work', 'formal']
      };
    }
    
    // Check if user is asking for outfit recommendations
    const isOutfitRequest = (
      lowerCommand.includes('outfit') || 
      lowerCommand.includes('what should i wear') ||
      lowerCommand.includes('recommend') ||
      lowerCommand.includes('suggest') ||
      lowerCommand.includes('pull me') ||
      lowerCommand.includes('give me')
    );

    if ((lowerCommand.includes('date') || lowerCommand.includes('dinner') || lowerCommand.includes('romantic')) && isOutfitRequest) {
      const dateOutfits = generatedOutfits.filter(outfit => 
        outfit.occasion === 'Date' || outfit.name.toLowerCase().includes('date') || outfit.name.toLowerCase().includes('glam')
      ).sort((a, b) => b.confidence - a.confidence);
      
      if (dateOutfits.length > 0) {
        const bestOutfit = dateOutfits[0];
        return {
          text: `Oh my! I found the perfect ${bestOutfit.confidence}% confidence date night outfit: "${bestOutfit.name}" - ${bestOutfit.description}. You'll be wearing ${bestOutfit.items.map(item => item.name).join(' and ')}. You'll look absolutely stunning and romantic!`,
          recommendations: ['date', 'elegant', 'romantic'],
          outfitRecommendation: bestOutfit
        };
      }
      return {
        text: "Ooh, date night! Let's go for something that's elegant but shows your personality. Generate some date outfits first and I'll recommend the highest-scoring one!",
        recommendations: ['date', 'elegant', 'romantic']
      };
    }
    
    if (lowerCommand.includes('date') || lowerCommand.includes('dinner') || lowerCommand.includes('romantic')) {
      return {
        text: "Ooh, date night! Let's go for something that's elegant but shows your personality. I'm thinking a cute dress or a stylish top with great jeans. You'll look stunning!",
        recommendations: ['date', 'elegant', 'romantic']
      };
    }
    
    if ((lowerCommand.includes('gym') || lowerCommand.includes('workout') || lowerCommand.includes('exercise')) && isOutfitRequest) {
      const gymOutfits = generatedOutfits.filter(outfit => 
        outfit.occasion === 'Gym' || outfit.name.toLowerCase().includes('gym') || outfit.name.toLowerCase().includes('workout')
      ).sort((a, b) => b.confidence - a.confidence);
      
      if (gymOutfits.length > 0) {
        const bestOutfit = gymOutfits[0];
        return {
          text: `Get ready to crush your workout! I found a ${bestOutfit.confidence}% confidence gym outfit: "${bestOutfit.name}" - ${bestOutfit.description}. This includes ${bestOutfit.items.map(item => item.name).join(' and ')}. Perfect for high-performance training!`,
          recommendations: ['athletic', 'gym', 'activewear'],
          outfitRecommendation: bestOutfit
        };
      }
      return {
        text: "Time to get active! I'll find you some high-performance athletic wear that looks great and moves with you. Generate some gym outfits first and I'll pick the best one!",
        recommendations: ['athletic', 'gym', 'activewear']
      };
    }
    
    // Handle general outfit requests
    if (isOutfitRequest && generatedOutfits.length > 0) {
      // Find the highest-scoring outfit overall
      const bestOutfit = generatedOutfits.sort((a, b) => b.confidence - a.confidence)[0];
      return {
        text: `I found your best outfit! With ${bestOutfit.confidence}% confidence, I recommend "${bestOutfit.name}" - ${bestOutfit.description}. This amazing combo features ${bestOutfit.items.map(item => item.name).join(' and ')}. It's perfect for ${bestOutfit.occasion || 'any occasion'}!`,
        recommendations: ['personalized', 'curated'],
        outfitRecommendation: bestOutfit
      };
    }
    
    if (isOutfitRequest) {
      return {
        text: "I'd love to recommend the perfect outfit for you! First, go to the Outfits section and generate some combinations from your favorites, then ask me again and I'll pick the highest-scoring one!",
        recommendations: ['personalized', 'curated']
      };
    }
    
    if (lowerCommand.includes('gym') || lowerCommand.includes('workout') || lowerCommand.includes('exercise')) {
      return {
        text: "Time to get active! I'll find you some high-performance athletic wear that looks great and moves with you. Moisture-wicking fabrics and supportive fits coming up!",
        recommendations: ['athletic', 'gym', 'activewear']
      };
    }
    
    if (lowerCommand.includes('summer') || lowerCommand.includes('hot') || lowerCommand.includes('beach')) {
      return {
        text: "Summer vibes! Light, breathable fabrics are key. Think flowy dresses, shorts, and tops in bright colors. Perfect for sunny days and warm weather adventures!",
        recommendations: ['summer', 'light', 'breathable']
      };
    }
    
    if (lowerCommand.includes('winter') || lowerCommand.includes('cold') || lowerCommand.includes('cozy')) {
      return {
        text: "Bundle up in style! I'll find you some warm, cozy pieces that don't sacrifice fashion for function. Layering is key - sweaters, jackets, and warm accessories!",
        recommendations: ['winter', 'warm', 'cozy']
      };
    }
    
    if (lowerCommand.includes('color') || lowerCommand.includes('bright') || lowerCommand.includes('bold')) {
      return {
        text: "I love bold choices! Let me find you some vibrant pieces that'll make you stand out. Bright colors and interesting patterns can really express your personality!",
        recommendations: ['colorful', 'bold', 'vibrant']
      };
    }

    // Default response
    return {
      text: "I heard you mention style preferences! Based on what you like, I'll curate some amazing pieces for you. Let me analyze your taste and find the perfect matches!",
      recommendations: ['personalized', 'curated']
    };
  };

  // Store the selected voice to maintain consistency
  const [selectedVoice, setSelectedVoice] = useState(null);

  // Initialize consistent voice on component mount
  useEffect(() => {
    const initializeVoice = () => {
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        
        // Priority order for female voices
        const preferredVoices = [
          'Samantha', 'Karen', 'Victoria', 'Susan', 'Zira', 'Hazel',
          'female', 'woman', 'siri female'
        ];
        
        let bestVoice = null;
        
        // Find the best available female voice
        for (const preferred of preferredVoices) {
          bestVoice = voices.find(voice => 
            voice.name.toLowerCase().includes(preferred.toLowerCase())
          );
          if (bestVoice) break;
        }
        
        // Fallback: any voice with 'en' language
        if (!bestVoice) {
          bestVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        setSelectedVoice(bestVoice);
        console.log('🎤 Selected voice:', bestVoice?.name || 'Default');
      }
    };

    // Initialize immediately if voices are ready
    if (speechSynthesis.getVoices().length > 0) {
      initializeVoice();
    } else {
      // Wait for voices to load
      speechSynthesis.addEventListener('voiceschanged', initializeVoice);
    }

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', initializeVoice);
    };
  }, []);

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Use the consistently selected voice
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const sendTextMessage = (message) => {
    if (message.trim()) {
      processVoiceCommand(message);
      setTranscript('');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="ai-assistant-overlay">
      <div className="assistant-container">
        <div className="assistant-header">
          <div className="assistant-info">
            <div className="assistant-avatar">AI</div>
            <div className="assistant-details">
              <h3>StyleBot AI</h3>
              <p className="assistant-status">
                {isListening ? 'LISTENING...' : isProcessing ? 'PROCESSING...' : 'READY TO ASSIST'}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="conversation-area">
          {conversationHistory.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-content">
                <h4>👋 Hi! I'm your AI Style Assistant</h4>
                <p>Tell me about your style needs and I'll find perfect recommendations!</p>
                <div className="example-commands">
                  <div className="command-example">"Find me casual weekend outfits"</div>
                  <div className="command-example">"What should I wear to work?"</div>
                  <div className="command-example">"I need something for a date night"</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="conversation-history">
              {conversationHistory.map((msg, index) => (
                <div key={index} className={`message ${msg.type}-message`}>
                  <div className="message-avatar">
                    {msg.type === 'user' ? 'USER' : 'AI'}
                  </div>
                  <div className="message-content">
                    <p>{msg.message}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="message ai-message processing">
                  <div className="message-avatar">AI</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="assistant-controls">
          {transcript && (
            <div className="transcript-display">
              <span className="transcript-text">{transcript}</span>
            </div>
          )}

          <div className="control-buttons">
            {!isListening ? (
              <button className="voice-btn start-listening" onClick={startListening}>
                <span className="btn-icon">MIC</span>
                <span className="btn-text">Start Voice</span>
              </button>
            ) : (
              <button className="voice-btn stop-listening" onClick={stopListening}>
                <span className="btn-icon pulse">🔴</span>
                <span className="btn-text">Stop</span>
              </button>
            )}

            <div className="text-input-container">
              <input
                type="text"
                placeholder="Or type your style question..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTextMessage(transcript)}
                className="text-input"
              />
              <button 
                className="send-btn"
                onClick={() => sendTextMessage(transcript)}
                disabled={!transcript.trim()}
              >
                SEND
              </button>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => processVoiceCommand("Recommend me the best casual outfit")}
          >
            CASUAL
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => processVoiceCommand("What's the best work outfit for me?")}
          >
            WORK
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => processVoiceCommand("Recommend the perfect date night outfit")}
          >
            DATE
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => processVoiceCommand("What's my best gym outfit?")}
          >
            GYM
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIStyleAssistant;