import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSolicitudes from './AdminSolicitudes';
import './HomeAdm.css';

const AdminHome = () => {
    const [vista, setVista] = useState('resumen'); 
    const navigate = useNavigate();

    const cerrarSesion = () => {
        if (window.confirm("¿Estás seguro de que deseas salir?")) {
            localStorage.clear();
            window.dispatchEvent(new Event("authChange")); // Notifica a App.js
            navigate('/login');
        }
    };

    return (
        <div className="dashboard-admin">
            <nav className="admin-navbar">
                <div className="admin-logo">
                    NEXUS <span className="admin-tag">ADMIN PANEL</span>
                </div>
                
                <div className="admin-menu">
                    <button 
                        onClick={() => setVista('resumen')} 
                        className={vista === 'resumen' ? 'nav-btn-active' : 'nav-btn'}> Panel de Control
                    </button>
                    <button 
                        onClick={() => setVista('solicitudes')} 
                        className={vista === 'solicitudes' ? 'nav-btn-active' : 'nav-btn'}> Solicitudes Pendientes
                    </button>
                    <button className="nav-btn"> Usuarios</button>
                    
                    <button onClick={cerrarSesion} className="logout-btn">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="admin-content">
                {vista === 'resumen' ? (
                    <section className="section-fade">
                        <h2 className="admin-title">Estado Global de la Plataforma</h2>
                        
                        <div className="metrics-grid">
                            <MetricCard title="Docentes Activos" value="24" icon="👨‍🏫" color="#00e5ff" />
                            <MetricCard title="Estudiantes" value="1,150" icon="🎓" color="#2ecc71" />
                            <MetricCard title="Solicitudes" value="3" icon="📩" color="#f1c40f" />
                            <MetricCard title="Cursos" value="12" icon="📚" color="#9b59b6" />
                        </div>
                        
                        <div className="recent-activity">
                            <h3 style={{ borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
                                Actividad Reciente
                            </h3>
                            <ul className="activity-list">
                                <li>• Juan David Pinzón envió una solicitud de docente.</li>
                                <li>• Servidor funcionando correctamente en puerto 5000.</li>
                                <li>• Base de datos sincronizada con NEXUS Cloud.</li>
                            </ul>
                        </div>
                    </section>
                ) : (
                    <div className="section-fade">
                        <AdminSolicitudes /> 
                    </div>
                )}
            </main>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color }) => (
    <div className="metric-card" style={{ borderTop: `4px solid ${color}` }}>
        <div className="card-header">
            <span className="card-title">{title}</span>
            <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>
        <div className="card-value">{value}</div>
    </div>
);

export default AdminHome;