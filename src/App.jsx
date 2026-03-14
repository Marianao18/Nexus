import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Background from './components/Background.jsx';
import Navbar     from './components/Navbar.jsx';
import Footer     from './components/Footer.jsx';
import Hero        from './components/Hero.jsx';
import Stats       from './components/Stats.jsx';
import Features    from './components/Features.jsx';
import Rutas       from './components/Rutas.jsx';
import CtaBanner   from './components/CtaBanner.jsx';
import Registro          from './components/Registro.jsx';
import Login             from './components/Login.jsx';
import SolicitudDocente from './components/SolicitudDocente.jsx';
import HomeAdm           from './components/HomeAdm.jsx';
import AdminSolicitudes from './components/AdminSolicitudes.jsx';

const ProtectedRoute = ({ userRole, children }) => {
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }
    const normalizedRole = userRole.toLowerCase();
    if (!normalizedRole.includes('admin')) {
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

    useEffect(() => {
        const syncAuth = () => {
            setUserRole(localStorage.getItem('rol'));
        };

        window.addEventListener('storage', syncAuth);
        // Evento personalizado para cambios en la misma pestaña
        window.addEventListener('authChange', syncAuth);
        
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

        return () => {
            window.removeEventListener('storage', syncAuth);
            window.removeEventListener('authChange', syncAuth);
            observer.disconnect();
        };
    }, []);

    const isAdminView = userRole && userRole.toLowerCase().includes('admin');

    return (
        <Router>
            <div className="app-wrapper" style={{ position: 'relative' }}>
                <Background />
                {!isAdminView && <Navbar />}

                <main style={{ 
                    minHeight: '85vh', 
                    paddingTop: !isAdminView ? '80px' : '0' 
                }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/registro" element={<Registro />} />
                        <Route path="/ser-docente" element={<SolicitudDocente />} /> 
                        <Route path="/login" element={
                            isAdminView ? <Navigate to="/admin-dashboard" replace /> : <Login />
                        } />
                        <Route 
                            path="/admin-dashboard" 
                            element={
                                <ProtectedRoute userRole={userRole}>
                                    <HomeAdm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/AdminSolicitudes" 
                            element={
                                <ProtectedRoute userRole={userRole}>
                                    <AdminSolicitudes />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>

                {!isAdminView && <Footer />}
            </div>
        </Router>
    );
}