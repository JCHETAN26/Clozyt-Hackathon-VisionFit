import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import './VirtualTryOn.css';

const VirtualTryOn = ({ item, onClose, isVisible }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pose, setPose] = useState(null);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    if (isVisible) {
      initializePoseDetection();
    }
  }, [isVisible]);

  const initializePoseDetection = async () => {
    try {
      console.log('🎯 Initializing AR Virtual Try-On...');
      
      // Simulate AI pose detection initialization
      setTimeout(() => {
        setIsLoading(false);
        console.log('✅ AR Try-On ready!');
      }, 2000);
      
    } catch (error) {
      console.error('❌ AR initialization failed:', error);
      setIsLoading(false);
    }
  };

  const captureAndAnalyze = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      analyzeFit(imageSrc);
    }
  };

  const analyzeFit = (imageSrc) => {
    // Simulate AI fit analysis
    const mockConfidence = Math.random() * 0.4 + 0.6; // 60-100%
    setConfidence(mockConfidence);
    
    console.log(`🎯 Fit Analysis: ${Math.round(mockConfidence * 100)}% confidence`);
  };

  const getGarmentOverlay = () => {
    if (!item || !pose) return null;
    
    // Simulate garment positioning based on pose
    return {
      position: 'absolute',
      top: '20%',
      left: '25%',
      width: '50%',
      height: '60%',
      opacity: 0.8,
      mixBlendMode: 'multiply'
    };
  };

  if (!isVisible) return null;

  return (
    <div className="virtual-tryon-overlay">
      <div className="tryon-container">
        <div className="tryon-header">
          <h3>🪞 Virtual Try-On</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tryon-content">
          {isLoading ? (
            <div className="tryon-loading">
              <div className="loading-spinner">🎯</div>
              <p>Initializing AR Camera...</p>
              <div className="loading-steps">
                <div className="step">📹 Accessing camera</div>
                <div className="step">🧠 Loading AI models</div>
                <div className="step">👤 Calibrating pose detection</div>
              </div>
            </div>
          ) : (
            <div className="camera-container">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="webcam-feed"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
                onUserMedia={() => console.log('📹 Camera ready')}
                onUserMediaError={(error) => console.error('Camera error:', error)}
              />
              
              {/* Virtual Garment Overlay */}
              {item && (
                <div className="garment-overlay" style={getGarmentOverlay()}>
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="virtual-garment"
                  />
                </div>
              )}

              {/* AR Controls */}
              <div className="ar-controls">
                <div className="fit-analysis">
                  <div className="confidence-meter">
                    <div className="confidence-label">Fit Confidence</div>
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill"
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <div className="confidence-text">{Math.round(confidence * 100)}%</div>
                  </div>
                </div>

                <div className="tryon-actions">
                  <button className="capture-btn" onClick={captureAndAnalyze}>
                    📸 Analyze Fit
                  </button>
                  <button className="share-btn">
                    📤 Share Look
                  </button>
                </div>
              </div>

              {/* Size Recommendation */}
              <div className="size-recommendation">
                <h4>📏 AI Size Recommendation</h4>
                <div className="size-grid">
                  <div className="size-option recommended">
                    <span className="size">M</span>
                    <span className="confidence">95%</span>
                  </div>
                  <div className="size-option">
                    <span className="size">L</span>
                    <span className="confidence">78%</span>
                  </div>
                  <div className="size-option">
                    <span className="size">S</span>
                    <span className="confidence">45%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="tryon-footer">
          <div className="tips">
            💡 <strong>Tips:</strong> Stand 3ft from camera, good lighting, arms at sides
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;