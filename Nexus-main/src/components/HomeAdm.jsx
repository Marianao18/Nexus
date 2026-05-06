import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSolicitudes from './AdminSolicitudes';
import AdminUsuarios from './AdminUsuarios';
import './HomeAdm.css';

// ── Helper JWT ────────────────────────────────────────────────────────────────
const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});

// ── ICONOS ────────────────────────────────────────────────────────────────────
const IconHome = () => (
    <div className="na-nav-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    </div>
);
const IconSolicitudes = () => (
    <div className="na-nav-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
    </div>
);
const IconUsuarios = () => (
    <div className="na-nav-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    </div>
);
const IconCursos = () => (
    <div className="na-nav-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
    </div>
);

// ── COLORES POR TECNOLOGÍA ────────────────────────────────────────────────────
const TECNOLOGIAS = [
    { value: 'python',     label: 'Python',           color: '#3776AB' },
    { value: 'powerbi',    label: 'Power BI',         color: '#F2C811' },
    { value: 'excel',      label: 'Excel',            color: '#217346' },
    { value: 'django',     label: 'Django',           color: '#44B78B' },
    { value: 'java',       label: 'Java Spring Boot', color: '#6DB33F' },
    { value: 'postgresql', label: 'PostgreSQL',       color: '#336791' },
    { value: 'mongodb',    label: 'MongoDB',          color: '#4DB33D' },
    { value: 'otro',       label: 'Otro',             color: '#00E5FF' },
];

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const AdminHome = () => {
    const [vista, setVista]           = useState('resumen');
    const [usuarios, setUsuarios]     = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando]     = useState(false);
    const navigate = useNavigate();

    const obtenerUsuarios = async () => {
        setCargando(true);
        try {
            const res = await axios.get('/api/admin/solicitudes/', authHeaders());
            setUsuarios(res.data);
        } catch (e) { console.error(e); }
        finally { setCargando(false); }
    };

    const obtenerSolicitudes = async () => {
        setCargando(true);
        try {
            const res = await axios.get('/api/admin/solicitudes/', authHeaders());
            setSolicitudes(res.data);
        } catch (e) { console.error(e); }
        finally { setCargando(false); }
    };

    const eliminarUsuario = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este usuario?')) {
            try {
                await axios.delete(`/api/admin/usuarios/${id}/`, authHeaders());
                setUsuarios(usuarios.filter(u => u.id !== id));
            } catch (e) { console.error(e); }
        }
    };

    useEffect(() => {
        if (vista === 'usuarios')    obtenerUsuarios();
        if (vista === 'solicitudes') obtenerSolicitudes();
    }, [vista]);

    const cerrarSesion = () => {
        if (window.confirm('¿Deseas salir de NEXUS?')) {
            localStorage.clear();
            navigate('/login');
        }
    };

    return (
        <div className="na-layout">
            <aside className="na-sidebar">
                <div className="na-sidebar-logo">
                    <span>NEXUS</span> <span className="na-sidebar-tag">ADMIN</span>
                </div>
                <nav className="na-sidebar-nav">
                    <button onClick={() => setVista('resumen')}     className={`na-nav-item ${vista === 'resumen'     ? 'na-nav-active' : ''}`}><IconHome />        Inicio</button>
                    <button onClick={() => setVista('cursos')}      className={`na-nav-item ${vista === 'cursos'      ? 'na-nav-active' : ''}`}><IconCursos />      Cursos</button>
                    <button onClick={() => setVista('solicitudes')} className={`na-nav-item ${vista === 'solicitudes' ? 'na-nav-active' : ''}`}><IconSolicitudes /> Solicitudes</button>
                    <button onClick={() => setVista('usuarios')}    className={`na-nav-item ${vista === 'usuarios'    ? 'na-nav-active' : ''}`}><IconUsuarios />    Usuarios</button>
                </nav>
                <button onClick={cerrarSesion} className="na-logout-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Cerrar Sesión
                </button>
            </aside>

            <main className="na-main">
                <header className="na-topbar">
                    <div className="na-breadcrumb">
                        {{ resumen: 'Inicio', cursos: 'Cursos', solicitudes: 'Solicitudes', usuarios: 'Usuarios' }[vista]}
                    </div>
                    <div className="na-user-pill">
                        <span>Hola, Administrador</span>
                        <div className="na-avatar-circle">AD</div>
                    </div>
                </header>

                <div className="na-content">
                    {vista === 'resumen'     && <VistaResumen />}
                    {vista === 'cursos'      && <VistaCursos />}
                    {vista === 'solicitudes' && (
                        cargando ? <div className="na-empty-msg">Cargando...</div>
                                 : <AdminSolicitudes solicitudes={solicitudes} />
                    )}
                    {vista === 'usuarios' && <AdminUsuarios />
                    }
                </div>
            </main>
        </div>
    );
};

// ── VISTA: RESUMEN ────────────────────────────────────────────────────────────
const VistaResumen = () => (
    <div className="na-view na-fade-in">
        <div className="na-welcome-banner">
            <div>
                <p className="na-welcome-greeting">Bienvenido de nuevo,</p>
                <h1 className="na-welcome-name">Panel Administrativo</h1>
                <span className="na-welcome-role">CONTROL GLOBAL</span>
            </div>
            <div className="na-avatar-initials-lg">AD</div>
        </div>
        <div className="na-stats-grid" />
    </div>
);

// ── VISTA: CURSOS ─────────────────────────────────────────────────────────────
const VistaCursos = () => {
    const [cursos,   setCursos]   = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [guardando,   setGuardando]   = useState(false);
    const [msgForm,     setMsgForm]     = useState('');

    const [form, setForm] = useState({
        nombre: '', descripcion: '', tecnologia: 'python',
        color: '#3776AB', docente_id: '',
    });

    const cargar = async () => {
        setLoading(true);
        try {
            const [cRes, dRes] = await Promise.all([
                axios.get('/api/cursos/admin/cursos/', authHeaders()),
                axios.get('/api/cursos/admin/docentes/', authHeaders()),
            ]);
            setCursos(cRes.data);
            setDocentes(dRes.data);
        } catch { setError('No se pudieron cargar los cursos.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargar(); }, []);

    const handleTecnologia = (val) => {
        const tec = TECNOLOGIAS.find(t => t.value === val);
        setForm({ ...form, tecnologia: val, color: tec?.color || '#00E5FF' });
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        setMsgForm('');
        if (!form.nombre.trim()) { setMsgForm('err:El nombre es obligatorio.'); return; }
        if (!form.docente_id)    { setMsgForm('err:Debes asignar un docente.'); return; }
        setGuardando(true);
        try {
            await axios.post('/api/admin/cursos/', form, authHeaders());
            setMsgForm('ok:¡Curso creado exitosamente!');
            setForm({ nombre: '', descripcion: '', tecnologia: 'python', color: '#3776AB', docente_id: '' });
            cargar();
            setTimeout(() => { setMostrarForm(false); setMsgForm(''); }, 1500);
        } catch (err) {
            setMsgForm(`err:${err.response?.data?.error || 'Error al crear el curso.'}`);
        } finally { setGuardando(false); }
    };

    const toggleActivo = async (id) => {
        try {
            const res = await axios.patch(`/api/admin/cursos/${id}/`, {}, authHeaders());
            setCursos(prev => prev.map(c => c.id === id ? { ...c, activo: res.data.activo } : c));
        } catch { alert('Error al actualizar el curso.'); }
    };

    const eliminarCurso = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar el curso "${nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await axios.delete(`/api/admin/cursos/${id}/`, authHeaders());
            setCursos(prev => prev.filter(c => c.id !== id));
        } catch { alert('Error al eliminar el curso.'); }
    };

    if (loading) return <div className="na-empty-msg">Cargando cursos...</div>;
    if (error)   return <div className="na-empty-msg" style={{color:'#f87171'}}>{error}</div>;

    return (
        <div className="na-view na-fade-in">

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                <div>
                    <h2 style={{ fontSize:'22px', fontWeight:'700', color:'var(--na-text)' }}>Gestión de Cursos</h2>
                    <p style={{ fontSize:'13px', color:'var(--na-muted)', marginTop:'4px' }}>
                        {cursos.length} cursos en NEXUS
                    </p>
                </div>
                <button
                    onClick={() => { setMostrarForm(!mostrarForm); setMsgForm(''); }}
                    style={{
                        background: mostrarForm ? 'transparent' : '#00E5FF',
                        color: mostrarForm ? '#00E5FF' : '#060B14',
                        border: '1px solid #00E5FF',
                        borderRadius: '8px', padding: '9px 20px',
                        fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    {mostrarForm ? '✕ Cancelar' : '+ Crear curso'}
                </button>
            </div>

            {/* Formulario crear curso */}
            {mostrarForm && (
                <div style={{
                    background: 'var(--na-surface)', border: '1px solid rgba(0,229,255,0.2)',
                    borderRadius: '12px', padding: '24px', marginBottom: '28px',
                }}>
                    <h3 style={{ fontSize:'16px', fontWeight:'700', color:'var(--na-text)', marginBottom:'20px' }}>
                        Nuevo Curso
                    </h3>
                    <form onSubmit={handleCrear}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

                            <div style={{ gridColumn:'1/-1' }}>
                                <label style={labelStyle}>Nombre del curso *</label>
                                <input
                                    style={inputStyle}
                                    placeholder="Ej: Análisis de Datos con Python"
                                    value={form.nombre}
                                    onChange={e => setForm({...form, nombre: e.target.value})}
                                />
                            </div>

                            <div style={{ gridColumn:'1/-1' }}>
                                <label style={labelStyle}>Descripción</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight:'80px', resize:'vertical' }}
                                    placeholder="Describe brevemente el contenido del curso..."
                                    value={form.descripcion}
                                    onChange={e => setForm({...form, descripcion: e.target.value})}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Tecnología *</label>
                                <select
                                    style={inputStyle}
                                    value={form.tecnologia}
                                    onChange={e => handleTecnologia(e.target.value)}
                                >
                                    {TECNOLOGIAS.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Docente asignado *</label>
                                <select
                                    style={inputStyle}
                                    value={form.docente_id}
                                    onChange={e => setForm({...form, docente_id: e.target.value})}
                                >
                                    <option value="">— Selecciona un docente —</option>
                                    {docentes.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre} ({d.email})</option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        {/* Previsualización color */}
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', margin:'16px 0' }}>
                            <span style={{ width:'14px', height:'14px', borderRadius:'50%', background: form.color, flexShrink:0 }} />
                            <span style={{ fontSize:'12px', color:'var(--na-muted)' }}>
                                Color asignado automáticamente por tecnología: {form.color}
                            </span>
                        </div>

                        {msgForm && (
                            <div style={{
                                padding:'10px 14px', borderRadius:'8px', fontSize:'13px',
                                marginBottom:'16px',
                                background: msgForm.startsWith('ok') ? 'rgba(0,245,160,0.1)' : 'rgba(248,113,113,0.1)',
                                color:      msgForm.startsWith('ok') ? '#00f5a0' : '#f87171',
                                border:     `1px solid ${msgForm.startsWith('ok') ? 'rgba(0,245,160,0.3)' : 'rgba(248,113,113,0.3)'}`,
                            }}>
                                {msgForm.split(':')[1]}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={guardando}
                            style={{
                                background:'#00E5FF', color:'#060B14', border:'none',
                                borderRadius:'8px', padding:'10px 24px',
                                fontWeight:'700', fontSize:'13px', cursor:'pointer',
                                opacity: guardando ? 0.7 : 1, fontFamily:'inherit',
                            }}
                        >
                            {guardando ? 'Creando...' : 'Crear Curso'}
                        </button>
                    </form>
                </div>
            )}

            {/* Tabla de cursos */}
            {cursos.length === 0 ? (
                <div className="na-empty-msg">No hay cursos creados aún. ¡Crea el primero!</div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {cursos.map(curso => (
                        <div key={curso.id} style={{
                            background: 'var(--na-surface)',
                            border: `1px solid ${curso.activo ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                            borderLeft: `4px solid ${curso.activo ? curso.color : '#444'}`,
                            borderRadius: '10px', padding: '16px 20px',
                            display: 'flex', alignItems: 'center', gap: '16px',
                            opacity: curso.activo ? 1 : 0.55,
                        }}>
                            {/* Dot color */}
                            <div style={{ width:'10px', height:'10px', borderRadius:'50%', background: curso.color, flexShrink:0 }} />

                            {/* Info */}
                            <div style={{ flex:1 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'3px' }}>
                                    <span style={{ fontSize:'15px', fontWeight:'700', color:'var(--na-text)' }}>{curso.nombre}</span>
                                    <span style={{
                                        fontSize:'10px', padding:'2px 8px', borderRadius:'100px',
                                        background: curso.activo ? 'rgba(0,245,160,0.1)' : 'rgba(255,255,255,0.05)',
                                        color:      curso.activo ? '#00f5a0' : 'var(--na-muted)',
                                        border:     `1px solid ${curso.activo ? 'rgba(0,245,160,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                        fontFamily: 'monospace', letterSpacing:'0.1em',
                                    }}>
                                        {curso.activo ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </div>
                                <span style={{ fontSize:'12px', color:'var(--na-muted)' }}>
                                    Docente: {curso.docente} · {curso.num_modulos} módulos · {curso.inscritos} inscritos
                                </span>
                            </div>

                            {/* Acciones */}
                            <div style={{ display:'flex', gap:'8px' }}>
                                <button
                                    onClick={() => toggleActivo(curso.id)}
                                    style={{
                                        background:'transparent', border:'1px solid rgba(255,255,255,0.15)',
                                        borderRadius:'6px', padding:'6px 12px', color:'var(--na-muted)',
                                        fontSize:'12px', cursor:'pointer', fontFamily:'inherit',
                                    }}
                                >
                                    {curso.activo ? 'Desactivar' : 'Activar'}
                                </button>
                                <button
                                    onClick={() => eliminarCurso(curso.id, curso.nombre)}
                                    style={{
                                        background:'transparent', border:'1px solid rgba(248,113,113,0.3)',
                                        borderRadius:'6px', padding:'6px 12px', color:'#f87171',
                                        fontSize:'12px', cursor:'pointer', fontFamily:'inherit',
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── ESTILOS INLINE REUTILIZABLES ──────────────────────────────────────────────
const labelStyle = {
    display:'block', fontSize:'11px', fontWeight:'600',
    color:'var(--na-muted)', letterSpacing:'0.1em',
    textTransform:'uppercase', marginBottom:'6px',
};

const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px',
    padding:'9px 12px', color:'var(--na-text)', fontSize:'13px',
    fontFamily:'inherit', outline:'none', boxSizing:'border-box',
};

export default AdminHome;
