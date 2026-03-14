import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    // 1. ESCUDO DE SEGURIDAD Y CARGA DE DATOS
    useEffect(() => {
        const rol = localStorage.getItem('userRole');
        
        // Si no es admin, lo expulsamos antes de que vea nada
        if (rol !== 'super_admin' && rol !== 'admin') {
            navigate('/login');
            return;
        }

        const obtenerSolicitudes = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/solicitudes');
                setSolicitudes(res.data);
            } catch (err) {
                console.error("Error al traer solicitudes:", err);
                alert("No se pudieron cargar los datos del servidor.");
            } finally {
                setCargando(false);
            }
        };

        obtenerSolicitudes();
    }, [navigate]);

    // 2. LOGICA DE CIERRE DE SESIÓN
    const cerrarSesion = () => {
        localStorage.clear();
        navigate('/login');
    };

    // 3. FUNCIÓN DE APROBACIÓN (Pre-configurada)
    const manejarAprobacion = async (id) => {
        if (window.confirm("¿Estás seguro de aprobar a este docente? Se le creará una cuenta automáticamente.")) {
            try {
                console.log("Enviando aprobación para ID:", id);
                // Aquí irá el: await axios.post(`http://localhost:5000/api/admin/aprobar/${id}`);
                // Por ahora solo filtramos visualmente:
                setSolicitudes(solicitudes.filter(s => s.id !== id));
                alert("Docente aprobado con éxito (Simulado)");
            } catch (err) {
                alert("Error al procesar la aprobación.");
            }
        }
    };

    if (cargando) return <div className="loader">Cargando panel de control...</div>;

    return (
        <div className="admin-container">
            {/* Header del Panel */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Panel de Administración - Nexus</h1>
                    <p>Bienvenido, {localStorage.getItem('userName')}</p>
                </div>
                <button onClick={cerrarSesion} className="btn-logout">
                    Cerrar Sesión
                </button>
            </header>

            <hr />

            <h3>Solicitudes de Docentes Pendientes</h3>
            
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Especialidad</th>
                            <th>Correo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudes.length > 0 ? (
                            solicitudes.map((sol) => (
                                <tr key={sol.id}>
                                    <td>{sol.nombre_completo}</td>
                                    <td>{sol.especialidad}</td>
                                    <td>{sol.email}</td>
                                    <td>
                                        <button 
                                            className="btn-approve"
                                            onClick={() => manejarAprobacion(sol.id)}
                                        >
                                            Aprobar
                                        </button>
                                        <button className="btn-reject">
                                            Rechazar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '30px' }}>
                                    No hay solicitudes pendientes en este momento.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;