import React from 'react';
import styles from './Terminal.module.css';

const LINES = [
  { type: 'comment', text: '// Iniciando sesión de aprendizaje' },
  { type: 'command', parts: [
    { cls: 'cyan',   text: 'nexus' },
    { cls: 'white',  text: ' > ' },
    { cls: 'lime',   text: 'analizar_perfil' },
    { cls: 'white',  text: '(user)' },
  ]},
  { type: 'comment', text: '// Detectando nivel: Intermedio' },
  { type: 'command', parts: [
    { cls: 'cyan',   text: 'nexus' },
    { cls: 'white',  text: ' > ' },
    { cls: 'purple', text: 'recomendar' },
    { cls: 'white',  text: '(' },
    { cls: 'orange', text: '"backend"' },
    { cls: 'white',  text: ')' },
  ]},
  { type: 'output', text: '→ Ruta: Node.js + Express' },
  { type: 'output', text: '→ Nivel completado: 42%' },
  { type: 'output', text: '→ Próxima clase: APIs REST' },
  { type: 'comment', text: '// Asistente listo para ayudarte' },
  { type: 'ready' },
];

export default function Terminal() {
  return (
    <div className={styles.terminal}>
      <div className={styles.bar}>
        <span className={`${styles.dot} ${styles.red}`} />
        <span className={`${styles.dot} ${styles.yellow}`} />
        <span className={`${styles.dot} ${styles.green}`} />
        <span className={styles.title}>nexus — asistente IA</span>
      </div>
      <div className={styles.body}>
        {LINES.map((line, i) => {
          if (line.type === 'comment') return (
            <div key={i} className={styles.comment}>{line.text}</div>
          );
          if (line.type === 'output') return (
            <div key={i} className={styles.white}>{line.text}</div>
          );
          if (line.type === 'command') return (
            <div key={i}>
              {line.parts.map((p, j) => (
                <span key={j} className={styles[p.cls]}>{p.text}</span>
              ))}
            </div>
          );
          if (line.type === 'ready') return (
            <div key={i}>
              <span className={styles.cyan}>nexus</span>
              <span className={styles.white}> &gt; </span>
              <span className={styles.lime}>ready</span>
              <span className={styles.cursor} />
            </div>
          );
          return null;
        })}
      </div>
    </div>
  );
}
