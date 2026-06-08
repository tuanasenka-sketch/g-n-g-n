import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Check } from 'lucide-react';
import './DashboardComponents.css';

export const BookProgress = () => {
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('journal_books');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 1, title: 'Atomic Habits', author: 'James Clear', pagesRead: 120, totalPages: 320, color: '#F2B5B5' },
      { id: 2, title: 'Design of Everyday Things', author: 'Don Norman', pagesRead: 45, totalPages: 368, color: '#B3C5D7' }
    ];
  });

  const [activeId, setActiveId] = useState(() => {
    const saved = localStorage.getItem('active_book_id');
    if (saved) return parseInt(saved);
    return books.length > 0 ? books[0].id : null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('book_daily_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        if (parsed.date === today) {
          return parsed.count;
        }
      } catch (e) {}
    }
    return 0;
  });

  const [goalPage, setGoalPage] = useState(() => {
    const saved = localStorage.getItem('book_daily_goal');
    return saved ? parseInt(saved) : 30;
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goalPage);

  // Sync state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedBooks = localStorage.getItem('journal_books');
      if (savedBooks) {
        try {
          setBooks(JSON.parse(savedBooks));
        } catch (e) {}
      }
      const savedActive = localStorage.getItem('active_book_id');
      if (savedActive) {
        setActiveId(parseInt(savedActive));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also run once to check for updates when component mounts or activeId changes
    handleStorageChange();
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeId]);

  const activeBook = books.find(b => b.id === activeId) || books[0] || null;
  const bookTitle = activeBook ? activeBook.title : "Kitap Bulunamadı";
  
  const percentage = Math.min((currentPage / goalPage) * 100, 100);

  useEffect(() => {
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    localStorage.setItem('book_daily_data', JSON.stringify({ date: today, count: currentPage }));
    localStorage.setItem(`book_read_${today}`, currentPage.toString());
    localStorage.setItem(`book_goal_${today}`, goalPage.toString());
  }, [currentPage, goalPage]);

  const incrementPage = () => {
    if (!activeBook) return;
    if (activeBook.pagesRead >= activeBook.totalPages) return;

    setCurrentPage(prev => prev + 1);

    // Increment selected book's overall progress
    const updatedBooks = books.map(b => {
      if (b.id === activeBook.id) {
        return { ...b, pagesRead: b.pagesRead + 1 };
      }
      return b;
    });
    setBooks(updatedBooks);
    localStorage.setItem('journal_books', JSON.stringify(updatedBooks));
  };

  const handleSaveGoal = () => {
    const parsed = parseInt(tempGoal);
    if (!isNaN(parsed) && parsed > 0) {
      setGoalPage(parsed);
    }
    setIsEditingGoal(false);
  };

  const handleSelectBook = (e) => {
    const id = parseInt(e.target.value);
    setActiveId(id);
    localStorage.setItem('active_book_id', id.toString());
  };

  return (
    <div className="glass-panel widget book-widget">
      <div className="widget-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <h3>Günün Okuması</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {books.length > 0 && (
            <select 
              value={activeId || ''} 
              onChange={handleSelectBook}
              className="dashboard-book-select"
              title="Okumak istediğiniz kitabı seçin"
            >
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          )}
          <button 
            className="soft-btn" 
            onClick={incrementPage} 
            disabled={!activeBook || activeBook.pagesRead >= activeBook.totalPages}
            style={{ padding: '6px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Okunan sayfa sayısını artır"
          >
            <Plus size={16} /> <span>1 Sayfa</span>
          </button>
        </div>
      </div>
      <div className="book-info">
        <h4 style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <span>📖 {bookTitle}</span>
          {activeBook && (
            <span className="book-mini-progress">
              ({activeBook.pagesRead} / {activeBook.totalPages} S.)
            </span>
          )}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <p>Günlük Hedef: {currentPage} / </p>
          {isEditingGoal ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="number" 
                value={tempGoal} 
                onChange={e => setTempGoal(e.target.value)} 
                style={{ width: '50px', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
                autoFocus
                onBlur={handleSaveGoal}
                onKeyDown={e => e.key === 'Enter' && handleSaveGoal()}
              />
              <button className="soft-btn" onClick={handleSaveGoal} style={{ padding: '4px' }}><Check size={14}/></button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setIsEditingGoal(true)}>
              <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>{goalPage} Sayfa</p>
              <Edit2 size={12} color="var(--text-light)" />
            </div>
          )}
        </div>
      </div>
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
