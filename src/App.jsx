import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import MoodJar from './pages/MoodJar';
import Journal from './pages/Journal';
import Library from './pages/Library';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import './App.css';

const COVER_COLORS = [
  { name: 'Teal Yeşil', value: '#0f5a60', gradient: 'linear-gradient(135deg, #0f5a60, #1b7d85)' },
  { name: 'Koral Turuncu', value: '#e85a4f', gradient: 'linear-gradient(135deg, #e85a4f, #f78377)' },
  { name: 'Hardal Sarı', value: '#dda15e', gradient: 'linear-gradient(135deg, #dda15e, #e9bd84)' },
  { name: 'Toz Pembe', value: '#f2afb6', gradient: 'linear-gradient(135deg, #f2afb6, #fad0d5)' },
  { name: 'Kömür Gri', value: '#4a4a4a', gradient: 'linear-gradient(135deg, #4a4a4a, #6c6c6c)' }
];

const COVER_PATTERNS = [
  { id: 'leaves', name: 'Yaprak' },
  { id: 'waves', name: 'Dalgalı' },
  { id: 'marble', name: 'Mermer' },
  { id: 'cubes', name: 'Geometrik' },
  { id: 'flowers', name: 'Çiçekli' }
];

const COVER_STICKERS = [
  '🌸', '⭐', '❤️', '🐱', '🐈', '📷', '☁️', '🎨', '🌻', '☀️', '🌙', '🌲'
];

const getOverlayBackground = (color) => {
  switch (color) {
    case '#0f5a60': return 'linear-gradient(135deg, #e3ecec 0%, #ebdcb9 100%)';
    case '#e85a4f': return 'linear-gradient(135deg, #f9eae8 0%, #ebdcb9 100%)';
    case '#dda15e': return 'linear-gradient(135deg, #f6ede2 0%, #ebdcb9 100%)';
    case '#f2afb6': return 'linear-gradient(135deg, #faedf0 0%, #ebdcb9 100%)';
    case '#4a4a4a': return 'linear-gradient(135deg, #ececec 0%, #ebdcb9 100%)';
    default: return 'linear-gradient(135deg, #f4ede4 0%, #ebdcb9 100%)';
  }
};

const IntroScreen = ({ onComplete, initialStep = 'signup' }) => {
  // Automatically ensure default user exists so cover titles and storage work cleanly
  useEffect(() => {
    if (!localStorage.getItem('journal_user')) {
      localStorage.setItem('journal_user', JSON.stringify({ name: 'Tuana', email: '' }));
    }
  }, []);

  const [step, setStep] = useState(initialStep);
  const [rememberMe, setRememberMe] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isFading, setIsFading] = useState(false);

  // Load custom cover settings
  const [coverSettings, setCoverSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('journal_cover_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.id) parsed.id = 'cover_default';
        if (parsed.patternOpacity === undefined) parsed.patternOpacity = 0.15;
        if (parsed.isGradient === undefined) parsed.isGradient = false;
        if (parsed.titleAlign === undefined) parsed.titleAlign = 'center';
        if (parsed.hasShadow === undefined) parsed.hasShadow = true;
        return parsed;
      }
      return {
        id: 'cover_default',
        color: '#0f5a60',
        pattern: 'leaves',
        patternOpacity: 0.15,
        isGradient: false,
        title: "Tuana'nın Günlüğü",
        subtitle: 'Hayaller ve Anılar',
        titleFont: 'Caveat',
        titleSize: 'medium',
        titleAlign: 'center',
        hasShadow: true,
        stickers: [
          {
            id: 'default_flower',
            emoji: '🌸',
            x: 82,
            y: 50,
            scale: 1.2
          }
        ]
      };
    } catch (e) {
      return {
        id: 'cover_default',
        color: '#0f5a60',
        pattern: 'leaves',
        patternOpacity: 0.15,
        isGradient: false,
        title: "Tuana'nın Günlüğü",
        subtitle: 'Hayaller ve Anılar',
        titleFont: 'Caveat',
        titleSize: 'medium',
        titleAlign: 'center',
        hasShadow: true,
        stickers: [
          {
            id: 'default_flower',
            emoji: '🌸',
            x: 82,
            y: 50,
            scale: 1.2
          }
        ]
      };
    }
  });

  const [libraryCovers, setLibraryCovers] = useState(() => {
    try {
      const saved = localStorage.getItem('journal_covers_library');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'cover_default',
        color: '#0f5a60',
        pattern: 'leaves',
        patternOpacity: 0.15,
        isGradient: false,
        title: "Tuana'nın Günlüğü",
        subtitle: 'Hayaller ve Anılar',
        titleFont: 'Caveat',
        titleSize: 'medium',
        titleAlign: 'center',
        hasShadow: true,
        stickers: [
          {
            id: 'default_flower',
            emoji: '🌸',
            x: 82,
            y: 50,
            scale: 1.2
          }
        ]
      }
    ];
  });

  const coverRef = useRef(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [activeSettingsCard, setActiveSettingsCard] = useState(null);
  const [selectedCoverSticker, setSelectedCoverSticker] = useState(null);

  const handleStartTransition = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  const handleSettingChange = (key, value) => {
    setCoverSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveCurrentCoverToLibrary = () => {
    const exists = libraryCovers.some(c => c.id === coverSettings.id);
    let updatedLibrary;
    if (exists) {
      updatedLibrary = libraryCovers.map(c => c.id === coverSettings.id ? { ...coverSettings } : c);
    } else {
      const newCover = {
        ...coverSettings,
        id: `cover_${Date.now()}`
      };
      updatedLibrary = [...libraryCovers, newCover];
      setCoverSettings(newCover);
    }
    setLibraryCovers(updatedLibrary);
    localStorage.setItem('journal_covers_library', JSON.stringify(updatedLibrary));
  };

  const startNewBlankCover = () => {
    setCoverSettings({
      id: `cover_new_${Date.now()}`,
      color: '#0f5a60',
      pattern: 'leaves',
      title: "Yeni Defter",
      subtitle: 'Hayaller ve Anılar',
      titleFont: 'Outfit',
      titleSize: 'medium',
      stickers: []
    });
  };

  const loadCoverFromLibrary = (cover) => {
    setCoverSettings(cover);
  };

  const deleteCoverFromLibrary = (e, coverId) => {
    e.stopPropagation();
    if (libraryCovers.length <= 1) {
      alert("Kitaplığınızda en az bir kapak bulunmalıdır.");
      return;
    }
    const updatedLibrary = libraryCovers.filter(c => c.id !== coverId);
    setLibraryCovers(updatedLibrary);
    localStorage.setItem('journal_covers_library', JSON.stringify(updatedLibrary));
    
    if (coverSettings.id === coverId) {
      setCoverSettings(updatedLibrary[0]);
    }
  };

  const handleSaveAndCreate = () => {
    const exists = libraryCovers.some(c => c.id === coverSettings.id);
    let finalCover = coverSettings;
    let updatedLibrary;
    if (exists) {
      updatedLibrary = libraryCovers.map(c => c.id === coverSettings.id ? { ...coverSettings } : c);
    } else {
      const newId = `cover_${Date.now()}`;
      finalCover = { ...coverSettings, id: newId };
      updatedLibrary = [...libraryCovers, finalCover];
    }
    localStorage.setItem('journal_covers_library', JSON.stringify(updatedLibrary));
    localStorage.setItem('journal_cover_settings', JSON.stringify(finalCover));
    localStorage.setItem('journal_onboarding_complete', 'true');
    handleStartTransition();
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setFormError('Lütfen tüm alanları doldurun.');
      return;
    }
    localStorage.setItem('journal_user', JSON.stringify({ name, email }));
    localStorage.setItem('journal_remember_me', rememberMe ? 'true' : 'false');
    const newTitle = `${name}'in Günlüğü`;
    setCoverSettings(prev => ({
      ...prev,
      title: newTitle
    }));
    setLibraryCovers(prev => {
      if (prev.length > 0 && prev[0].id === 'cover_default') {
        const updated = [...prev];
        updated[0] = { ...updated[0], title: newTitle };
        localStorage.setItem('journal_covers_library', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
    setStep('customize');
  };

  // Draggable stickers handlers
  const handleStickerPointerDown = (e, sticker) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = coverRef.current.getBoundingClientRect();
    setActiveDrag({
      id: sticker.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startPercentX: sticker.x,
      startPercentY: sticker.y,
      containerWidth: rect.width,
      containerHeight: rect.height
    });
    e.target.setPointerCapture(e.pointerId);
  };

  const handleStickerPointerMove = (e, id) => {
    if (!activeDrag || activeDrag.id !== id) return;
    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - activeDrag.startPointerX;
    const deltaY = e.clientY - activeDrag.startPointerY;

    const deltaPercentX = (deltaX / activeDrag.containerWidth) * 100;
    const deltaPercentY = (deltaY / activeDrag.containerHeight) * 100;

    let newX = activeDrag.startPercentX + deltaPercentX;
    let newY = activeDrag.startPercentY + deltaPercentY;

    // Boundaries checking
    newX = Math.max(5, Math.min(85, newX));
    newY = Math.max(5, Math.min(90, newY));

    setCoverSettings(prev => ({
      ...prev,
      stickers: prev.stickers.map(s => s.id === id ? { ...s, x: newX, y: newY } : s)
    }));
  };

  const handleStickerPointerUp = (e, id) => {
    if (activeDrag && activeDrag.id === id) {
      setActiveDrag(null);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handleStickerPointerCancel = (e, id) => {
    if (activeDrag && activeDrag.id === id) {
      setActiveDrag(null);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const addStickerToCover = (emoji) => {
    const newSticker = {
      id: `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      x: 50,
      y: 45,
      scale: 1.0
    };
    setCoverSettings(prev => ({
      ...prev,
      stickers: [...(prev.stickers || []), newSticker]
    }));
  };

  const adjustStickerScale = (id, delta) => {
    setCoverSettings(prev => ({
      ...prev,
      stickers: prev.stickers.map(s => {
        if (s.id === id) {
          const newScale = Math.max(0.5, Math.min(2.5, s.scale + delta));
          return { ...s, scale: parseFloat(newScale.toFixed(1)) };
        }
        return s;
      })
    }));
  };

  const deleteStickerFromCover = (id) => {
    setCoverSettings(prev => ({
      ...prev,
      stickers: prev.stickers.filter(s => s.id !== id)
    }));
  };

  return (
    <div 
      className={`intro-overlay ${isFading ? 'fade-out' : ''}`}
      style={{ background: getOverlayBackground(coverSettings.color) }}
    >
      
      {/* Step 1: Sign-Up Form */}
      {step === 'signup' && (
        <div className="signup-container glass-panel animated-modal">
          <div className="onboarding-logo-area">
            <svg viewBox="0 0 100 60" className="onboarding-logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="30" r="14" fill="#FFE5D9" opacity="0.6" />
              <circle cx="55" cy="34" r="12" fill="#E8F5E9" opacity="0.6" />
              <path d="M 30 42 H 70" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 47 18 V 34 C 47 38, 44 42, 40 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M 61 12 V 34 C 61 38, 58 42, 54 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="onboarding-logo-text">dayday</span>
          </div>
          <div className="signup-header">
            <h2>Merhaba! 🌸</h2>
            <p>Günlüğünü oluşturmak ve kapağını kişiselleştirmek için kayıt ol.</p>
          </div>
          
          <form className="signup-form" onSubmit={handleSignUpSubmit}>
            {formError && <div className="form-error-banner">{formError}</div>}
            
            <div className="form-group">
              <label className="form-label">Adın</label>
              <input 
                type="text" 
                className="signup-input"
                placeholder="Örn: Tuana" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-posta Adresin</label>
              <input 
                type="email" 
                className="signup-input"
                placeholder="ornek@eposta.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Şifre</label>
              <input 
                type="password" 
                className="signup-input"
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group remember-me-group">
              <label className="remember-me-label">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Beni Hatırla
              </label>
            </div>

            <button type="submit" className="soft-btn signup-btn">
              Kayıt Ol & Kapağı Tasarla ➔
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Customization and Page Transition */}
      {step === 'customize' && (
        <div className="intro-workspace customizer-active">
          
          <div className="intro-editor-layout">
            {/* Left Side: Book Cover Mockup */}
            <div className="intro-book-section">
              {/* Logo at top of book section */}
              <div className="book-section-logo-area">
                <svg viewBox="0 0 100 60" className="book-section-logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="45" cy="30" r="14" fill="#FFE5D9" opacity="0.6" />
                  <circle cx="55" cy="34" r="12" fill="#E8F5E9" opacity="0.6" />
                  <path d="M 30 42 H 70" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 47 18 V 34 C 47 38, 44 42, 40 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M 61 12 V 34 C 61 38, 58 42, 54 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span className="book-section-logo-text">dayday</span>
              </div>

              {/* Decorative coffee mug */}
              <div className="coffee-mug-decor">
                <div className="coffee-liquid"></div>
                <div className="mug-handle"></div>
              </div>
              
              {/* Decorative pen */}
              <div className="pen-decor">
                <div className="pen-cap-clip"></div>
              </div>
              
              <div 
                ref={coverRef}
                className="notebook-cover-preview"
                style={{ 
                  background: coverSettings.color,
                  color: ['#0f5a60', '#e85a4f', '#4a4a4a'].some(c => coverSettings.color.includes(c)) ? '#fcfbf7' : '#2c3539'
                }}
                onClick={() => setSelectedCoverSticker(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const emoji = e.dataTransfer.getData("text/plain");
                  if (emoji && coverRef.current) {
                    const rect = coverRef.current.getBoundingClientRect();
                    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
                    const boundedX = Math.max(5, Math.min(85, xPercent));
                    const boundedY = Math.max(5, Math.min(90, yPercent));
                    
                    const newSticker = {
                      id: `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      emoji,
                      x: boundedX,
                      y: boundedY,
                      scale: 1.0
                    };
                    setCoverSettings(prev => ({
                      ...prev,
                      stickers: [...(prev.stickers || []), newSticker]
                    }));
                  }
                }}
              >
                {/* Pattern Overlay Layer with Dynamic Opacity & Mask */}
                <div 
                  className={`notebook-cover-pattern pattern-${coverSettings.pattern}`}
                  style={{ opacity: coverSettings.patternOpacity !== undefined ? coverSettings.patternOpacity : 0.15 }}
                />

                <div className="notebook-spine"></div>
                
                {/* Draggable Stickers Layer */}
                {coverSettings.stickers?.map(sticker => (
                  <div 
                    key={sticker.id}
                    className={`cover-placed-sticker-wrapper ${selectedCoverSticker === sticker.id ? 'selected-sticker' : ''}`}
                    style={{ 
                      left: `${sticker.x}%`, 
                      top: `${sticker.y}%`, 
                      transform: `translate(-50%, -50%) scale(${sticker.scale})` 
                    }}
                    onPointerDown={(e) => handleStickerPointerDown(e, sticker)}
                    onPointerMove={(e) => handleStickerPointerMove(e, sticker.id)}
                    onPointerUp={(e) => handleStickerPointerUp(e, sticker.id)}
                    onPointerCancel={(e) => handleStickerPointerCancel(e, sticker.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCoverSticker(sticker.id === selectedCoverSticker ? null : sticker.id);
                    }}
                  >
                    <span className="cover-placed-sticker emoji">
                      {sticker.emoji}
                    </span>
                    
                    <div className="cover-sticker-controls" onPointerDown={(e) => e.stopPropagation()}>
                      <button className="cover-sticker-btn-ctrl" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); adjustStickerScale(sticker.id, 0.1); }}>+</button>
                      <button className="cover-sticker-btn-ctrl" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); adjustStickerScale(sticker.id, -0.1); }}>-</button>
                      <button className="cover-sticker-btn-ctrl delete" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); deleteStickerFromCover(sticker.id); }}>×</button>
                    </div>
                  </div>
                ))}

                {/* Cover Title and Subtitle Directly on Cover */}
                {(coverSettings.title || coverSettings.subtitle) && (
                  <div 
                    className="cover-design-direct"
                    style={{ 
                      textAlign: coverSettings.titleAlign || 'center',
                      alignItems: coverSettings.titleAlign === 'left' ? 'flex-start' : (coverSettings.titleAlign === 'right' ? 'flex-end' : 'center')
                    }}
                  >
                    {coverSettings.title && (
                      <h1 
                        className="cover-title"
                        style={{ 
                          fontFamily: coverSettings.titleFont === 'Caveat' ? "'Caveat', cursive" : (coverSettings.titleFont === 'Georgia' ? 'Georgia, serif' : "'Outfit', sans-serif"),
                          fontSize: coverSettings.titleSize === 'small' ? '1.3rem' : (coverSettings.titleSize === 'large' ? '2.1rem' : '1.65rem'),
                          textShadow: coverSettings.hasShadow !== false ? '0 1px 3px rgba(0, 0, 0, 0.25)' : 'none'
                        }}
                      >
                        {coverSettings.title}
                      </h1>
                    )}
                    {coverSettings.subtitle && (
                      <p 
                        className="cover-subtitle"
                        style={{
                          textShadow: coverSettings.hasShadow !== false ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none'
                        }}
                      >
                        {coverSettings.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Grid Panel */}
            <div className="intro-grid-panel">
              
              {/* 1. KAPAK DESENİ SEÇİMİ */}
              <div className="grid-panel-card card-pattern">
                <div className="card-title-bar">
                  <h5>1. KAPAK DESENİ SEÇİMİ</h5>
                  <span 
                    className={`settings-icon ${activeSettingsCard === 'pattern' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsCard(activeSettingsCard === 'pattern' ? null : 'pattern')}
                  >
                    ⚙️
                  </span>
                </div>
                {activeSettingsCard === 'pattern' && (
                  <div className="card-sub-settings animate-slide-down">
                    <label className="sub-settings-label">
                      Desen Belirginliği (Opaklık): <span>{Math.round((coverSettings.patternOpacity !== undefined ? coverSettings.patternOpacity : 0.15) * 100)}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="0.02" 
                      max="0.80" 
                      step="0.02" 
                      className="sub-settings-slider"
                      value={coverSettings.patternOpacity !== undefined ? coverSettings.patternOpacity : 0.15}
                      onChange={(e) => handleSettingChange('patternOpacity', parseFloat(e.target.value))}
                    />
                  </div>
                )}
                <div className="card-pattern-grid">
                  {COVER_PATTERNS.map((p) => (
                    <button 
                      key={p.id}
                      className={`card-pattern-btn ${coverSettings.pattern === p.id ? 'active' : ''}`}
                      onClick={() => handleSettingChange('pattern', p.id)}
                    >
                      <div className={`pattern-preview-mini pattern-${p.id}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. RENK PALETİ SEÇİMİ */}
              <div className="grid-panel-card card-color">
                <div className="card-title-bar">
                  <h5>2. RENK PALETİ SEÇİMİ</h5>
                  <span 
                    className={`settings-icon ${activeSettingsCard === 'color' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsCard(activeSettingsCard === 'color' ? null : 'color')}
                  >
                    ⚙️
                  </span>
                </div>
                {activeSettingsCard === 'color' && (
                  <div className="card-sub-settings animate-slide-down">
                    <label className="sub-settings-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={coverSettings.isGradient || false}
                        onChange={(e) => {
                          const useGradient = e.target.checked;
                          handleSettingChange('isGradient', useGradient);
                          // Match active color value to gradients or solid colors
                          const currentVal = coverSettings.color;
                          const currentObj = COVER_COLORS.find(c => c.value === currentVal || c.gradient === currentVal);
                          if (currentObj) {
                            handleSettingChange('color', useGradient ? currentObj.gradient : currentObj.value);
                          }
                        }}
                      />
                      Degrade (Gradient) Renkler Kullan
                    </label>
                  </div>
                )}
                <div className="card-color-grid">
                  {COVER_COLORS.map((colorObj, idx) => {
                    const colorVal = coverSettings.isGradient ? colorObj.gradient : colorObj.value;
                    return (
                      <button 
                        key={idx}
                        className={`card-color-btn ${coverSettings.color === colorVal ? 'active' : ''}`}
                        style={{ background: colorVal }}
                        onClick={() => handleSettingChange('color', colorVal)}
                        title={colorObj.name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Two columns card layout */}
              <div className="grid-panel-row">
                
                 {/* 3. STICKER DÜNYASI */}
                <div className="grid-panel-card card-sticker">
                  <div className="card-title-bar">
                    <h5>3. STICKER DÜNYASI</h5>
                    <span 
                      className={`settings-icon ${activeSettingsCard === 'sticker' ? 'active' : ''}`}
                      onClick={() => setActiveSettingsCard(activeSettingsCard === 'sticker' ? null : 'sticker')}
                    >
                      ⚙️
                    </span>
                  </div>
                  {activeSettingsCard === 'sticker' && (
                    <div className="card-sub-settings animate-slide-down">
                      <button 
                        type="button"
                        className="sub-settings-action-btn delete"
                        onClick={() => handleSettingChange('stickers', [])}
                      >
                        🗑️ Tüm Stickerları Temizle
                      </button>
                    </div>
                  )}
                  <div className="card-sticker-scroll">
                    <div className="card-sticker-grid">
                      {COVER_STICKERS.map((emoji, idx) => (
                        <button 
                          key={idx}
                          className="card-sticker-item-btn"
                          onClick={() => addStickerToCover(emoji)}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", emoji);
                          }}
                        >
                          <span className="sticker-emoji-large">{emoji}</span>
                          <span className="sticker-label-sub">Tıkla veya Sürükle</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. BAŞLIK EKLEME */}
                <div className="grid-panel-card card-title-settings">
                  <div className="card-title-bar">
                    <h5>4. BAŞLIK EKLEME</h5>
                    <span 
                      className={`settings-icon ${activeSettingsCard === 'title' ? 'active' : ''}`}
                      onClick={() => setActiveSettingsCard(activeSettingsCard === 'title' ? null : 'title')}
                    >
                      ⚙️
                    </span>
                  </div>
                  {activeSettingsCard === 'title' && (
                    <div className="card-sub-settings animate-slide-down">
                      <div className="sub-settings-row">
                        <div className="sub-settings-col">
                          <label>Hizalama</label>
                          <select 
                            value={coverSettings.titleAlign || 'center'}
                            onChange={(e) => handleSettingChange('titleAlign', e.target.value)}
                          >
                            <option value="left">Sola</option>
                            <option value="center">Ortala</option>
                            <option value="right">Sağa</option>
                          </select>
                        </div>
                        <div className="sub-settings-col checkbox-col">
                          <label className="sub-settings-checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={coverSettings.hasShadow !== undefined ? coverSettings.hasShadow : true}
                              onChange={(e) => handleSettingChange('hasShadow', e.target.checked)}
                            />
                            Gölge Ekle
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="card-title-form">
                    <div className="card-form-group">
                      <label>Ana Başlık</label>
                      <input 
                        type="text" 
                        value={coverSettings.title} 
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        placeholder="Örn: Ayşe'nin Günlüğü"
                        maxLength={25}
                      />
                    </div>
                    <div className="card-form-group">
                      <label>Alt Başlık</label>
                      <input 
                        type="text" 
                        value={coverSettings.subtitle} 
                        onChange={(e) => handleSettingChange('subtitle', e.target.value)}
                        placeholder="Örn: Hayaller ve Anılar"
                        maxLength={35}
                      />
                    </div>
                    <div className="card-form-row">
                      <div className="card-form-group half-width">
                        <label>Yazı Tipi</label>
                        <select 
                          value={coverSettings.titleFont}
                          onChange={(e) => handleSettingChange('titleFont', e.target.value)}
                        >
                          <option value="Outfit">Outfit</option>
                          <option value="Caveat">Cursive</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                      </div>
                      <div className="card-form-group half-width">
                        <label>Boyut</label>
                        <select 
                          value={coverSettings.titleSize || 'medium'}
                          onChange={(e) => handleSettingChange('titleSize', e.target.value)}
                        >
                          <option value="small">Küçük</option>
                          <option value="medium">Orta</option>
                          <option value="large">Büyük</option>
                        </select>
                      </div>
                    </div>
                    
                    <button className="create-book-btn" onClick={handleSaveAndCreate}>
                      DEFTERİ OLUŞTUR VE KEŞFET
                    </button>
                    
                    <button type="button" className="cancel-link-btn" onClick={onComplete}>
                      Vazgeç
                    </button>
                  </div>
                </div>

              </div>

              {/* 5. KİTAPLIĞIM */}
              <div className="grid-panel-card card-library">
                <div className="card-title-bar">
                  <h5>5. KİTAPLIĞIM & SEÇİLEN KAPAKLAR</h5>
                  <span 
                    className={`settings-icon ${activeSettingsCard === 'library' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsCard(activeSettingsCard === 'library' ? null : 'library')}
                  >
                    ⚙️
                  </span>
                </div>
                {activeSettingsCard === 'library' && (
                  <div className="card-sub-settings animate-slide-down">
                    <button 
                      type="button" 
                      className="sub-settings-action-btn delete"
                      onClick={() => {
                        if (window.confirm("Tüm kayıtlı kapak tasarımlarınızı silmek istediğinize emin misiniz?")) {
                          const defaultCover = {
                            id: 'cover_default',
                            color: '#0f5a60',
                            pattern: 'leaves',
                            patternOpacity: 0.15,
                            isGradient: false,
                            title: "Ayşe'nin Günlüğü",
                            subtitle: 'Hayaller ve Anılar',
                            titleFont: 'Caveat',
                            titleSize: 'medium',
                            stickers: [
                              {
                                id: 'default_flower',
                                emoji: '🌸',
                                x: 82,
                                y: 50,
                                scale: 1.2
                              }
                            ]
                          };
                          setLibraryCovers([defaultCover]);
                          setCoverSettings(defaultCover);
                          localStorage.setItem('journal_covers_library', JSON.stringify([defaultCover]));
                          localStorage.setItem('journal_cover_settings', JSON.stringify(defaultCover));
                        }
                      }}
                    >
                      🗑️ Kitaplığı Sıfırla
                    </button>
                  </div>
                )}
                <div className="library-covers-grid">
                  {libraryCovers.map((cover) => {
                    const isBookDark = ['#0f5a60', '#e85a4f', '#4a4a4a'].includes(cover.color);
                    const bookTextColor = isBookDark ? '#fcfbf7' : '#2c3539';
                    return (
                      <div 
                        key={cover.id}
                        className={`library-book-item pattern-${cover.pattern} ${coverSettings.id === cover.id ? 'active' : ''}`}
                        style={{ background: cover.color, color: bookTextColor }}
                        onClick={() => loadCoverFromLibrary(cover)}
                        title={cover.title}
                      >
                        <div className="library-book-spine-detail"></div>
                        <button 
                          type="button"
                          className="library-book-delete-btn" 
                          onClick={(e) => deleteCoverFromLibrary(e, cover.id)}
                          title="Sil"
                        >
                          ×
                        </button>
                        <span className="library-book-title-mini">
                          {cover.title || "Adsız"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="library-actions-row">
                  <button type="button" className="library-btn-save" onClick={saveCurrentCoverToLibrary}>
                    💾 Tasarımı Kaydet
                  </button>
                  <button type="button" className="library-btn-new" onClick={startNewBlankCover}>
                    ➕ Yeni Defter Ekle
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};

const getAppThemeGradient = (color) => {
  switch (color) {
    case '#0f5a60': return 'linear-gradient(135deg, #f0f6f6 0%, #f7f7f5 100%)';
    case '#e85a4f': return 'linear-gradient(135deg, #faf0ef 0%, #f7f7f5 100%)';
    case '#dda15e': return 'linear-gradient(135deg, #faf6ee 0%, #f7f7f5 100%)';
    case '#f2afb6': return 'linear-gradient(135deg, #fbf2f3 0%, #f7f7f5 100%)';
    case '#4a4a4a': return 'linear-gradient(135deg, #f2f2f2 0%, #f7f7f5 100%)';
    default: return 'linear-gradient(135deg, #fdfdfd 0%, #f6f6f6 100%)';
  }
};

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem('journal_remember_me') !== 'true';
  });

  const [introStep, setIntroStep] = useState('signup');

  const [themeColor, setThemeColor] = useState(() => {
    try {
      const saved = localStorage.getItem('journal_cover_settings');
      if (saved) {
        return JSON.parse(saved).color || '#0f5a60';
      }
    } catch (e) {}
    return '#0f5a60';
  });

  useEffect(() => {
    if (!showIntro) {
      try {
        const saved = localStorage.getItem('journal_cover_settings');
        if (saved) {
          setThemeColor(JSON.parse(saved).color || '#0f5a60');
        }
      } catch (e) {}
    }
  }, [showIntro]);

  // Midnight auto-reset listener
  useEffect(() => {
    const getTodayStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const checkDate = () => {
      const currentToday = getTodayStr();
      const savedToday = localStorage.getItem('app_current_date');
      
      if (savedToday && currentToday !== savedToday) {
        localStorage.setItem('app_current_date', currentToday);
        window.location.reload();
      } else if (!savedToday) {
        localStorage.setItem('app_current_date', currentToday);
      }
    };

    checkDate();
    window.addEventListener('focus', checkDate);
    const interval = setInterval(checkDate, 15000);

    return () => {
      window.removeEventListener('focus', checkDate);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <div className="app-container" style={{ background: getAppThemeGradient(themeColor), transition: 'background 0.5s ease' }}>
        {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} initialStep={introStep} />}
        
        {/* Mobile Top Navbar with Logo */}
        <div className="mobile-top-bar">
          <div className="mobile-logo-area">
            <svg viewBox="0 0 100 60" className="mobile-logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="30" r="14" fill="#FFE5D9" opacity="0.6" />
              <circle cx="55" cy="34" r="12" fill="#E8F5E9" opacity="0.6" />
              <path d="M 30 42 H 70" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 47 18 V 34 C 47 38, 44 42, 40 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M 61 12 V 34 C 61 38, 58 42, 54 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="mobile-logo-text">dayday</span>
          </div>
        </div>

        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard onOpenCoverDesign={() => { setIntroStep('customize'); setShowIntro(true); }} />} />
            <Route path="/mood-jar" element={<MoodJar />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/library" element={<Library />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
