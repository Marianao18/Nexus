import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css'; // Importante: usamos 'styles'

const LogoIcon = () => (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
        <circle cx="10" cy="10" r="2.5" fill="#00E5FF" />
        <line x1="10" y1="10" x2="4" y2="4" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
        <line x1="10" y1="10" x2="16" y2="4" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
    </svg>
);

export default function Navbar() {
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('rol');

    const manejarLogout = () => {
        if (window.confirm("¿Deseas cerrar sesión?")) {
            localStorage.clear();
            window.dispatchEvent(new Event("authChange"));
            window.location.href = '/';
        }
    };

    return (
        <nav className={styles.nav}>
            <Link to="/" className={styles.logo}>
                <div className={styles.logoMark}><LogoIcon /></div>
                <span className={styles.logoText}>NEX<span>U</span>S</span>
            </Link>

            <ul className={styles.links}>
                <li><Link to="/">Explorar</Link></li>
                <li><Link to="/rutas">Rutas</Link></li>
                <li><Link to="/ser-docente">Docentes</Link></li>

                {userRole?.toLowerCase().includes('admin') && (
                    <li>
                        <Link to="/admin-dashboard" className={styles.adminLink}>
                            PANEL ADMIN
                        </Link>
                    </li>
                )}
            </ul>

            <div className={styles.authSection}>
                {userName ? (
                    <div className={styles.userContainer}>
                        <div className={styles.userInfo}>
                            <span className={styles.userGreet}>Bienvenido</span>
                            <span className={styles.userLabel}>{userName}</span>
                        </div>
                        <button onClick={manejarLogout} className={styles.cta}>
                            Salir
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className={styles.cta}>
                        Iniciar Sesión
                    </Link>
                )}
            </div>
        </nav>
    );
}