import React from 'react';
import styles from './Hero.module.css';
import Terminal from './Terminal';

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor" />
  </svg>
);

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        <span className={styles.badgeText}>Plataforma activa — Medellín, Colombia</span>
      </div>

      <h1 className={styles.headline}>
        <span className={styles.line1}>NEXUS</span>
        <span className={styles.line2}>Beyond Control</span>
      </h1>

      <p className={styles.sub}>
        Educación en TI · <span>Medellín</span> · 2026
      </p>

      <p className={styles.desc}>
        La plataforma que centraliza el conocimiento en desarrollo de software para{' '}
        <strong>estudiantes técnicos, tecnológicos y profesionales</strong> de Medellín.
        Rutas de aprendizaje, microlearning e IA que se adapta a ti.
      </p>

      <div className={styles.actions}>
        <a href="#" className={styles.btnPrimary}>
          <ArrowIcon />
          Comenzar gratis
        </a>
        <a href="#" className={styles.btnSecondary}>
          <PlayIcon />
          Ver demo
        </a>
      </div>

      <Terminal />
    </section>
  );
}
