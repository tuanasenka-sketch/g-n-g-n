import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Save, Paintbrush, Edit3 } from 'lucide-react';
import './Journal.css';

const STICKERS_PRESETS = [
  { id: 'sparkles', emoji: '✨', name: 'Işıltı', animation: 'spin' },
  { id: 'heart', emoji: '💖', name: 'Sevgi', animation: 'pulse' },
  { id: 'cloud', emoji: '☁️', name: 'Bulut', animation: 'float' },
  { id: 'fire', emoji: '🔥', name: 'Öfke Ateşi', animation: 'wobble' },
  { id: 'anxiety', emoji: '🫨', name: 'Kaygı', animation: 'wobble' },
  { id: 'moon', emoji: '🌙', name: 'Uykulu Hilal', animation: 'float' },
  { id: 'flower', emoji: '🌸', name: 'Çiçek', animation: 'pulse' },
  { id: 'coffee', emoji: '☕', name: 'Kahve', animation: 'wobble' },
  { id: 'star', emoji: '⭐', name: 'Yıldız', animation: 'spin' },
  { id: 'rainbow', emoji: '🌈', name: 'Gökkuşağı', animation: 'float' },
  { id: 'bear', emoji: '🧸', name: 'Oyuncak Ayı', animation: 'pulse' },
  { id: 'sun', emoji: '☀️', name: 'Güneş', animation: 'spin' }
];

const PROMPTS = [
  "Bugün seni en çok ne gülümsetti? 😊",
  "Hangi anı dondurmak isterdin? ⏳",
  "Bugün öğrendiğin en ilginç şey neydi? 💡",
  "Kendine bir teşekkür etsen, bu ne için olurdu? 💖",
  "Bugün karşılaştığın zor bir anı nasıl aştın? 🌟",
  "Şu an etrafında gördüğün ve şükrettiğin 3 şey nedir? 🌸",
  "Gününün en sakin/huzurlu anı ne zamandı? 🧘",
  "Bugün birine yaptığın ya da birinden gördüğün bir iyilik var mı? 🤝",
  "Bugün seni en çok yoran veya kaygılandıran düşünce neydi? 💭",
  "Yarına taşımak istediğin en güzel his hangisi? 🚀",
  "Bugün kendi içine dönüp kendine ne söylemek istersin? 💌"
];

const Journal = () => {
  const [moodColor, setMoodColor] = useState('transparent');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDecorating, setIsDecorating] = useState(false);
  const [stickers, setStickers] = useState([]);
  const [activeDrag, setActiveDrag] = useState(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');

  const editorRef = useRef(null);

  useEffect(() => {
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    const savedMood = localStorage.getItem(`mood_${today}`);
    if (savedMood) {
      setMoodColor(savedMood);
    }
    const savedJournal = localStorage.getItem(`journal_${today}`);
    if (savedJournal) {
      try {
        const data = JSON.parse(savedJournal);
        setTitle(data.title || '');
        setContent(data.content || '');
        setStickers(data.stickers || []);
      } catch (e) {
        console.error("Error loading journal data", e);
      }
    }
  }, []);

  const handlePromptClick = () => {
    let nextPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    while (nextPrompt === currentPrompt && PROMPTS.length > 1) {
      nextPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    }
    setCurrentPrompt(nextPrompt);
    setShowPromptModal(true);
  };

  const usePrompt = () => {
    setTitle(currentPrompt);
    setShowPromptModal(false);
  };

  const handleSave = () => {
    if (!content && stickers.length === 0) return;
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    localStorage.setItem(`journal_${today}`, JSON.stringify({ title, content, stickers }));
    alert('Günlüğün kaydedildi 📝');
  };

  const addSticker = (preset) => {
    const newSticker = {
      id: `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: preset.id,
      emoji: preset.emoji,
      animation: preset.animation,
      x: 50 + (Math.random() * 20 - 10),
      y: 50 + (Math.random() * 20 - 10),
      scale: 1.0
    };
    setStickers(prev => [...prev, newSticker]);
  };

  const adjustScale = (id, delta) => {
    setStickers(prev => prev.map(s => {
      if (s.id === id) {
        const newScale = Math.max(0.5, Math.min(2.5, s.scale + delta));
        return { ...s, scale: parseFloat(newScale.toFixed(1)) };
      }
      return s;
    }));
  };

  const deleteSticker = (id) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  // Pointer drag events
  const handlePointerDown = (e, sticker) => {
    if (!isDecorating) return;
    e.preventDefault();
    const rect = editorRef.current.getBoundingClientRect();
    setActiveDrag({
      id: sticker.id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startPercentX: sticker.x,
      startPercentY: sticker.y,
      editorWidth: rect.width,
      editorHeight: rect.height
    });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e, id) => {
    if (!activeDrag || activeDrag.id !== id) return;
    
    const deltaX = e.clientX - activeDrag.startPointerX;
    const deltaY = e.clientY - activeDrag.startPointerY;
    
    const deltaPercentX = (deltaX / activeDrag.editorWidth) * 100;
    const deltaPercentY = (deltaY / activeDrag.editorHeight) * 100;
    
    let newX = activeDrag.startPercentX + deltaPercentX;
    let newY = activeDrag.startPercentY + deltaPercentY;
    
    newX = Math.max(2, Math.min(94, newX));
    newY = Math.max(2, Math.min(94, newY));
    
    setStickers(prev => prev.map(s => s.id === id ? { ...s, x: newX, y: newY } : s));
  };

  const handlePointerUp = (e, id) => {
    if (activeDrag && activeDrag.id === id) {
      setActiveDrag(null);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="journal-page">
      {/* Background Glow based on Mood */}
      <div 
        className="journal-glow" 
        style={{ 
          background: moodColor !== 'transparent' 
            ? `radial-gradient(circle at top left, ${moodColor} 0%, transparent 70%)` 
            : 'none' 
        }}
      />

      <div className="journal-header">
        <div className="date-badge">
          {moodColor !== 'transparent' && (
            <div className="mood-dot" style={{ background: moodColor }}></div>
          )}
          <span>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        
        <div className="header-actions">
          <button 
            className={`soft-btn mode-toggle-btn ${isDecorating ? 'active' : ''}`} 
            onClick={() => setIsDecorating(!isDecorating)}
          >
            {isDecorating ? <Edit3 size={16} /> : <Paintbrush size={16} />}
            <span>{isDecorating ? 'Yazı Modu' : 'Defteri Süsle'}</span>
          </button>
          
          <button className="soft-btn prompt-btn" onClick={handlePromptClick}>
            <Sparkles size={16} />
            İlham İste
          </button>
        </div>
      </div>

      <div 
        className={`journal-editor ${isDecorating ? 'decorating-mode' : ''}`} 
        ref={editorRef}
      >
        <input 
          type="text" 
          className="journal-title-input" 
          placeholder="Günlüğe bir başlık ver..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isDecorating}
        />
        
        <textarea 
          className="journal-content-input"
          placeholder="İçini dök, burası senin güvenli alanın..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isDecorating}
        />

        {/* Stickers Layer */}
        <div className={`stickers-layer ${isDecorating ? 'active' : 'passive'}`}>
          {stickers.map(sticker => (
            <div 
              key={sticker.id}
              className="placed-sticker-wrapper"
              style={{ 
                left: `${sticker.x}%`, 
                top: `${sticker.y}%`, 
                transform: `translate(-50%, -50%) scale(${sticker.scale})` 
              }}
              onPointerDown={(e) => handlePointerDown(e, sticker)}
              onPointerMove={(e) => handlePointerMove(e, sticker.id)}
              onPointerUp={(e) => handlePointerUp(e, sticker.id)}
              onPointerCancel={(e) => handlePointerUp(e, sticker.id)}
            >
              <span className={`placed-sticker emoji animate-${sticker.animation}`}>
                {sticker.emoji}
              </span>
              
              {isDecorating && (
                <div className="sticker-controls">
                  <button className="control-btn scale-up" onClick={(e) => { e.stopPropagation(); adjustScale(sticker.id, 0.1); }}>+</button>
                  <button className="control-btn scale-down" onClick={(e) => { e.stopPropagation(); adjustScale(sticker.id, -0.1); }}>-</button>
                  <button className="control-btn delete" onClick={(e) => { e.stopPropagation(); deleteSticker(sticker.id); }}>×</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="journal-footer">
        {/* Sticker Drawer Section */}
        {isDecorating && (
          <div className="sticker-drawer glass-panel">
            <div className="drawer-header">
              <h4>Süsleme Çekmecesi 🧸</h4>
              <p>Eklemek istediğin stickera tıkla, sürükleyerek yerleştir!</p>
            </div>
            <div className="sticker-presets">
              {STICKERS_PRESETS.map(preset => (
                <button 
                  key={preset.id} 
                  className="preset-sticker-btn"
                  onClick={() => addSticker(preset)}
                >
                  <span className={`emoji animate-${preset.animation}`}>{preset.emoji}</span>
                  <span className="name">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="soft-btn save-journal-btn" onClick={handleSave}>
          <Save size={18} />
          Günlüğü Kaydet
        </button>
      </div>

      {/* Inspiration Prompt Modal */}
      {showPromptModal && createPortal(
        <div className="prompt-modal-overlay">
          <div className="prompt-modal-content glass-panel animated-modal">
            <div className="prompt-modal-header">
              <Sparkles className="prompt-sparkle-icon" size={24} />
              <h3>Günün İlhamı 💡</h3>
            </div>
            
            <p className="prompt-text-display">"{currentPrompt}"</p>
            
            <div className="prompt-modal-actions">
              <button className="soft-btn cycle-prompt-btn" onClick={handlePromptClick}>
                🔄 Başka Bir Tane
              </button>
              <button className="soft-btn accept-prompt-btn" onClick={usePrompt}>
                📝 Yazmaya Başla
              </button>
            </div>
            
            <button className="close-modal-btn" onClick={() => setShowPromptModal(false)}>×</button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Journal;
