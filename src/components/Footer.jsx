import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        NEX<span>U</span>S
      </div>
      <div className={styles.note}>
        Tecnológico de Antioquia · Ingeniería en Software · 2026
      </div>
      <div className={`${styles.note} ${styles.faint}`}>
        beyond control
      </div>
    </footer>
  );
}
