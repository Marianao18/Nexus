import React, { useEffect, useRef } from 'react';
import styles from './CtaBanner.module.css';
import { Link } from 'react-router-dom';


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
                <Link to="/registro" className={styles.btnPrimary}>Registrarme ahora</Link>
        <Link to="/ser-docente" className={styles.btnSecondary}>  Soy docente</Link>
      </div>
    </div>
  );
}
