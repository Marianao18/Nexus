import React from 'react';
import styles from './Background.module.css';

export default function Background() {
  return (
    <>
      <div className={styles.grid} />
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />
    </>
  );
}
