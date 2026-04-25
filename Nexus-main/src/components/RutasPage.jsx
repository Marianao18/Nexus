import React, { useEffect, useRef } from 'react';
import styles from './RutasPage.module.css';


const IconPowerBI = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="28" width="8" height="16" rx="2" fill="#F2C811"/>
    <rect x="14" y="20" width="8" height="24" rx="2" fill="#F2C811" opacity="0.8"/>
    <rect x="24" y="12" width="8" height="32" rx="2" fill="#F2C811" opacity="0.6"/>
    <rect x="34" y="6" width="8" height="38" rx="2" fill="#F2C811" opacity="0.4"/>
    <circle cx="38" cy="10" r="6" fill="#F2C811"/>
    <path d="M35 10 L38 7 L41 10 L38 13 Z" fill="#1a1a2e"/>
  </svg>
);

const IconPython = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4C15 4 16 8 16 8V16H24V18H10C10 18 4 17 4 26C4 35 9 34 9 34H13V29C13 29 13 24 18 24H30C30 24 34 24 34 19V9C34 9 34 4 24 4Z" fill="#3776AB"/>
    <circle cx="19" cy="11" r="2" fill="white"/>
    <path d="M24 44C33 44 32 40 32 40V32H24V30H38C38 30 44 31 44 22C44 13 39 14 39 14H35V19C35 19 35 24 30 24H18C18 24 14 24 14 29V39C14 39 14 44 24 44Z" fill="#FFD43B"/>
    <circle cx="29" cy="37" r="2" fill="white"/>
  </svg>
);

const IconExcel = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#217346"/>
    <path d="M14 14L20 24L14 34H19L24 26L29 34H34L28 24L34 14H29L24 22L19 14H14Z" fill="white"/>
    <rect x="26" y="14" width="14" height="3" rx="1" fill="white" opacity="0.6"/>
    <rect x="26" y="20" width="14" height="3" rx="1" fill="white" opacity="0.6"/>
    <rect x="26" y="26" width="14" height="3" rx="1" fill="white" opacity="0.6"/>
    <rect x="26" y="32" width="14" height="3" rx="1" fill="white" opacity="0.6"/>
  </svg>
);

const IconJava = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 34C18 34 16 35 19 36C23 37 25 37 29 36C29 36 30 37 28 37C22 39 14 37 18 34Z" fill="#EA2D2E"/>
    <path d="M17 31C17 31 15 32 18 33C22 34 26 34 31 33C31 33 32 34 30 34C23 36 14 34 17 31Z" fill="#EA2D2E"/>
    <path d="M24 14C24 14 27 16 21 19C16 22 20 24 21 24C15 22 13 20 14 18C16 15 24 14 24 14Z" fill="#EA2D2E"/>
    <path d="M30 36C30 36 31 37 29 38C25 39 17 39 15 38C15 38 14 37 15 37C19 38 30 37 30 36Z" fill="#EA2D2E"/>
    <path d="M20 28C17 27 22 26 22 26C22 26 27 25 30 27C27 28 24 28 20 28Z" fill="#5382A1"/>
    <text x="10" y="22" fill="#5382A1" fontSize="8" fontWeight="bold">Spring</text>
    <path d="M28 8C28 8 32 11 26 15C21 19 25 21 28 20C22 19 20 17 21 15C23 12 28 8 28 8Z" fill="#EA2D2E"/>
    <path d="M16 40C16 40 15 41 17 41C21 42 27 42 31 41C31 41 32 40 31 40C27 41 17 41 16 40Z" fill="#EA2D2E"/>
  </svg>
);

const IconDjango = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="6" fill="#092E20"/>
    <path d="M22 10H26V30C26 34 24 36 20 36C16 36 14 34 14 31H18C18 32 19 33 20 33C21 33 22 32 22 30V10Z" fill="#44B78B"/>
    <path d="M28 16H32V36H28V16Z" fill="#44B78B"/>
    <circle cx="30" cy="11" r="2.5" fill="#44B78B"/>
  </svg>
);

const IconPostgres = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="24" cy="14" rx="16" ry="6" fill="#336791"/>
    <rect x="8" y="14" width="32" height="20" fill="#336791"/>
    <ellipse cx="24" cy="34" rx="16" ry="6" fill="#336791"/>
    <ellipse cx="24" cy="14" rx="16" ry="6" fill="#336791" stroke="#4A90C4" strokeWidth="1"/>
    <path d="M40 14V34" stroke="#4A90C4" strokeWidth="1"/>
    <path d="M8 14V34" stroke="#4A90C4" strokeWidth="1"/>
    <ellipse cx="24" cy="34" rx="16" ry="6" fill="#336791" stroke="#4A90C4" strokeWidth="1"/>
    <ellipse cx="24" cy="14" rx="14" ry="4" fill="#4A90C4" opacity="0.3"/>
    <text x="17" y="26" fill="white" fontSize="9" fontWeight="bold">PG</text>
  </svg>
);

const IconMongo = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4C24 4 34 14 34 26C34 32 30 38 24 40C18 38 14 32 14 26C14 14 24 4 24 4Z" fill="#4DB33D"/>
    <path d="M24 40V44" stroke="#4DB33D" strokeWidth="3" strokeLinecap="round"/>
    <path d="M24 4C24 4 22 18 22 28C22 35 23 40 24 40" fill="#3FA037"/>
    <circle cx="24" cy="22" r="3" fill="white" opacity="0.4"/>
  </svg>
);


const CURSOS = [
  {
    id: 1,
    nombre: 'Análisis de Datos con Power BI',
    icono: <IconPowerBI />,
    color: '#F2C811',
    colorBg: 'rgba(242, 200, 17, 0.08)',
    colorBorder: 'rgba(242, 200, 17, 0.25)',
    nivel: 'Básico → Avanzado',
    tag: 'Data Analytics',
    descripcion: 'Domina Power BI desde cero: conexión de fuentes de datos, transformación con Power Query, modelado DAX y creación de dashboards interactivos listos para empresas.',
    temas: ['Power Query', 'DAX', 'Dashboards', 'Reportes'],
  },
  {
    id: 2,
    nombre: 'Análisis de Datos con Python',
    icono: <IconPython />,
    color: '#3776AB',
    colorBg: 'rgba(55, 118, 171, 0.08)',
    colorBorder: 'rgba(55, 118, 171, 0.25)',
    nivel: 'Intermedio',
    tag: 'Data Science',
    descripcion: 'Aprende a procesar, limpiar y visualizar datos con Pandas, NumPy y Matplotlib. Aplica estadística y genera insights reales con datasets del mundo laboral.',
    temas: ['Pandas', 'NumPy', 'Matplotlib', 'Estadística'],
  },
  {
    id: 3,
    nombre: 'Excel en Todos sus Niveles',
    icono: <IconExcel />,
    color: '#217346',
    colorBg: 'rgba(33, 115, 70, 0.08)',
    colorBorder: 'rgba(33, 115, 70, 0.25)',
    nivel: 'Básico → Avanzado',
    tag: 'Productividad',
    descripcion: 'Desde fórmulas esenciales hasta tablas dinámicas, macros y automatización con VBA. El Excel que las empresas exigen en perfiles administrativos y financieros.',
    temas: ['Tablas dinámicas', 'VBA', 'Macros', 'Fórmulas'],
  },
  {
    id: 4,
    nombre: 'Desarrollo con Java Spring Boot',
    icono: <IconJava />,
    color: '#6DB33F',
    colorBg: 'rgba(109, 179, 63, 0.08)',
    colorBorder: 'rgba(109, 179, 63, 0.25)',
    nivel: 'Intermedio → Avanzado',
    tag: 'Backend Dev',
    descripcion: 'Construye APIs REST robustas y escalables con Java y Spring Boot. Cubre seguridad con JWT, JPA con Hibernate, pruebas unitarias y despliegue en producción.',
    temas: ['REST APIs', 'Spring Security', 'JPA/Hibernate', 'JWT'],
  },
  {
    id: 5,
    nombre: 'Desarrollo Backend con Django',
    icono: <IconDjango />,
    color: '#44B78B',
    colorBg: 'rgba(68, 183, 139, 0.08)',
    colorBorder: 'rgba(68, 183, 139, 0.25)',
    nivel: 'Básico → Avanzado',
    tag: 'Backend Dev',
    descripcion: 'Aprende a construir aplicaciones web completas y APIs con Django y Django REST Framework. Autenticación, ORM, migraciones y despliegue con Docker incluidos.',
    temas: ['Django ORM', 'REST Framework', 'JWT Auth', 'Docker'],
  },
  {
    id: 6,
    nombre: 'Bases de Datos con PostgreSQL',
    icono: <IconPostgres />,
    color: '#336791',
    colorBg: 'rgba(51, 103, 145, 0.08)',
    colorBorder: 'rgba(51, 103, 145, 0.25)',
    nivel: 'Básico → Avanzado',
    tag: 'Bases de Datos',
    descripcion: 'Diseño relacional, SQL avanzado, índices, transacciones y optimización de consultas con PostgreSQL. La base de datos más usada en proyectos de producción modernos.',
    temas: ['SQL Avanzado', 'Índices', 'Transacciones', 'Optimización'],
  },
  {
    id: 7,
    nombre: 'Bases de Datos con MongoDB',
    icono: <IconMongo />,
    color: '#4DB33D',
    colorBg: 'rgba(77, 179, 61, 0.08)',
    colorBorder: 'rgba(77, 179, 61, 0.25)',
    nivel: 'Básico → Intermedio',
    tag: 'NoSQL',
    descripcion: 'Explora el mundo NoSQL con MongoDB: modelado de documentos, queries con Aggregation Pipeline, índices y conexión con aplicaciones Node.js o Python.',
    temas: ['Documentos', 'Aggregation', 'Índices', 'Mongoose'],
  },
];

const NIVEL_COLOR = {
  'Básico → Avanzado': '#A3FF4F',
  'Intermedio': '#00E5FF',
  'Intermedio → Avanzado': '#7B5CFA',
  'Básico → Intermedio': '#FF6B35',
};

export default function RutasPage() {
  const ref = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.06 }
    );
    ref.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page} ref={ref}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <p className={`${styles.tag} reveal`}>Catálogo de cursos</p>
        <h1 className={`${styles.title} reveal`}>
          Rutas de<br /><span className={styles.accent}>aprendizaje</span>
        </h1>
        <p className={`${styles.subtitle} reveal`}>
          {CURSOS.length} cursos disponibles · Modalidad Virtual  · 2026
        </p>
      </div>

      {/* ── Grid de cursos ── */}
      <div className={styles.grid}>
        {CURSOS.map((curso, i) => (
          <article
            key={curso.id}
            className={`${styles.card} reveal`}
            style={{
              '--card-color': curso.color,
              '--card-bg': curso.colorBg,
              '--card-border': curso.colorBorder,
              animationDelay: `${i * 0.06}s`,
            }}
          >
            {/* Borde superior de color */}
            <div className={styles.cardTop} style={{ background: curso.color }} />

            {/* Cabecera: ícono + tag de nivel */}
            <div className={styles.cardHead}>
              <div className={styles.iconWrap} style={{ background: curso.colorBg, border: `1px solid ${curso.colorBorder}` }}>
                {curso.icono}
              </div>
              <div className={styles.badges}>
                <span className={styles.tagBadge} style={{ color: curso.color, background: curso.colorBg, border: `1px solid ${curso.colorBorder}` }}>
                  {curso.tag}
                </span>
                <span className={styles.nivelBadge} style={{ color: NIVEL_COLOR[curso.nivel] }}>
                  {curso.nivel}
                </span>
              </div>
            </div>

            {/* Nombre */}
            <h3 className={styles.cardTitle}>{curso.nombre}</h3>

            {/* Descripción */}
            <p className={styles.cardDesc}>{curso.descripcion}</p>

            {/* Temas */}
            <div className={styles.temas}>
              {curso.temas.map((t, j) => (
                <span key={j} className={styles.tema}>{t}</span>
              ))}
            </div>

            {/* CTA */}
            <button className={styles.btn} style={{ '--btn-color': curso.color }}>
              Ver ruta completa →
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
