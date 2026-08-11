import React, { useState, useEffect } from 'react';

const AnimatedBackground = ({ children }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Forcer le chargement de la vidéo
    const video = document.querySelector('video');
    if (video) {
      video.load();
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fond de secours */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FFF5EE 0%, #FFE8D6 40%, #FFDCC8 70%, #FFF0E6 100%)',
        }}
      />

      {/* VIDÉO EN ARRIÈRE-PLAN */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ 
          opacity: videoLoaded ? 0.35 : 0,
          transition: 'opacity 1s ease-in-out'
        }}
        onLoadedData={() => setVideoLoaded(true)}
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>

      {/* Image de fond si la vidéo ne charge pas */}
      {!videoLoaded && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2
          }}
        />
      )}

      {/* IMAGE À DROITE - Personnes dans un restaurant */}
      <div 
        className="absolute right-0 top-0 h-full pointer-events-none"
        style={{
          width: '50%',
          backgroundImage:'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=800&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
        }}
      />

      

      {/* Overlay pour adoucir */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none" />

      {/* Scène de restaurant */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.4 }}>
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Table */}
          <rect x="340" y="380" width="520" height="80" rx="10" fill="#C4A080" opacity="0.6" />
          <rect x="360" y="390" width="480" height="20" rx="5" fill="#F5F0EB" opacity="0.6" />

          {/* Personnages simplifiés */}
          <rect x="275" y="360" width="45" height="60" rx="12" fill="#D4A574" opacity="0.7" />
          <circle cx="297" cy="338" r="32" fill="#E8C9A0" opacity="0.7" />
          <ellipse cx="297" cy="325" rx="28" ry="16" fill="#5C4033" opacity="0.6" />

          <rect x="880" y="360" width="40" height="55" rx="12" fill="#D4A574" opacity="0.7" />
          <circle cx="900" cy="338" r="30" fill="#E8C9A0" opacity="0.7" />
          <ellipse cx="900" cy="325" rx="24" ry="18" fill="#8B4513" opacity="0.6" />

          <rect x="560" y="350" width="70" height="65" rx="15" fill="#D4A574" opacity="0.7" />
          <circle cx="595" cy="322" r="36" fill="#E8C9A0" opacity="0.7" />
          <ellipse cx="595" cy="308" rx="32" ry="20" fill="#3D2B1F" opacity="0.6" />

          {/* Lumières */}
          <circle cx="300" cy="155" r="15" fill="#FFD700" opacity="0.4" />
          <circle cx="600" cy="155" r="15" fill="#FFD700" opacity="0.4" />
          <circle cx="900" cy="155" r="15" fill="#FFD700" opacity="0.4" />

          {/* Particules */}
          {[...Array(15)].map((_, i) => (
            <circle
              key={i}
              cx={100 + Math.random() * 1000}
              cy={100 + Math.random() * 600}
              r={2 + Math.random() * 3}
              fill="#FFD700"
              opacity={0.1 + Math.random() * 0.1}
            />
          ))}
        </svg>
      </div>

      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;