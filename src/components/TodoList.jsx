import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit2, X, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import './DashboardComponents.css';

export const TodoList = () => {
  // Load tasks from localStorage (or reset daily if desired? User didn't explicitly ask for todo reset, but standard habit is to keep tasks until checked or deleted, or reset checks daily. Let's reset checks daily but keep tasks).
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('daily_todos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If we want checkboxes to reset daily, we check date:
        const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        const lastSavedDate = localStorage.getItem('todos_date');
        
        if (lastSavedDate !== today) {
          // Reset 'done' status for a new day
          localStorage.setItem('todos_date', today);
          return parsed.map(t => ({ ...t, done: false }));
        }
        return parsed;
      } catch (e) {}
    }
    
    // Default fallback
    localStorage.setItem('todos_date', `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`);
    return [
      { id: 1, text: "Gelen kutusunu temizle", done: false },
      { id: 2, text: "Proje planını gözden geçir", done: false },
      { id: 3, text: "30 dakika yürüyüş", done: false }
    ];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState("");

  // Save to localStorage whenever todos change
  useEffect(() => {
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    localStorage.setItem('daily_todos', JSON.stringify(todos));
    localStorage.setItem(`todos_${today}`, JSON.stringify(todos));
  }, [todos]);

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask("");
  };

  const handleRemoveTask = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newTodos = [...todos];
    const temp = newTodos[index];
    newTodos[index] = newTodos[index - 1];
    newTodos[index - 1] = temp;
    setTodos(newTodos);
  };

  const moveDown = (index) => {
    if (index === todos.length - 1) return;
    const newTodos = [...todos];
    const temp = newTodos[index];
    newTodos[index] = newTodos[index + 1];
    newTodos[index + 1] = temp;
    setTodos(newTodos);
  };

  return (
    <div className="glass-panel widget todo-widget">
      <div className="widget-header clickable-header" onClick={() => setIsEditing(true)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3>Günün Odakları</h3>
          <Edit2 size={14} className="edit-icon" />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Düzenle</span>
      </div>
      
      <div className="todo-list">
        {todos.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Henüz odak eklenmedi.</p>}
        {todos.map(todo => (
          <motion.div 
            key={todo.id} 
            className={`todo-item ${todo.done ? 'done' : ''}`}
            onClick={() => toggleTodo(todo.id)}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`checkbox ${todo.done ? 'checked' : ''}`}>
              <AnimatePresence>
                {todo.done && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Check size={14} color="white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="todo-text">{todo.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Editing Modal */}
      {isEditing && createPortal(
        <div className="todo-modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="glass-panel todo-modal" onClick={e => e.stopPropagation()}>
            <div className="todo-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Odaklarını Düzenle</h3>
              <button className="soft-btn" style={{ padding: '6px' }} onClick={() => setIsEditing(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="todo-add-form">
              <input 
                type="text" 
                value={newTask} 
                onChange={e => setNewTask(e.target.value)} 
                placeholder="Yeni bir odak ekle..." 
                autoFocus
              />
              <button type="submit" className="soft-btn add-task-btn">
                <Plus size={18} />
              </button>
            </form>

            <div className="todo-edit-list">
              {todos.map((todo, index) => (
                <div key={todo.id} className="todo-edit-item">
                  <span className="todo-edit-text">{todo.text}</span>
                  <div className="todo-actions">
                    <button onClick={() => moveUp(index)} className="reorder-btn" disabled={index === 0}>
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => moveDown(index)} className="reorder-btn" disabled={index === todos.length - 1}>
                      <ChevronDown size={16} />
                    </button>
                    <button onClick={() => handleRemoveTask(todo.id)} className="remove-btn">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="soft-btn save-btn" onClick={() => setIsEditing(false)} style={{ width: '100%', flexShrink: 0, background: 'var(--color-btn-active-bg)', color: 'var(--color-btn-text)' }}>
              Tamamla
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
