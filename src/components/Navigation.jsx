import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Beaker, PenTool, Library, CalendarDays, UserCircle2 } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="nav-container">
      <div className="nav-logo-area">
        <svg viewBox="0 0 100 60" className="nav-logo-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="45" cy="30" r="14" fill="#FFE5D9" opacity="0.6" />
          <circle cx="55" cy="34" r="12" fill="#E8F5E9" opacity="0.6" />
          <path d="M 30 42 H 70" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 47 18 V 34 C 47 38, 44 42, 40 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 61 12 V 34 C 61 38, 58 42, 54 42" stroke="var(--text-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span className="nav-logo-text">dayday</span>
      </div>

      <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <Home size={24} strokeWidth={1.5} />
        <span>Bugünüm</span>
      </NavLink>
      
      <NavLink to="/mood-jar" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <Beaker size={24} strokeWidth={1.5} />
        <span>Kavanoz</span>
      </NavLink>
      
      <NavLink to="/journal" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <PenTool size={24} strokeWidth={1.5} />
        <span>Günlük</span>
      </NavLink>
      
      <NavLink to="/library" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <Library size={24} strokeWidth={1.5} />
        <span>Kitaplık</span>
      </NavLink>
      
      <NavLink to="/calendar" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <CalendarDays size={24} strokeWidth={1.5} />
        <span>Takvim</span>
      </NavLink>

      <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <UserCircle2 size={24} strokeWidth={1.5} />
        <span>Bilgilerim</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
