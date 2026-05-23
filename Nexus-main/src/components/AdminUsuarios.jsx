import { useNexusModal } from './NexusModal';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUsuarios.css';
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});

const AdminUsuarios = () => {
    const { modalJSX, showAlert, showConfirm } = useNexusModal();
    const [data,    setData]    = useState({ estudiantes: [], docentes: [] });
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');
    const [tab,     setTab]     = useState('estudiantes');

    useEffect(() => {
        axios.get('/api/admin/usuarios/', authHeaders())
            .then(res => {
                console.log("Datos recibidos:", res.data); 
                setData(res.data);
            })
            .catch((err) => {
                console.error("Error detallado:", err);
                setError('No se pudieron cargar los usuarios.');
            })
            .finally(() => setLoading(false));
    }, []);

    const usuarios = tab === 'estudiantes' ? data.estudiantes : data.docentes;

    const eliminarUsuario = async (id, nombre) => {
    const ok = await showConfirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`, { type: 'danger', title: 'Eliminar usuario', confirmLabel: 'Sí, eliminar' });
    if (!ok) return;

    try {

        await axios.delete(
            `/api/usuarios/admin/eliminar-usuario/${id}/`,
            authHeaders()
        );

        // Actualizar tabla automáticamente
        setData(prev => ({
            ...prev,
            [tab]: prev[tab].filter(user => user.id !== id)
        }));

        await showAlert(`${nombre} fue eliminado correctamente.`, 'success');

    } catch (error) {

        console.error(error);

        await showAlert(
            error.response?.data?.error ||
            'No se pudo eliminar el usuario'
        );
    }
};

    const tabStyle = (activo) => ({
        padding: '8px 20px',
        borderRadius: '8px',
        border: activo ? '1px solid #00E5FF' : '1px solid rgba(255,255,255,0.1)',
        background: activo ? 'rgba(0,229,255,0.1)' : 'transparent',
        color: activo ? '#00E5FF' : '#7A8BA8',
        fontFamily: 'inherit',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    });

    return (
        <>
        {modalJSX}
        <div className="na-table-container na-fade-in">

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                <div>
                    <h2 style={{ margin:0, color:'#fff', fontSize:'22px', fontWeight:'700' }}>
                        Gestión de Usuarios
                    </h2>
                    <p style={{ margin:'4px 0 0', color:'#7A8BA8', fontSize:'13px' }}>
                        {data.estudiantes.length} estudiantes · {data.docentes.length} docentes
                    </p>
                </div>
            </div>

            {/* Pestañas */}
            <div style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
                <button style={tabStyle(tab === 'estudiantes')} onClick={() => setTab('estudiantes')}>
                    Estudiantes ({data.estudiantes.length})
                </button>
                <button style={tabStyle(tab === 'docentes')} onClick={() => setTab('docentes')}>
                    Docentes ({data.docentes.length})
                </button>
            </div>

            {/* Contenido */}
            {loading && (
                <div className="na-empty-msg">Cargando usuarios...</div>
            )}

            {error && (
                <div style={{ color:'#f87171', padding:'16px', background:'rgba(248,113,113,0.1)', borderRadius:'8px' }}>
                     {error}
                </div>
            )}

            {!loading && !error && (
                <div className="na-table-wrapper">
                    <table className="na-table">
                        <thead>
                            <tr>
                                <th className="na-th">Usuario</th>
                                <th className="na-th">Correo Electrónico</th>
                                <th className="na-th">Rol</th>
                                <th className="na-th">Estado</th>
                                <th className="na-th">Fecha registro</th>
                                <th className="na-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length > 0 ? usuarios.map((user) => (
                                <tr key={user.id} className="na-table-row">
                                    <td className="na-td">
                                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                            <div className="na-avatar-circle" style={{ width:'30px', height:'30px', fontSize:'10px' }}>
                                                {user.nombre.substring(0, 2).toUpperCase()}
                                            </div>
                                            {user.nombre}
                                        </div>
                                    </td>
                                    <td className="na-td" style={{ color:'#7a8ba8' }}>{user.email}</td>
                                    <td className="na-td">
                                        <span className="na-specialty-tag" style={{
                                            borderColor: tab === 'docentes' ? 'rgba(163,255,79,0.3)' : 'rgba(0,229,255,0.3)',
                                            color:       tab === 'docentes' ? '#A3FF4F' : '#00E5FF',
                                        }}>
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="na-td">
                                        <span style={{
                                            display:'inline-block', width:'8px', height:'8px',
                                            borderRadius:'50%', marginRight:'8px',
                                            background:  user.is_active ? '#a3ff4f' : '#f87171',
                                            boxShadow:   user.is_active ? '0 0 8px #a3ff4f' : '0 0 8px #f87171',
                                        }}/>
                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                    </td>
                                    <td className="na-td" style={{ color:'#7a8ba8', fontSize:'12px' }}>
                                        {new Date(user.fecha_registro).toLocaleDateString('es-CO', {
                                            day:'2-digit', month:'short', year:'numeric'
                                        })}
                                    </td>
                                    <td className="na-td">

                                    <button
                                        className="na-btn-delete"
                                        onClick={() => eliminarUsuario(user.id, user.nombre)}>
                                        Eliminar
                                    </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="na-empty-msg">
                                        No hay {tab} registrados aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </>
    );
}

export default AdminUsuarios;
