import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import './MoodJar.css';

const MOODS = {
  joy: { name: 'Neşe', color: '#FFF275' },
  ennui: { name: 'Bıkkınlık', color: '#5B618A' },
  fear: { name: 'Korku', color: '#C9B6E4' },
  anger: { name: 'Öfke', color: '#F28F8F' },
  embarrassment: { name: 'Utanç', color: '#F2C4CE' },
  anxiety: { name: 'Kaygı', color: '#E08E45' },
  envy: { name: 'Gıpta', color: '#79D1C3' },
  sadness: { name: 'Üzüntü', color: '#A8D0E6' },
  disgust: { name: 'Tiksinti', color: '#A7D49B' }
};

const getHybridName = (mood1, mood2) => {
  const keys = [mood1, mood2].sort().join('+');
  const hybridNames = {
    'joy+sadness': 'Buruk Sevinç 🥺',
    'joy+anger': 'Ateşli Heyecan ⚡',
    'joy+disgust': 'Hınzır Alaycılık 😏',
    'joy+fear': 'Heyecanlı Kaygı 🎢',
    'joy+ennui': 'Sakin Mutluluk 🧘',
    'joy+embarrassment': 'Mahcup Sevinç 😊',
    'joy+anxiety': 'Tatlı Telaş 🌪️',
    'joy+envy': 'Tatlı Özenme ✨',
    
    'anger+sadness': 'Kırgınlık 💔',
    'disgust+sadness': 'Bezginlik 😑',
    'fear+sadness': 'Çaresizlik 🌧️',
    'ennui+sadness': 'Melankoli 🌫️',
    'embarrassment+sadness': 'Utangaç Hüzün 🫣',
    'anxiety+sadness': 'Evham 😰',
    'envy+sadness': 'İç Çekiş 🥀',
    
    'anger+disgust': 'Nefret 😡',
    'anger+fear': 'Saldırganlık 🛡️',
    'anger+ennui': 'Tahammülsüzlük 😤',
    'anger+embarrassment': 'Kızgınlık 😳',
    'anger+anxiety': 'Öfke Nöbeti 💥',
    'anger+envy': 'Hırs 🌋',
    
    'disgust+fear': 'Uzaklaşma 🫣',
    'disgust+ennui': 'Bıkkın Küçümseme 🙄',
    'disgust+embarrassment': 'Utanç Verici Tiksinti 🤢',
    'disgust+anxiety': 'Huzursuzluk 🫨',
    'disgust+envy': 'Göz Süzme 👁️',
    
    'fear+ennui': 'Kayıtsız Korku 👤',
    'embarrassment+fear': 'Çekingen Korku 🫣',
    'anxiety+fear': 'Panik 🚨',
    'envy+fear': 'Gözü Kalma 👀',
    
    'embarrassment+ennui': 'İçine Kapanma 📴',
    'anxiety+ennui': 'Gelecek Kaygısı 🗓️',
    'envy+ennui': 'Pasif Özenme 💬',
    
    'anxiety+embarrassment': 'Sosyal Anksiyete 👥',
    'embarrassment+envy': 'Ezilmişlik 🥺',
    'anxiety+envy': 'Kıyaslama Kaygısı 📊'
  };
  return hybridNames[keys] || 'Karma His';
};

const getHybridBallLabel = (mood1, mood2) => {
  const keys = [mood1, mood2].sort().join('+');
  const labels = {
    'joy+sadness': 'Buruk',
    'joy+anger': 'Ateşli',
    'joy+disgust': 'Alaycı',
    'joy+fear': 'Kaygılı',
    'joy+ennui': 'Sakin',
    'joy+embarrassment': 'Mahcup',
    'joy+anxiety': 'Telaşlı',
    'joy+envy': 'Özenli',
    
    'anger+sadness': 'Kırgın',
    'disgust+sadness': 'Bezgin',
    'fear+sadness': 'Çaresiz',
    'ennui+sadness': 'Melankoli',
    'embarrassment+sadness': 'Çekingen',
    'anxiety+sadness': 'Evhamlı',
    'envy+sadness': 'Kederli',
    
    'anger+disgust': 'Nefret',
    'anger+fear': 'Saldırgan',
    'anger+ennui': 'Öfkeli',
    'anger+embarrassment': 'Mahcup',
    'anger+anxiety': 'Gergin',
    'anger+envy': 'Hırslı',
    
    'disgust+fear': 'Çekingen',
    'disgust+ennui': 'Bezgin',
    'disgust+embarrassment': 'Ezilmiş',
    'disgust+anxiety': 'Huzursuz',
    'disgust+envy': 'Gıpta',
    
    'fear+ennui': 'Korkak',
    'embarrassment+fear': 'Çekingen',
    'anxiety+fear': 'Panik',
    'envy+fear': 'Kaygılı',
    
    'embarrassment+ennui': 'Kayıtsız',
    'anxiety+ennui': 'Bezgin',
    'envy+ennui': 'Kıskanç',
    
    'anxiety+embarrassment': 'Gergin',
    'embarrassment+envy': 'Ezilmiş',
    'anxiety+envy': 'Evhamlı'
  };
  return labels[keys] || 'Karma';
};

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const MoodJar = () => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const [moodCounts, setMoodCounts] = useState([]);
  const [blendColor, setBlendColor] = useState('rgba(255,255,255,0)');
  const [selectedBlends, setSelectedBlends] = useState([]);
  const [weeklyMoods, setWeeklyMoods] = useState({});

  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const dates = [];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + distanceToMonday + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dates.push({ day: dayNames[i], dateStr });
    }
    return dates;
  };

  const loadWeeklyMoods = () => {
    const dates = getWeekDates();
    const moods = {};
    dates.forEach(({ dateStr }) => {
      const color = localStorage.getItem(`mood_${dateStr}`) || 'transparent';
      let balls = [];
      try {
        const saved = localStorage.getItem(`mood_balls_${dateStr}`);
        if (saved) {
          balls = JSON.parse(saved);
        }
      } catch (e) {
        console.error(e);
      }
      moods[dateStr] = { color, balls };
    });
    setWeeklyMoods(moods);
  };

  useEffect(() => {
    loadWeeklyMoods();
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite;

    const engine = Engine.create();
    engineRef.current = engine;

    const width = 300;
    const height = 390;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent'
      }
    });

    // Create Jar walls — jar glass is 200px wide, centered in 300px canvas
    // glass left edge at x=50, right edge at x=250
    const wallOptions = { 
      isStatic: true, 
      render: { fillStyle: 'transparent', strokeStyle: 'rgba(255,255,255,0.4)', lineWidth: 2 } 
    };
    
    const ground    = Bodies.rectangle(150, 380, 200, 20, wallOptions);
    const leftWall  = Bodies.rectangle(50,  230, 20,  340, wallOptions);
    const rightWall = Bodies.rectangle(250, 230, 20,  340, wallOptions);
    
    // angled neck openings
    const leftNeck  = Bodies.rectangle(75,  90, 60, 20, { ...wallOptions, angle:  Math.PI / 4 });
    const rightNeck = Bodies.rectangle(225, 90, 60, 20, { ...wallOptions, angle: -Math.PI / 4 });

    Composite.add(engine.world, [ground, leftWall, rightWall, leftNeck, rightNeck]);

    // Custom Matter.js Render hook for 3D glossy spheres
    Matter.Events.on(render, 'afterRender', () => {
      const context = render.context;
      if (!context) return;
      
      const bodies = Matter.Composite.allBodies(engine.world);
      
      bodies.forEach(body => {
        if (body.isStatic) return;

        context.save();
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);

        const radius = body.circleRadius || 18;

        // Draw custom 3D gradient if color properties exist
        if (body.color1) {
          const gradient = context.createRadialGradient(-radius * 0.25, -radius * 0.25, 2, 0, 0, radius);
          gradient.addColorStop(0, '#FFFFFF'); // Specular highlight
          gradient.addColorStop(0.35, body.color1);
          gradient.addColorStop(1, body.color2 || body.color1);
          
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(0, 0, radius, 0, 2 * Math.PI);
          context.fill();
          
          context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          context.lineWidth = 1.5;
          context.stroke();
        }

        context.restore();
      });
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      if (render.canvas) render.canvas.remove();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Calculate blended color for jar background
    if (moodCounts.length === 0) {
      setBlendColor('rgba(255,255,255,0)');
      return;
    }

    let rSum = 0, gSum = 0, bSum = 0;
    moodCounts.forEach(hex => {
      const { r, g, b } = hexToRgb(hex);
      rSum += r;
      gSum += g;
      bSum += b;
    });

    const count = moodCounts.length;
    const r = Math.round(rSum / count);
    const g = Math.round(gSum / count);
    const b = Math.round(bSum / count);

    setBlendColor(`rgba(${r}, ${g}, ${b}, 0.5)`);
  }, [moodCounts]);

  const addMoodBall = (color1, color2 = null, customLabel = null) => {
    if (!engineRef.current) return;

    const Bodies = Matter.Bodies;
    const Composite = Matter.Composite;

    const startX = 150 + (Math.random() * 40 - 20);
    const startY = 20;
    const radius = color2 ? 22 : 18;

    const ballOptions = {
      restitution: 0.6,
      friction: 0.05,
      label: customLabel || '',
      render: {
        fillStyle: 'transparent',
        strokeStyle: 'transparent',
        lineWidth: 0
      }
    };

    const ball = Bodies.circle(startX, startY, radius, ballOptions);

    ball.color1 = color1;
    ball.color2 = color2 || color1;

    Composite.add(engineRef.current.world, ball);
    
    if (color2) {
      setMoodCounts(prev => [...prev, color1, color2]);
    } else {
      setMoodCounts(prev => [...prev, color1]);
    }
  };

  const handleToggleBlendMood = (moodKey) => {
    if (selectedBlends.includes(moodKey)) {
      setSelectedBlends(selectedBlends.filter(k => k !== moodKey));
    } else {
      if (selectedBlends.length < 2) {
        setSelectedBlends([...selectedBlends, moodKey]);
      } else {
        setSelectedBlends([selectedBlends[1], moodKey]);
      }
    }
  };

  const handleBlendAndDrop = () => {
    if (selectedBlends.length !== 2) return;
    const mood1 = selectedBlends[0];
    const mood2 = selectedBlends[1];
    const color1 = MOODS[mood1].color;
    const color2 = MOODS[mood2].color;
    const hybridLabel = getHybridBallLabel(mood1, mood2);
    
    addMoodBall(color1, color2, hybridLabel);
    setSelectedBlends([]);
  };

  const saveDailyMood = () => {
    if (moodCounts.length === 0) return alert('Lütfen önce kavanoza duygu ekleyin.');
    
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    localStorage.setItem(`mood_${today}`, blendColor);
    
    // Get all balls from the matter world
    let savedBalls = [];
    if (engineRef.current) {
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      bodies.forEach(body => {
        if (!body.isStatic && body.color1) {
          savedBalls.push({
            color1: body.color1,
            color2: body.color2 || body.color1
          });
        }
      });
    }
    
    localStorage.setItem(`mood_balls_${today}`, JSON.stringify(savedBalls));
    
    // Update local state instantly so the mini weekly jars fill up immediately
    setWeeklyMoods(prev => ({
      ...prev,
      [today]: { color: blendColor, balls: savedBalls }
    }));
    
    alert('Günün duygu kodu kaydedildi!');
  };

  return (
    <div className="mood-jar-page">
      <div className="mood-jar-header">
        <h1>Duygu Kavanozu</h1>
        <p>Bugün hissettiğin duyguları kavanoza doldur.</p>
      </div>

      <div className="mood-jar-workspace">
        <div className="jar-column">
          <div className="jar-container">
            <div 
              className="jar-glass"
              style={{ background: `linear-gradient(to top, ${blendColor} 0%, transparent 80%)` }}
            >
              <div ref={sceneRef} className="matter-scene" />
              
              <div className="jar-highlight left"></div>
              <div className="jar-highlight right"></div>
            </div>
          </div>
        </div>

        <div className="control-column">
          {/* Blending Station */}
          <div className="blender-widget glass-panel">
            <h3>Duygu Harmanlayıcı 🧪</h3>
            <p className="blender-hint">
              Harmanlamak istediğin iki farklı duyguyu seçerek yepyeni bir his yarat:
            </p>
            
            <div className="blender-options">
              {Object.entries(MOODS).map(([key, mood]) => {
                const isSelected = selectedBlends.includes(key);
                return (
                  <button
                    key={key}
                    className={`blender-option-btn ${isSelected ? 'selected' : ''}`}
                    style={{ '--mood-color': mood.color }}
                    onClick={() => handleToggleBlendMood(key)}
                  >
                    <span className="dot"></span>
                    {mood.name}
                  </button>
                );
              })}
            </div>

            {selectedBlends.length === 2 ? (
              <div className="blender-result">
                <div className="blender-preview-wrapper">
                  <div 
                    className="blender-preview-sphere"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${MOODS[selectedBlends[0]].color} 0%, ${MOODS[selectedBlends[1]].color} 100%)`
                    }}
                  />
                </div>
                <div className="blender-result-info">
                  <h4>{getHybridName(selectedBlends[0], selectedBlends[1])}</h4>
                  <button className="soft-btn merge-drop-btn" onClick={handleBlendAndDrop}>
                    Karıştır ve Dök
                  </button>
                </div>
              </div>
            ) : (
              <div className="blender-placeholder">
                <div className="placeholder-sphere" />
                <p>İki duygu seçerek harmanlamaya başla...</p>
              </div>
            )}
          </div>

          <button className="soft-btn save-mood-btn" onClick={saveDailyMood}>
            Günü Kaydet
          </button>
        </div>
      </div>



      {/* Character Lineup Section at the Bottom */}
      <div className="character-lineup-section">
        <div className="character-lineup">
          {Object.entries(MOODS).map(([key, mood]) => (
            <div 
              key={key} 
              className={`char-card ${key}`} 
              style={{ '--char-color': mood.color }}
              onClick={() => addMoodBall(mood.color, null, mood.name)}
            >
              <div className="char-label-container">
                <span className="char-ball"></span>
                <span>{mood.name}</span>
              </div>

              <img src={`/characters/${key}.png`} alt={mood.name} />

              {/* Character-specific hover effects */}
              {key === 'ennui' && <div className="effect sleepy-zzz"><span>z</span><span>z</span><span>z</span></div>}
              {key === 'sadness' && <div className="effect tear-drops"><span className="tear">💧</span><span className="tear">💧</span></div>}
              {key === 'fear' && <div className="effect sweat-drops">💦</div>}
              {key === 'embarrassment' && <div className="effect blush-glow"></div>}
              {key === 'joy' && <div className="effect joy-sparkles">✨</div>}
              {key === 'anger' && <div className="effect fire-head">🔥</div>}
              {key === 'anxiety' && <div className="effect jitter-lines">🫨</div>}
              {key === 'disgust' && <div className="effect sassy-spark">💅</div>}
              {key === 'envy' && <div className="effect envy-stars"><span>✨</span><span>✨</span></div>}
            </div>
          ))}
        </div>
        <h3>Duygu Karakterleri</h3>
        <p className="lineup-hint">Karakterlerin üzerine gelerek tepkilerini izle, tıklayarak kavanoza duygu ekle!</p>
      </div>
    </div>
  );
};

export default MoodJar;
