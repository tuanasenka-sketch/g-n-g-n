import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import {
  playClick,
  playToggleOn,
  playToggleOff,
  playSuccess,
  playDelete,
  playPick,
  playExport,
} from '../utils/sound';

const AVATAR_EMOJIS = ['🌸', '🌙', '⭐', '🦋', '🌿', '🍀', '🌺', '🐱', '🦊', '🐝', '🌈', '✨'];

const Profile = () => {
  // ── User Info ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('journal_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { name: 'Kullanıcı', email: '' };
  });
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editBirthday, setEditBirthday] = useState(() => localStorage.getItem('profile_birthday') || '');
  const [editBio, setEditBio] = useState(() => localStorage.getItem('profile_bio') || '');
  const [savedMsg, setSavedMsg] = useState('');

  // ── Avatar ──────────────────────────────────────────────────────────────────
  const [avatar, setAvatar] = useState(() => localStorage.getItem('profile_avatar') || '🌸');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // ── Preferences ────────────────────────────────────────────────────────────
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('pref_notif') === 'true');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('pref_sound') !== 'false');
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem('pref_reminder_time') || '20:00');
  const [language, setLanguage] = useState(() => localStorage.getItem('pref_language') || 'tr');
  const [weekStart, setWeekStart] = useState(() => localStorage.getItem('pref_week_start') || 'monday');

  // ── Stats ───────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalDays: 0, journalEntries: 0, moodDays: 0, waterDays: 0 });

  useEffect(() => {
    let moodDays = 0;
    let journalEntries = 0;
    let waterDays = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mood_') && !key.startsWith('mood_balls_')) moodDays++;
      if (key && key.startsWith('journal_entry_')) journalEntries++;
      if (key && key.startsWith('hydro_')) waterDays++;
    }
    const totalDays = Math.max(moodDays, journalEntries, waterDays);
    setStats({ totalDays, journalEntries, moodDays, waterDays });
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    playSuccess();
    const updatedUser = { name: editName, email: editEmail };
    setUser(updatedUser);
    localStorage.setItem('journal_user', JSON.stringify(updatedUser));
    localStorage.setItem('profile_birthday', editBirthday);
    localStorage.setItem('profile_bio', editBio);
    setEditMode(false);
    setSavedMsg('Bilgiler kaydedildi! ✓');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleOpenEdit = () => {
    playClick();
    setEditName(user.name);
    setEditEmail(user.email || '');
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    playClick();
    setEditMode(false);
  };

  const handleAvatarBtnClick = () => {
    playClick();
    setShowAvatarPicker(v => !v);
  };

  const handleAvatarSelect = (emoji) => {
    playPick();
    setAvatar(emoji);
    localStorage.setItem('profile_avatar', emoji);
    setShowAvatarPicker(false);
  };

  // Sound-aware toggle: plays ON/OFF sound, but the sound toggle itself
  // plays sounds only when turning ON (turning OFF would be silent — intentionally).
  const handlePrefToggle = (pref, setter, storageKey) => {
    const newVal = !pref;
    setter(newVal);
    localStorage.setItem(storageKey, newVal.toString());

    if (storageKey === 'pref_sound') {
      // Turning sound ON → play a welcome jingle; turning OFF → silent (that's the whole point)
      if (newVal) playToggleOn();
    } else {
      // For all other toggles respect the current sound setting
      if (newVal) playToggleOn();
      else playToggleOff();
    }
  };

  const handleClearAllData = () => {
    playDelete();
    if (window.confirm('Tüm verilerinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      const userInfo = localStorage.getItem('journal_user');
      const profileAvatar = localStorage.getItem('profile_avatar');
      const profileBio = localStorage.getItem('profile_bio');
      const profileBirthday = localStorage.getItem('profile_birthday');
      localStorage.clear();
      if (userInfo) localStorage.setItem('journal_user', userInfo);
      if (profileAvatar) localStorage.setItem('profile_avatar', profileAvatar);
      if (profileBio) localStorage.setItem('profile_bio', profileBio);
      if (profileBirthday) localStorage.setItem('profile_birthday', profileBirthday);
      setSavedMsg('Tüm veriler silindi.');
      setTimeout(() => setSavedMsg(''), 3000);
      setStats({ totalDays: 0, journalEntries: 0, moodDays: 0, waterDays: 0 });
    }
  };

  const handleExportData = () => {
    playExport();
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayday_verilerim_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedMsg('Veriler dışa aktarıldı! ✓');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleImportClick = () => {
    playClick();
    importRef.current?.click();
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        playSuccess();
        setSavedMsg('Veriler içe aktarıldı! ✓');
        setTimeout(() => setSavedMsg(''), 3000);
        window.location.reload();
      } catch (err) {
        setSavedMsg('Dosya okunamadı.');
        setTimeout(() => setSavedMsg(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    playClick();
    localStorage.removeItem('journal_remember_me');
    localStorage.removeItem('journal_onboarding_complete');
    window.location.reload();
  };

  // ── Streak calculation ─────────────────────────────────────────────────────
  const getStreak = () => {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (localStorage.getItem(`mood_${dateStr}`) || localStorage.getItem(`journal_entry_${dateStr}`)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };
  const streak = getStreak();

  const importRef = useRef(null);

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header-section">
        <h1 className="profile-page-title">Bilgilerim</h1>
        <p className="profile-page-subtitle">Profilini düzenle, tercihlerini yönet</p>
      </div>

      {savedMsg && <div className="profile-toast">{savedMsg}</div>}

      <div className="profile-grid">

        {/* ── Card 1: Avatar + User Info ─────────────────────────────────── */}
        <div className="profile-card profile-card-identity">
          <div className="profile-avatar-wrapper">
            <button
              className="profile-avatar-btn"
              onClick={handleAvatarBtnClick}
              title="Avatar değiştir"
            >
              <span className="profile-avatar-emoji">{avatar}</span>
              <span className="profile-avatar-edit-icon">✎</span>
            </button>
            {showAvatarPicker && (
              <div className="avatar-picker-dropdown">
                <p className="avatar-picker-label">Avatar seç</p>
                <div className="avatar-picker-grid">
                  {AVATAR_EMOJIS.map(em => (
                    <button
                      key={em}
                      className={`avatar-option-btn ${avatar === em ? 'selected' : ''}`}
                      onClick={() => handleAvatarSelect(em)}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!editMode ? (
            <div className="profile-identity-info">
              <h2 className="profile-display-name">{user.name}</h2>
              {user.email && <p className="profile-display-email">{user.email}</p>}
              {editBirthday && <p className="profile-display-meta">🎂 {editBirthday}</p>}
              {editBio && <p className="profile-display-bio">"{editBio}"</p>}
              <button className="profile-edit-btn" onClick={handleOpenEdit}>
                ✎ Bilgileri Düzenle
              </button>
            </div>
          ) : (
            <div className="profile-edit-form">
              <div className="profile-form-group">
                <label>Ad Soyad</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Adın" />
              </div>
              <div className="profile-form-group">
                <label>E-posta</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="ornek@eposta.com" />
              </div>
              <div className="profile-form-group">
                <label>Doğum Tarihi</label>
                <input type="date" value={editBirthday} onChange={e => setEditBirthday(e.target.value)} />
              </div>
              <div className="profile-form-group">
                <label>Hakkımda</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Kendini kısaca anlat..." rows={2} maxLength={120} />
              </div>
              <div className="profile-form-actions">
                <button className="profile-save-btn" onClick={handleSaveProfile}>💾 Kaydet</button>
                <button className="profile-cancel-btn" onClick={handleCancelEdit}>İptal</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Card 2: Stats ──────────────────────────────────────────────── */}
        <div className="profile-card profile-card-stats">
          <h3 className="profile-card-title">📊 İstatistiklerim</h3>
          <div className="stats-grid">
            <div className="stat-item stat-streak">
              <span className="stat-value">{streak}</span>
              <span className="stat-label">Günlük Seri 🔥</span>
            </div>
            <div className="stat-item stat-mood">
              <span className="stat-value">{stats.moodDays}</span>
              <span className="stat-label">Kaydedilen Duygu</span>
            </div>
            <div className="stat-item stat-journal">
              <span className="stat-value">{stats.journalEntries}</span>
              <span className="stat-label">Günlük Yazısı</span>
            </div>
            <div className="stat-item stat-water">
              <span className="stat-value">{stats.waterDays}</span>
              <span className="stat-label">Su Takip Günü</span>
            </div>
          </div>
        </div>

        {/* ── Card 3: Preferences ────────────────────────────────────────── */}
        <div className="profile-card profile-card-prefs">
          <h3 className="profile-card-title">⚙️ Tercihlerim</h3>
          <div className="pref-list">

            {/* Notifications */}
            <div className="pref-row">
              <div className="pref-label-group">
                <span className="pref-icon">🔔</span>
                <div>
                  <span className="pref-name">Bildirimler</span>
                  <span className="pref-desc">Günlük hatırlatıcılar</span>
                </div>
              </div>
              <button
                className={`toggle-btn ${notifEnabled ? 'on' : ''}`}
                onClick={() => handlePrefToggle(notifEnabled, setNotifEnabled, 'pref_notif')}
                aria-label="Bildirimleri aç/kapat"
              >
                <span className="toggle-knob" />
              </button>
            </div>

            {notifEnabled && (
              <div className="pref-row pref-row-sub animate-slide-down">
                <span className="pref-icon">🕐</span>
                <label className="pref-name">Hatırlatma Saati</label>
                <input
                  type="time"
                  value={reminderTime}
                  className="pref-time-input"
                  onChange={e => {
                    playClick();
                    setReminderTime(e.target.value);
                    localStorage.setItem('pref_reminder_time', e.target.value);
                  }}
                />
              </div>
            )}

            {/* Sound Effects */}
            <div className="pref-row">
              <div className="pref-label-group">
                <span className="pref-icon">{soundEnabled ? '🔊' : '🔇'}</span>
                <div>
                  <span className="pref-name">Ses Efektleri</span>
                  <span className="pref-desc">
                    {soundEnabled ? 'Açık — butonlar ses çıkarıyor' : 'Kapalı — sessiz mod'}
                  </span>
                </div>
              </div>
              <button
                className={`toggle-btn ${soundEnabled ? 'on' : ''}`}
                onClick={() => handlePrefToggle(soundEnabled, setSoundEnabled, 'pref_sound')}
                aria-label="Ses aç/kapat"
              >
                <span className="toggle-knob" />
              </button>
            </div>


            {/* Language */}
            <div className="pref-row">
              <div className="pref-label-group">
                <span className="pref-icon">🌍</span>
                <div>
                  <span className="pref-name">Dil</span>
                  <span className="pref-desc">Uygulama dili</span>
                </div>
              </div>
              <select
                className="pref-select"
                value={language}
                onChange={e => {
                  playClick();
                  setLanguage(e.target.value);
                  localStorage.setItem('pref_language', e.target.value);
                }}
              >
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            {/* Week start */}
            <div className="pref-row">
              <div className="pref-label-group">
                <span className="pref-icon">📅</span>
                <div>
                  <span className="pref-name">Hafta Başlangıcı</span>
                  <span className="pref-desc">İlk gün ayarı</span>
                </div>
              </div>
              <select
                className="pref-select"
                value={weekStart}
                onChange={e => {
                  playClick();
                  setWeekStart(e.target.value);
                  localStorage.setItem('pref_week_start', e.target.value);
                }}
              >
                <option value="monday">Pazartesi</option>
                <option value="sunday">Pazar</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Card 4: Data Management ─────────────────────────────────────── */}
        <div className="profile-card profile-card-data">
          <h3 className="profile-card-title">💾 Veri Yönetimi</h3>
          <p className="profile-card-desc">Verilerini dışa aktarabilir, yedekten geri yükleyebilir veya sıfırlayabilirsin.</p>
          <div className="data-btn-list">
            <button className="data-action-btn export-btn" onClick={handleExportData}>
              <span className="data-btn-icon">📤</span>
              <div>
                <span className="data-btn-title">Dışa Aktar</span>
                <span className="data-btn-sub">JSON olarak indir</span>
              </div>
            </button>

            <button className="data-action-btn import-btn" onClick={handleImportClick}>
              <span className="data-btn-icon">📥</span>
              <div>
                <span className="data-btn-title">İçe Aktar</span>
                <span className="data-btn-sub">Yedeği geri yükle</span>
              </div>
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportData} />

            <button className="data-action-btn clear-btn" onClick={handleClearAllData}>
              <span className="data-btn-icon">🗑️</span>
              <div>
                <span className="data-btn-title">Verileri Temizle</span>
                <span className="data-btn-sub">Tüm kayıtları sil</span>
              </div>
            </button>
          </div>
        </div>

        {/* ── Card 5: About ───────────────────────────────────────────────── */}
        <div className="profile-card profile-card-about">
          <div className="about-logo-row">
            <svg viewBox="0 0 100 60" className="about-logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="30" r="14" fill="#FFE5D9" opacity="0.6" />
              <circle cx="55" cy="34" r="12" fill="#E8F5E9" opacity="0.6" />
              <path d="M 30 42 H 70" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 47 18 V 34 C 47 38, 44 42, 40 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M 61 12 V 34 C 61 38, 58 42, 54 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="about-logo-text">dayday</span>
          </div>
          <p className="about-version">Sürüm 1.0.0</p>
          <p className="about-tagline">Günün her rengiyle yanında. 🌸</p>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Çıkış Yap
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
