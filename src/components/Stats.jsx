import React, { useEffect, useRef } from 'react';
import styles from './Stats.module.css';

const STATS = [
  { number: '+12k', label: 'Estudiantes activos',    accent: 'cyan'   },
  { number: '200+', label: 'Recursos disponibles',   accent: 'lime'   },
  { number: '18',   label: 'Rutas de aprendizaje',   accent: 'purple' },
  { number: '0',    label: 'Costo de acceso',         accent: 'orange' },
];

export default function Stats() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`${styles.statsRow} reveal`} ref={ref}>
      {STATS.map((s, i) => (
        <div key={i} className={styles.statItem}>
          <div className={`${styles.statNumber} ${styles[s.accent]}`}>{s.number}</div>
          <div className={styles.statLabel}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
