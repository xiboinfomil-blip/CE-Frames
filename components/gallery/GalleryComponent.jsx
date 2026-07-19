import React, { useState } from 'react';
import './GalleryComponent.css';

const GalleryComponent = ({ images = [], onModify, onManage }) => {
  // Limit to top 5 images as requested
  const topImages = images.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (topImages.length === 0) {
    return <div className="gallery-empty">No images available.</div>;
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % topImages.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + topImages.length) % topImages.length);

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <h2>Galleries</h2>
        <div className="gallery-actions">
          <button onClick={onModify} className="btn btn-modify" aria-label="Modify gallery">
            Modify
          </button>
          <button onClick={onManage} className="btn btn-manage" aria-label="Manage gallery">
            Manage
          </button>
        </div>
      </header>

      <div className="slider-wrapper">
        <button 
          onClick={prevSlide} 
          className="slider-arrow prev" 
          aria-label="Previous image"
        >&#10094;</button>
        
        <div className="slider-track">
          <img
            src={topImages[currentIndex].url}
            alt={topImages[currentIndex].alt || `Gallery image ${currentIndex + 1}`}
            className="slider-image"
            loading="lazy"
          />
        </div>

        <button 
          onClick={nextSlide} 
          className="slider-arrow next" 
          aria-label="Next image"
        >&#10095;</button>
      </div>

      <nav className="slider-dots" aria-label="Image navigation">
        {topImages.map((_, idx) => (
          <button
            key={idx}
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </nav>
    </div>
  );
};

export default GalleryComponent;