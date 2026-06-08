import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HydroTracker } from '../components/HydroTracker';
import { BookProgress } from '../components/BookProgress';
import { TodoList } from '../components/TodoList';
import { Sparkles } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ onOpenCoverDesign }) => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Günaydın! ☀️');
      else if (hour >= 12 && hour < 18) setGreeting('İyi Günler ✨');
      else if (hour >= 18 && hour < 22) setGreeting('İyi Akşamlar 🌙');
      else setGreeting('İyi Geceler 😴');
    };
    
    updateGreeting();
    // Update greeting every minute to ensure it stays accurate if tab is left open
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
          <div>
            <h1>{greeting}</h1>
            <p>Bugün harika bir gün olacak.</p>
          </div>
          <button 
            className="soft-btn" 
            style={{ fontSize: '0.82rem', padding: '8px 16px', border: '1px solid rgba(25, 118, 210, 0.2)' }}
            onClick={onOpenCoverDesign}
          >
            🎨 Kapak Tasarımı
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-col">
          <HydroTracker />
          <BookProgress />
        </div>
        <div className="dashboard-col">
          <TodoList />
          
          <div className="glass-panel widget mood-prompt-widget">
            <div className="mood-prompt-content">
              <h3>Bugün nasıl hissediyorsun?</h3>
              <p>Duygularını kavanoza ekle ve gününü renklendir.</p>
              <button 
                className="soft-btn mood-btn"
                onClick={() => navigate('/mood-jar')}
              >
                <Sparkles size={18} />
                <span>Duygu Kavanozuna Git</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
