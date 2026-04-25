import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);

    // 1. CARGAR SOLICITUDES AL MONTAR
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/admin/solicitudes/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                setSolicitudes(res.data);
            } catch (err) {
                console.error("Error al cargar solicitudes:", err);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    // 2. FUNCIÓN PARA APROBAR (Crea usuario y envía correo)
    const aprobar = async (id) => {
        if (window.confirm("¿Deseas convertir a este postulante en docente oficial?")) {
            try {
                const res = await axios.post(
                    `http://localhost:8000/api/admin/aprobar-docente/${id}/`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('access_token')}`
                        }
                    }
                );

                // Mostrar credenciales al admin
                const { mensaje, password } = res.data;
                alert(
                    `${mensaje}\n\n` +
                    `Correo: ${solicitudes.find(s => s.id === id)?.email}\n` +
                    `Contraseña temporal: ${password}\n\n` +
                    `Comparte estas credenciales con el docente.`
                );

                // Quitar de la lista
                setSolicitudes(prev => prev.filter(sol => sol.id !== id));

            } catch (err) {
                console.error("Error al aprobar:", err);
                alert("Hubo un fallo al aprobar al docente.");
            }
        }
    };

    // 3. FUNCIÓN PARA RECHAZAR (Elimina y notifica al docente)
    const rechazar = async (id) => {
        if (window.confirm("¿Estás seguro de rechazar esta solicitud? Se enviará un correo de notificación.")) {
            try {
                // Asumiendo que creamos la ruta /api/admin/rechazar-docente en el index.js
                const res = await axios.post(`http://localhost:8000/api/admin/rechazar-docente/${id}/`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                alert(res.data.mensaje);

                setSolicitudes(prev => prev.filter(sol => sol.id !== id));
            } catch (err) {
                console.error("Error al rechazar:", err);
                alert("No se pudo procesar el rechazo.");
            }
        }
    };

    if (cargando) return <p style={{ color: '#00e5ff', padding: '20px' }}>Consultando base de datos de NEXUS...</p>;
    

    return (
        <div className="na-table-container na-fade-in">
            <div className="na-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="na-section-title" style={{ margin: 0, color: '#fff' }}>
                    Bandeja de Entrada de Postulaciones
                </h3>
                <span className="na-badge-pending">
                    {solicitudes.length} Pendientes
                </span>
            </div>

            <div className="na-table-wrapper">
                <table className="na-table">
                    <thead>
                        <tr>
                            <th className="na-th">Nombre del Postulante</th>
                            <th className="na-th">Especialidad</th>
                            <th className="na-th">Correo Electrónico</th>
                            <th className="na-th">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudes.length > 0 ? (
                            solicitudes.map((sol) => (
                                <tr key={sol.id} className="na-table-row">
                                    <td className="na-td">{sol.nombre_completo}</td>
                                    <td className="na-td">
                                        <span className="na-specialty-tag">{sol.especialidad}</span>
                                    </td>
                                    <td className="na-td">{sol.email}</td>
                                    <td className="na-td">
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => aprobar(sol.id)}
                                                className="na-btn-approve"
                                            >
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => rechazar(sol.id)}
                                                className="na-btn-reject"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="na-empty-msg">
                                    No hay solicitudes nuevas por el momento.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- ESTILOS PARA MANTENER LA ESTÉTICA NEXUS ---
const styles = {
    container: { marginTop: '20px', animation: 'fadeIn 0.5s ease-in' },
    header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
    badge: { backgroundColor: '#f1c40f', color: '#000', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#161b22', borderRadius: '8px', overflow: 'hidden' },
    tableHeader: { backgroundColor: '#21262d', color: '#8b949e', textAlign: 'left' },
    th: { padding: '15px' },
    tr: { borderBottom: '1px solid #30363d' },
    td: { padding: '15px', color: '#c9d1d9' },
    especialidadTag: { backgroundColor: '#00e5ff22', color: '#00e5ff', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' },
    btnApprove: { backgroundColor: '#238636', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' },
    btnReject: { backgroundColor: 'transparent', color: '#f85149', border: '1px solid #f85149', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    noData: { padding: '40px', textAlign: 'center', color: '#8b949e' }
};

export default AdminSolicitudes;