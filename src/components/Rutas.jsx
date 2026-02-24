import React, { useEffect, useRef } from 'react';
import styles from './Rutas.module.css';

const RUTAS = [
  { label: 'Frontend Dev',         color: '#00E5FF' },
  { label: 'Backend Dev',          color: '#A3FF4F' },
  { label: 'Inteligencia Artificial', color: '#7B5CFA' },
  { label: 'Ciberseguridad',       color: '#FF6B35' },
  { label: 'Cloud & DevOps',       color: '#00E5FF' },
  { label: 'Mobile Dev',           color: '#A3FF4F' },
  { label: 'Data Science',         color: '#7B5CFA' },
  { label: 'UX / UI Design',       color: '#FF6B35' },
];

export default function Rutas() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.08 }
    );
    ref.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={ref}>
      <p className={`${styles.tag} reveal`}>Explora rutas</p>
      <h2 className={`${styles.title} reveal`}>
        Elige tu camino<br />en el mundo tech
      </h2>
      <div className={`${styles.row} reveal`}>
        {RUTAS.map((r, i) => (
          <a key={i} href="#" className={styles.pill}>
            <span className={styles.dot} style={{ background: r.color }} />
            <span className={styles.label}>{r.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
