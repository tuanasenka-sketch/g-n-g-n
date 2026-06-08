import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import './Library.css';

const Library = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('journal_books');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const defaultBooks = [
      { id: 1, title: 'Atomic Habits', author: 'James Clear', pagesRead: 120, totalPages: 320, color: '#F2B5B5' },
      { id: 2, title: 'Design of Everyday Things', author: 'Don Norman', pagesRead: 45, totalPages: 368, color: '#B3C5D7' }
    ];
    localStorage.setItem('journal_books', JSON.stringify(defaultBooks));
    return defaultBooks;
  });

  const [activeBookId, setActiveBookId] = useState(() => {
    const saved = localStorage.getItem('active_book_id');
    return saved ? parseInt(saved) : 1;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Add Book Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTotal, setNewTotal] = useState('');
  const [newColor, setNewColor] = useState('#C5D3A8');

  // Edit Book state
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editTotal, setEditTotal] = useState('');
  const [editColor, setEditColor] = useState('');

  const pastelColors = ['#F9F1A5', '#B3C5D7', '#F2B5B5', '#C5D3A8', '#D6C7E8'];

  const saveBooks = (updatedBooks) => {
    setBooks(updatedBooks);
    localStorage.setItem('journal_books', JSON.stringify(updatedBooks));
  };

  const handleSetActiveBook = (id) => {
    setActiveBookId(id);
    localStorage.setItem('active_book_id', id.toString());
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newTitle || !newTotal) return;

    const newBook = {
      id: Date.now(),
      title: newTitle,
      author: newAuthor,
      pagesRead: 0,
      totalPages: parseInt(newTotal),
      color: newColor
    };

    const updated = [...books, newBook];
    saveBooks(updated);
    
    // Set as active if it's the only book
    if (updated.length === 1) {
      handleSetActiveBook(newBook.id);
    }

    setShowAddForm(false);
    setNewTitle('');
    setNewAuthor('');
    setNewTotal('');
  };

  const startEditBook = (book) => {
    setEditTitle(book.title);
    setEditAuthor(book.author || '');
    setEditTotal(book.totalPages);
    setEditColor(book.color);
    setIsEditing(true);
  };

  const handleUpdateBook = (e) => {
    e.preventDefault();
    if (!selectedBook || !editTitle || !editTotal) return;

    const updated = books.map(b => {
      if (b.id === selectedBook.id) {
        return {
          ...b,
          title: editTitle,
          author: editAuthor,
          totalPages: parseInt(editTotal),
          pagesRead: Math.min(b.pagesRead, parseInt(editTotal)),
          color: editColor
        };
      }
      return b;
    });

    saveBooks(updated);
    setSelectedBook(updated.find(b => b.id === selectedBook.id));
    setIsEditing(false);
  };

  const handleUpdateProgress = (pages) => {
    if (!selectedBook) return;
    const newPagesRead = Math.max(0, Math.min(selectedBook.totalPages, pages));
    
    const updated = books.map(b => {
      if (b.id === selectedBook.id) {
        return { ...b, pagesRead: newPagesRead };
      }
      return b;
    });

    saveBooks(updated);
    
    // Calculate difference (delta) of read pages to sync with today's daily count
    const delta = newPagesRead - selectedBook.pagesRead;
    setSelectedBook(prev => ({ ...prev, pagesRead: newPagesRead }));

    // If this book is active, also sync with today's daily count
    if (selectedBook.id === activeBookId) {
      const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
      
      const todayReadSaved = localStorage.getItem(`book_read_${today}`);
      const todayRead = todayReadSaved ? parseInt(todayReadSaved) : 0;
      const newTodayRead = Math.max(0, todayRead + delta);
      
      localStorage.setItem(`book_read_${today}`, newTodayRead.toString());
      localStorage.setItem('book_daily_data', JSON.stringify({ date: today, count: newTodayRead }));
    }
  };

  const handleDeleteBook = (bookId) => {
    if (!window.confirm("Bu kitabı silmek istediğinize emin misiniz?")) return;

    const updated = books.filter(b => b.id !== bookId);
    saveBooks(updated);
    
    if (activeBookId === bookId) {
      if (updated.length > 0) {
        handleSetActiveBook(updated[0].id);
      } else {
        localStorage.removeItem('active_book_id');
        setActiveBookId(null);
      }
    }
    
    setSelectedBook(null);
    setIsEditing(false);
  };

  // Dynamically fetch weekly read history based on date strings YYYY-MM-DD
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
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

  const weekDates = getWeekDates();
  const weeklyMoodData = weekDates.map(({ day, dateStr }) => {
    const saved = localStorage.getItem(`mood_${dateStr}`);
    let balls = [];
    try {
      const savedBalls = localStorage.getItem(`mood_balls_${dateStr}`);
      if (savedBalls) {
        balls = JSON.parse(savedBalls);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      day,
      dateStr,
      color: saved || 'transparent',
      balls
    };
  });

  return (
    <div className="library-page">
      <div className="library-header">
        <div>
          <h1>Kitaplığım</h1>
          <p>Okuma alışkanlıkların ve yolculuğun.</p>
        </div>
        <button className="soft-btn add-book-btn" onClick={() => setShowAddForm(true)}>
          <Plus size={18} />
          Yeni Kitap
        </button>
      </div>

      {showAddForm && createPortal(
        <div className="add-book-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="glass-panel add-book-modal animate-slide-down" onClick={e => e.stopPropagation()}>
            <h2>Yeni Kitap Ekle</h2>
            <form onSubmit={handleAddBook}>
              <input type="text" placeholder="Kitap Adı" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              <input type="text" placeholder="Yazar Adı" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} />
              <input type="number" placeholder="Toplam Sayfa" value={newTotal} onChange={e => setNewTotal(e.target.value)} required />
              
              <div className="color-picker">
                <p>Kapak Rengi Seç:</p>
                <div className="color-options">
                  {pastelColors.map(color => (
                    <div 
                      key={color} 
                      className={`color-circle ${newColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="soft-btn cancel-btn" onClick={() => setShowAddForm(false)}>İptal</button>
                <button type="submit" className="soft-btn save-btn">Ekle</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedBook && createPortal(
        <div className="book-detail-modal-overlay" onClick={() => { setSelectedBook(null); setIsEditing(false); }}>
          <div className="glass-panel book-detail-modal animated-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setSelectedBook(null); setIsEditing(false); }}>×</button>
            
            <div className="modal-two-col">
              {/* Left Column: Book cover preview */}
              <div className="book-cover-large-wrapper">
                <div className="book-cover-large" style={{ backgroundColor: isEditing ? editColor : selectedBook.color }}>
                  <div className="book-spine-detail-large"></div>
                  <h4 className="book-cover-large-title">{isEditing ? editTitle : selectedBook.title}</h4>
                  <p className="book-cover-large-author">{isEditing ? editAuthor : selectedBook.author}</p>
                </div>
              </div>

              {/* Right Column: Book Details and Progress */}
              <div className="book-detail-info">
                {isEditing ? (
                  <form onSubmit={handleUpdateBook} className="book-edit-form">
                    <h3>Kitap Detaylarını Düzenle</h3>
                    <div className="input-group">
                      <label>Kitap Adı</label>
                      <input type="text" placeholder="Kitap Adı" value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label>Yazar</label>
                      <input type="text" placeholder="Yazar" value={editAuthor} onChange={e => setEditAuthor(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>Toplam Sayfa</label>
                      <input type="number" placeholder="Toplam Sayfa" value={editTotal} onChange={e => setEditTotal(e.target.value)} required />
                    </div>
                    
                    <div className="color-picker">
                      <p>Kapak Rengi Seç:</p>
                      <div className="color-options">
                        {pastelColors.map(color => (
                          <div 
                            key={color} 
                            className={`color-circle ${editColor === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setEditColor(color)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button type="button" className="soft-btn cancel-btn" onClick={() => setIsEditing(false)}>İptal</button>
                      <button type="submit" className="soft-btn save-btn">Değişiklikleri Kaydet</button>
                    </div>
                  </form>
                ) : (
                  <div className="book-view-details">
                    <h3>{selectedBook.title}</h3>
                    {selectedBook.author && <p className="book-author-text">Yazar: <strong>{selectedBook.author}</strong></p>}
                    
                    <div className="book-modal-status">
                      {selectedBook.id === activeBookId ? (
                        <span className="badge active-badge">📖 Şu An Okunuyor (Aktif)</span>
                      ) : (
                        <button className="soft-btn active-set-btn" onClick={() => handleSetActiveBook(selectedBook.id)}>
                          Aktif Okuma Olarak Seç
                        </button>
                      )}
                    </div>

                    <div className="book-progress-section">
                      <div className="progress-text-row">
                        <span>İlerleme:</span>
                        <strong>{selectedBook.pagesRead} / {selectedBook.totalPages} Sayfa</strong>
                        <span>({Math.round((selectedBook.pagesRead / selectedBook.totalPages) * 100)}%)</span>
                      </div>
                      
                      <div className="progress-bar-bg-large">
                        <div 
                          className="progress-bar-fill-large" 
                          style={{ width: `${Math.min((selectedBook.pagesRead / selectedBook.totalPages) * 100, 100)}%` }}
                        ></div>
                      </div>

                      <div className="progress-adjuster-controls">
                        <label className="slider-label">Sayfa Numarasını Ayarla:</label>
                        <input 
                          type="range" 
                          min="0" 
                          max={selectedBook.totalPages} 
                          value={selectedBook.pagesRead} 
                          onChange={(e) => handleUpdateProgress(parseInt(e.target.value))}
                          className="progress-slider"
                        />
                        
                        <div className="progress-btn-group">
                          <button className="soft-btn step-btn" onClick={() => handleUpdateProgress(selectedBook.pagesRead - 10)}>-10 S.</button>
                          <button className="soft-btn step-btn" onClick={() => handleUpdateProgress(selectedBook.pagesRead - 1)}>-1 S.</button>
                          <button className="soft-btn step-btn" onClick={() => handleUpdateProgress(selectedBook.pagesRead + 1)}>+1 S.</button>
                          <button className="soft-btn step-btn" onClick={() => handleUpdateProgress(selectedBook.pagesRead + 10)}>+10 S.</button>
                        </div>
                      </div>
                    </div>

                    <div className="book-details-action-buttons">
                      <button className="soft-btn edit-btn" onClick={() => startEditBook(selectedBook)}>✍️ Düzenle</button>
                      <button className="soft-btn delete-btn" onClick={() => handleDeleteBook(selectedBook.id)}>🗑️ Kitaplığımdan Sil</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="bookshelf">
        <h2>Şu An Okunanlar</h2>
        <div className="shelf-container">
          {books.length > 0 ? (
            books.map(book => (
              <div 
                key={book.id} 
                className={`book-spine ${activeBookId === book.id ? 'active-spine' : ''}`} 
                style={{ backgroundColor: book.color }}
                onClick={() => setSelectedBook(book)}
                role="button"
                tabIndex={0}
                title={`${book.title} - Tıkla ve İlerlemeyi Düzenle`}
              >
                {activeBookId === book.id && <div className="active-book-indicator" title="Aktif Okuma">📖</div>}
                <div className="book-title-vertical">{book.title}</div>
                <div className="book-progress-badge">
                  {book.pagesRead} / {book.totalPages}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-shelf-text">Kitaplığınız henüz boş. "Yeni Kitap" ekleyerek başlayın!</div>
          )}
        </div>
        <div className="shelf-board"></div>
      </div>

      <div className="glass-panel weekly-mood-jars">
        <h2>Haftalık Duygu Kavanozları</h2>
        <p className="widget-hint">Bu hafta kaydettiğin günlük duygu harmanlarını kavanozlarda incele.</p>
        <div className="mini-jars-row">
          {weeklyMoodData.map((data, index) => {
            const hasMood = data.color && data.color !== 'transparent';
            return (
              <div 
                key={index} 
                className={`mini-jar-column ${hasMood ? 'has-mood' : 'empty-jar'}`}
                onClick={() => !hasMood && navigate('/mood-jar')}
                title={hasMood ? `${data.day}: Duygu Kaydedildi` : `${data.day}: Henüz duygu eklenmemiş. Eklemek için tıklayın!`}
              >
                <div className="mini-jar-container">
                  <div className="mini-jar-glass">
                    {hasMood ? (
                      <>
                        <div 
                          className="mini-jar-liquid"
                          style={{ 
                            background: `linear-gradient(to top, ${data.color.replace(/[\d.]+\)$/, '0.15)')} 0%, transparent 100%)` 
                          }}
                        />
                        <div className="mini-jar-balls-container">
                          {data.balls.map((ball, bIdx) => {
                            const isHybrid = ball.color1 !== ball.color2;
                            const ballBg = isHybrid 
                              ? `radial-gradient(circle at 35% 35%, #ffffff 0%, ${ball.color1} 40%, ${ball.color2} 100%)`
                              : `radial-gradient(circle at 35% 35%, #ffffff 0%, ${ball.color1} 70%)`;
                            return (
                              <div 
                                key={bIdx}
                                className="mini-jar-ball"
                                style={{ background: ballBg }}
                              />
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="mini-jar-empty-plus">+</div>
                    )}
                    <div className="mini-jar-highlight"></div>
                  </div>
                </div>
                <span className="jar-label">{data.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Library;
