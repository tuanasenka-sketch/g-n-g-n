import React, { useState, useEffect } from 'react';
import { X, Droplets, BookOpen, PenTool, CheckCircle } from 'lucide-react';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [moodData, setMoodData] = useState({});

  const [drawerWater, setDrawerWater] = useState(0);
  const [drawerRead, setDrawerRead] = useState(0);
  const [drawerGoal, setDrawerGoal] = useState(30);
  const [drawerTodos, setDrawerTodos] = useState([]);

  useEffect(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mood_') && !key.startsWith('mood_balls_')) {
        const dateStr = key.replace('mood_', '');
        data[dateStr] = localStorage.getItem(key);
      }
    }
    setMoodData(data);
  }, []);

  useEffect(() => {
    if (selectedDay) {
      const dateStr = selectedDay.dateStr;
      
      const waterSaved = localStorage.getItem(`hydro_${dateStr}`);
      setDrawerWater(waterSaved ? parseInt(waterSaved) : 0);

      const readSaved = localStorage.getItem(`book_read_${dateStr}`);
      const goalSaved = localStorage.getItem(`book_goal_${dateStr}`);
      setDrawerRead(readSaved ? parseInt(readSaved) : 0);
      setDrawerGoal(goalSaved ? parseInt(goalSaved) : 30);

      const todosSaved = localStorage.getItem(`todos_${dateStr}`);
      if (todosSaved) {
        try {
          setDrawerTodos(JSON.parse(todosSaved));
        } catch (e) {
          setDrawerTodos([]);
        }
      } else {
        setDrawerTodos([]);
      }
    }
  }, [selectedDay?.dateStr]);

  const handleUpdateWater = (amount) => {
    if (!selectedDay) return;
    const newWater = Math.max(0, Math.min(8, drawerWater + amount));
    setDrawerWater(newWater);
    localStorage.setItem(`hydro_${selectedDay.dateStr}`, newWater.toString());
    
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    if (selectedDay.dateStr === todayStr) {
      localStorage.setItem('hydro_data', JSON.stringify({ date: todayStr, count: newWater }));
    }
  };

  const handleUpdateRead = (amount) => {
    if (!selectedDay) return;
    const newRead = Math.max(0, drawerRead + amount);
    const delta = newRead - drawerRead;
    setDrawerRead(newRead);
    localStorage.setItem(`book_read_${selectedDay.dateStr}`, newRead.toString());
    
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    if (selectedDay.dateStr === todayStr) {
      localStorage.setItem('book_daily_data', JSON.stringify({ date: todayStr, count: newRead }));
    }

    // Proportional overall progress update for active book in localStorage
    const savedBooks = localStorage.getItem('journal_books');
    const savedActiveId = localStorage.getItem('active_book_id');
    if (savedBooks && savedActiveId) {
      try {
        const books = JSON.parse(savedBooks);
        const activeId = parseInt(savedActiveId);
        const updated = books.map(b => {
          if (b.id === activeId) {
            return {
              ...b,
              pagesRead: Math.max(0, Math.min(b.totalPages, b.pagesRead + delta))
            };
          }
          return b;
        });
        localStorage.setItem('journal_books', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const handleToggleTodo = (todoId) => {
    if (!selectedDay) return;
    const updatedTodos = drawerTodos.map(todo => 
      todo.id === todoId ? { ...todo, done: !todo.done } : todo
    );
    setDrawerTodos(updatedTodos);
    localStorage.setItem(`todos_${selectedDay.dateStr}`, JSON.stringify(updatedTodos));
    
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    if (selectedDay.dateStr === todayStr) {
      localStorage.setItem('daily_todos', JSON.stringify(updatedTodos));
    }
  };

  const getJournalForDay = (dateStr) => {
    const saved = localStorage.getItem(`journal_${dateStr}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getActiveBookTitle = () => {
    try {
      const savedBooks = localStorage.getItem('journal_books');
      const savedActiveId = localStorage.getItem('active_book_id');
      if (savedBooks) {
        const books = JSON.parse(savedBooks);
        const activeId = savedActiveId ? parseInt(savedActiveId) : 1;
        const active = books.find(b => b.id === activeId) || books[0];
        if (active) return active.title;
      }
    } catch (e) {}
    return "Atomic Habits";
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    // 0 is Sunday, 1 is Monday in JS. We want Monday to be first, so we adjust.
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    // Headers
    weekDays.forEach(day => {
      days.push(<div key={`header-${day}`} className="calendar-day-header">{day}</div>);
    });

    // Empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Get today's local date string YYYY-MM-DD
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const color = moodData[dateStr] || 'transparent';
      const hasMood = moodData[dateStr] && moodData[dateStr] !== 'transparent';
      
      let dayClass = '';
      if (dateStr === todayStr) {
        dayClass = 'today';
      } else if (dateStr < todayStr) {
        dayClass = 'past';
      } else {
        dayClass = 'future';
      }

      if (hasMood) {
        dayClass += ' has-mood';
      }
      
      days.push(
        <div 
          key={`day-${i}`} 
          className={`calendar-day ${dayClass} ${selectedDay?.dateStr === dateStr ? 'selected' : ''}`}
          onClick={() => setSelectedDay({ dateStr, day: i, color })}
        >
          <span>{i}</span>
        </div>
      );
    }

    return days;
  };

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>Zaman Tüneli</h1>
        <p>Geçmişe dönüp duygusal haritanı incele.</p>
      </div>

      <div className="calendar-container glass-panel">
        <div className="calendar-nav">
          <button className="soft-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
          <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button className="soft-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
        </div>
        
        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>

      {/* Drawer / Side Panel */}
      <div className={`day-drawer ${selectedDay ? 'open' : ''}`}>
        {selectedDay && (
          <div className="drawer-content">
            <button className="close-drawer-btn" onClick={() => setSelectedDay(null)}>
              <X size={24} />
            </button>
            
            <div className="drawer-header">
              {(() => {
                const currentMoodColor = moodData[selectedDay.dateStr] || 'transparent';
                return (
                  <div 
                    className="drawer-mood-color" 
                    style={{ 
                      backgroundColor: currentMoodColor !== 'transparent' ? currentMoodColor : '#eee',
                      color: currentMoodColor !== 'transparent' ? currentMoodColor : 'transparent',
                      boxShadow: currentMoodColor !== 'transparent' ? `0 0 15px ${currentMoodColor}` : 'none'
                    }}
                  ></div>
                );
              })()}
              <h3>{selectedDay.day} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            </div>

            <div className="drawer-sections">
              <div className="drawer-section glass-panel">
                <h4><Droplets size={16} /> Su Tüketimi</h4>
                <div className="drawer-interactive-row">
                  <p>{drawerWater} / 8 Bardak</p>
                  <div className="drawer-btn-group">
                    <button className="drawer-action-btn" onClick={() => handleUpdateWater(-1)}>-</button>
                    <button className="drawer-action-btn" onClick={() => handleUpdateWater(1)}>+</button>
                  </div>
                </div>
              </div>
              
              <div className="drawer-section glass-panel">
                <h4><CheckCircle size={16} /> Tamamlananlar</h4>
                {drawerTodos.length > 0 ? (
                  <ul>
                    {drawerTodos.map(todo => (
                      <li 
                        key={todo.id} 
                        className={`drawer-todo-item ${todo.done ? 'todo-done' : ''}`}
                        onClick={() => handleToggleTodo(todo.id)}
                      >
                        <span className="drawer-todo-checkbox">{todo.done ? '✅' : '⬜'}</span>
                        <span className="drawer-todo-text">{todo.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">Bugün için kaydedilmiş bir odak bulunmuyor.</p>
                )}
              </div>

              <div className="drawer-section glass-panel">
                <h4><BookOpen size={16} /> Okuma</h4>
                <div className="drawer-interactive-row">
                  <p>{getActiveBookTitle()}: {drawerRead} / {drawerGoal} Sayfa</p>
                  <div className="drawer-btn-group">
                    <button className="drawer-action-btn" onClick={() => handleUpdateRead(-1)}>-</button>
                    <button className="drawer-action-btn" onClick={() => handleUpdateRead(1)}>+</button>
                  </div>
                </div>
              </div>

              {(() => {
                const journal = getJournalForDay(selectedDay.dateStr);
                return (
                  <div className="drawer-section glass-panel journal-section">
                    <h4><PenTool size={16} /> Günlük Özeti</h4>
                    {journal ? (
                      <div className="drawer-journal-content">
                        {journal.stickers && journal.stickers.length > 0 && (
                          <div className="drawer-stickers-row">
                            {journal.stickers.map(s => (
                              <span 
                                key={s.id} 
                                className={`drawer-sticker-emoji animate-${s.animation}`}
                                title={s.name}
                              >
                                {s.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        <h5 className="drawer-journal-title">{journal.title || 'Başlıksız Günlük'}</h5>
                        <p className="journal-snippet">"{journal.content}"</p>
                      </div>
                    ) : (
                      <p className="journal-snippet empty-text">Bugün için henüz bir günlük yazılmamış.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay for Drawer */}
      {selectedDay && <div className="drawer-overlay" onClick={() => setSelectedDay(null)}></div>}
    </div>
  );
};

export default Calendar;
