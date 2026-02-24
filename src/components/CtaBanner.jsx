import React, { useEffect, useRef } from 'react';
import styles from './CtaBanner.module.css';

export default function CtaBanner() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`${styles.banner} reveal`} ref={ref}>
      <div className={styles.text}>
        <h2>
          El talento digital<br />
          de Medellín <span>empieza aquí.</span>
        </h2>
        <p>
          Acceso gratuito para todos los estudiantes de carreras técnicas,
          tecnológicas y profesionales en la ciudad. Sin barreras, sin costos.
        </p>
      </div>
      <div className={styles.actions}>
        <a href="#" className={styles.btnPrimary}>Registrarme ahora</a>
        <a href="#" className={styles.btnSecondary}>Soy docente</a>
      </div>
    </div>
  );
}
