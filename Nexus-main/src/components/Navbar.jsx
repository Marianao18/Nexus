import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css'; 

const LogoIcon = () => (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
        <circle cx="10" cy="10" r="2.5" fill="#00E5FF" />
        <line x1="10" y1="10" x2="4" y2="4" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
        <line x1="10" y1="10" x2="16" y2="4" stroke="#00E5FF" strokeWidth="0.8" opacity="0.4" />
    </svg>
);

export default function Navbar() {
    const [user, setUser] = useState({
        name: localStorage.getItem('userName'),
        role: localStorage.getItem('rol')?.toLowerCase()
    });

    useEffect(() => {
        const checkAuth = () => {
            setUser({
                name: localStorage.getItem('userName'),
                role: localStorage.getItem('rol')?.toLowerCase()
            });
        };

        window.addEventListener('authChange', checkAuth);
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('authChange', checkAuth);
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    // --- FILTRO DE VISIBILIDAD ESTRICTO ---
    // Si es estudiante o docente, NO se muestra nada (ellos usan su propio Sidebar)
    if (user.role === 'estudiante' || user.role === 'docente') {
        return null;
    }

    const manejarLogout = () => {
        if (window.confirm("¿Deseas cerrar sesión?")) {
            localStorage.clear();
            window.dispatchEvent(new Event("authChange"));
            window.location.href = '/';
        }
    };

    return (
        <nav className={styles.nav}>
            {/* --- SECCIÓN LOGO --- */}
            <Link to="/" className={styles.logo}>
                <div className={styles.logoMark}><LogoIcon /></div>
                <span className={styles.logoText}>NEX<span>U</span>S</span>
            </Link>

            {/* --- ENLACES DE NAVEGACIÓN --- */}
            <ul className={styles.links}>
                {/* 1. Solo para Visitantes (No logueados) */}
                {!user.role && (
                    <>
                        <li class = "subTittle1"><Link to="/">Explorar</Link></li>
                        <li class = "subTittle2"><Link to="/rutas">Rutas</Link></li>
                        <li class = "subTittle3"><Link to="/ser-docente">Docentes</Link></li>
                    </>
                )}

                {/* 2. Solo para Administrador */}
                {user.role === 'admin' && (
                    <li>
                        <Link to="/admin-dashboard" className={styles.adminLink}>
                            PANEL DE CONTROL ADMIN
                        </Link>
                    </li>
                )}
            </ul>

            {/* --- SECCIÓN DE AUTENTICACIÓN --- */}
            <div className={styles.authSection}>
                {user.name ? (
                    <div className={styles.userContainer}>
                        <div className={styles.userInfo}>
                            <span className={styles.userGreet}>Sesión de Administrador</span>
                            <span className={styles.userLabel}>{user.name}</span>
                        </div>
                        
                        {/* El admin sí necesita el botón de salir en el navbar horizontal */}
                        {user.role === 'admin' && (
                            <button onClick={manejarLogout} className={styles.cta}>
                                Cerrar Sesión
                            </button>
                        )}
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