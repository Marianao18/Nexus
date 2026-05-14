import React, { useEffect, useRef } from 'react';
import styles from './Features.module.css';

const FEATURES = [
  {
    icon: '🤖', num: '', colorClass: 'cyan', wide: false,
    title: 'Asistente IA Personalizado',
    desc: 'Analiza tu progreso y recomienda contenido adaptado a tu nivel, ritmo de aprendizaje y objetivos laborales en tiempo real.',
  },
  {
    icon: '⚡', num: '', colorClass: 'lime', wide: false,
    title: 'Microlearning',
    desc: 'Lecciones cortas y concretas pensadas para aprender en cualquier momento, sin perder el hilo de tu ruta formativa.',
  },
  {
    icon: '🗺️', num: '', colorClass: 'purple', wide: true,
    title: 'Rutas de Formación por Competencias',
    desc: 'Secuencias de aprendizaje estructuradas por habilidades prácticas — desde fundamentos hasta especialización profesional en áreas como backend, frontend, DevOps, IA, ciberseguridad y cloud. Cada ruta está alineada con la demanda laboral real del sector tech en Medellín y Colombia.',
  },
  {
    icon: '📊', num: '', colorClass: 'orange', wide: false,
    title: 'Dashboard de Progreso',
    desc: 'Visualiza tu avance, evalúa tus competencias y accede a analítica de aprendizaje que te guía hacia tus metas.',
  },
  {
    icon: '👥', num: '', colorClass: 'cyan', wide: false,
    title: 'Comunidad & Colaboración',
    desc: 'Foros, mentorías y grupos de trabajo para construir red profesional dentro del ecosistema tecnológico local.',
  },
  {
    icon: '🏆', num: '', colorClass: 'lime', wide: false,
    title: 'Evaluación Iterativa',
    desc: 'Sistema de evaluación continua con retroalimentación inmediata para consolidar habilidades prácticas de manera efectiva.',
  },
];

function FeatureCard({ feature }) {
  return (
    <div className={`${styles.card} ${feature.wide ? styles.wide : ''}`}>
      <div className={`${styles.icon} ${styles[`fi_${feature.colorClass}`]}`}>
        {feature.icon}
      </div>
      <div className={styles.num}>{feature.num}</div>
      <div className={styles.title}>{feature.title}</div>
      <div className={styles.desc}>{feature.desc}</div>
    </div>
  );
}

export default function Features() {
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
      <p className={`${styles.tag} reveal`}>Funcionalidades clave</p>
      <h2 className={`${styles.title} reveal`}>
        Todo lo que necesitas<br />para aprender TI en un solo lugar
      </h2>
      <div className={`${styles.grid} reveal`}>
        {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} />)}
      </div>
    </section>
  );
}
