import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Background from './components/Background.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import Stats from './components/Stats.jsx';
import Features from './components/Features.jsx';
import Rutas from './components/Rutas.jsx';
import CtaBanner from './components/CtaBanner.jsx';
import Registro from './components/Registro.jsx';
import Login from './components/Login.jsx';
import SolicitudDocente from './components/SolicitudDocente.jsx';
import HomeAdm from './components/HomeAdm.jsx';
import AdminSolicitudes from './components/AdminSolicitudes.jsx';
import RecuperarPassword from './components/RecuperarPassword';
import RestablecerPassword from './components/RestablecerPassword';
import HomeDocente from './components/HomeDocente.jsx';
import HomeEstudiante from './components/HomeEstudiante.jsx';
import CambiarPassword from './components/CambiarPassword.jsx';
import RutasPage from './components/RutasPage.jsx';
const ProtectedRoute = ({ userRole, allowedRoles, children }) => {
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }
    const normalizedRole = userRole.toLowerCase();
    if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const HomePage = () => (
    <>
        <Hero />
        <Stats />
        <Features />
        <Rutas />
        <CtaBanner />
    </>
);

export default function App() {
    const [userRole, setUserRole] = useState(localStorage.getItem('rol'));

    // Sincronización de autenticación
    const syncAuth = () => {
        setUserRole(localStorage.getItem('rol'));
    };

    useEffect(() => {
        // 1. Limpieza de rol inválido
        const rolActual = localStorage.getItem('rol');
        if (rolActual && !['admin', 'docente', 'estudiante'].includes(rolActual.toLowerCase())) {
            localStorage.removeItem('rol');
            setUserRole(null);
        }

        // 2. Eventos de escucha
        window.addEventListener('storage', syncAuth);
        window.addEventListener('authChange', syncAuth);

        // 3. Observer para animaciones
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.15 }
        );

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));

        // Cleanup al desmontar
        return () => {
            window.removeEventListener('storage', syncAuth);
            window.removeEventListener('authChange', syncAuth);
            observer.disconnect();
        };
    }, []);

    const isDashboard = userRole && ['admin', 'docente'].includes(userRole.toLowerCase());

    return (
        <Router>
            <div className="app-wrapper" style={{ position: 'relative' }}>
                <Background />
                
                {/* Navbar solo si no es admin/docente o si no hay rol */}
                {(!userRole || !['admin', 'docente'].includes(String(userRole).toLowerCase())) && <Navbar />}

                <main style={{ 
                    minHeight: '85vh', 
                    paddingTop: isDashboard ? '0' : '80px' 
                }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/registro" element={<Registro />} />
                        <Route path="/ser-docente" element={<SolicitudDocente />} />
                        <Route path="/rutas" element={<RutasPage />} />

                        <Route path="/login" element={
                            (userRole && userRole.toLowerCase() === 'admin') 
                            ? <Navigate to="/admin-dashboard" replace /> 
                            : <Login />
                        } />

                        <Route path="/admin-dashboard" element={
                            <ProtectedRoute userRole={userRole} allowedRoles={['admin']}><HomeAdm /></ProtectedRoute>
                        } />

                        <Route path="/AdminSolicitudes" element={
                            <ProtectedRoute userRole={userRole} allowedRoles={['admin']}><AdminSolicitudes /></ProtectedRoute>
                        } />

                        <Route path="/recuperar-contrasena" element={<RecuperarPassword />} />
                        <Route path="/restablecer-password/:uid/:token" element={<RestablecerPassword />} />

                        <Route path="/docente-dashboard" element={<ProtectedRoute userRole={userRole} allowedRoles={['docente']}>
                        {localStorage.getItem('debe_cambiar') === 'true' ? (
                        <Navigate to="/cambiar-password-obligatorio" replace />
                    ) : (
            <HomeDocente />
        )}
    </ProtectedRoute>
} />

                        <Route path="/estudiante-dashboard" element={
                            <ProtectedRoute userRole={userRole} allowedRoles={['estudiante']}><HomeEstudiante /></ProtectedRoute>
                        } />
                        <Route path="/cambiar-password-obligatorio" element={<CambiarPassword />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>

               {(!userRole || userRole.toLowerCase() === 'admin') && <Footer />}
            </div>
        </Router>
    );
}