import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './DashboardComponents.css';

export const HydroTracker = () => {
  const [waterCount, setWaterCount] = useState(() => {
    const saved = localStorage.getItem('hydro_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        if (parsed.date === today) {
          return parsed.count;
        }
      } catch (e) {}
    }
    return 0; // Reset if different day or no data
  });

  const maxWater = 8;
  const percentage = (waterCount / maxWater) * 100;

  useEffect(() => {
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    localStorage.setItem('hydro_data', JSON.stringify({ date: today, count: waterCount }));
    localStorage.setItem(`hydro_${today}`, waterCount.toString());
  }, [waterCount]);

  const handleClick = () => {
    if (waterCount < maxWater) {
      setWaterCount(prev => prev + 1);
    }
  };

  return (
    <div className="glass-panel widget hydro-widget" onClick={handleClick}>
      <div className="widget-header">
        <h3>Su Tüketimi</h3>
        <span>{waterCount} / {maxWater} Bardak</span>
      </div>
      
      <div className="water-drop-container">
        <div className="water-drop">
          <motion.div 
            className="water-level"
            initial={{ height: "0%" }}
            animate={{ height: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 10 }}
          >
            <div className="water-wave"></div>
            <div className="water-wave-2"></div>
          </motion.div>
        </div>
        <p className="widget-hint">İçtiğinde dokun 💧</p>
      </div>
    </div>
  );
};
