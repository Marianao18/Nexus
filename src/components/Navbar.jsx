import React from 'react';
import styles from './Navbar.module.css';

const LogoIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <circle cx="10" cy="10" r="2.5" fill="#00E5FF" />
    <circle cx="4"  cy="4"  r="1.5" fill="#00E5FF" opacity="0.7" />
    <circle cx="16" cy="4"  r="1.5" fill="#00E5FF" opacity="0.7" />
    <circle cx="4"  cy="16" r="1.5" fill="#00E5FF" opacity="0.7" />
    <circle cx="16" cy="16" r="1.5" fill="#00E5FF" opacity="0.7" />
    <line x1="10" y1="10" x2="4"  y2="4"  stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
    <line x1="10" y1="10" x2="16" y2="4"  stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
    <line x1="10" y1="10" x2="4"  y2="16" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
    <line x1="10" y1="10" x2="16" y2="16" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
  </svg>
);

const NAV_LINKS = ['Explorar', 'Rutas', 'Comunidad', 'Docentes'];

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <a href="#" className={styles.logo}>
        <div className={styles.logoMark}>
          <LogoIcon />
        </div>
        <span className={styles.logoText}>
          NEX<span>U</span>S
        </span>
      </a>

      <ul className={styles.links}>
        {NAV_LINKS.map(link => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>

      <a href="#" className={styles.cta}>Iniciar sesión</a>
    </nav>
  );
}
