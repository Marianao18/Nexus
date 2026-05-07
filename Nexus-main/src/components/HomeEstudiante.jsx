import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomeEstudiante.css';
import NexIA from './NexIA';
import { useNavigate } from 'react-router-dom';



const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});

// ─── ICONOS ───────────────────────────────────────────────────────────────────
const IconHome    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconBook    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
const IconMap     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IconChart   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
const IconUser    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLogout  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconToggle  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconStar    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconLock    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IconEye     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconSave    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconExplore = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

// ─── HELPERS UI ───────────────────────────────────────────────────────────────
const Loader = () => (
    <div style={{display:'flex',justifyContent:'center',padding:'60px',color:'var(--est-muted)'}}>
        Cargando...
    </div>
);
const ErrorMsg = ({ msg }) => (
    <div style={{padding:'16px',color:'#f87171',background:'rgba(248,113,113,0.1)',borderRadius:'8px',margin:'20px 0'}}>
        ⚠️ {msg}
    </div>
);

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const HomeEstudiante = () => {
    const [activeSection, setActiveSection] = useState('inicio');
    const [sidebarOpen,   setSidebarOpen]   = useState(true);

    const userName  = localStorage.getItem('userName') || 'Estudiante';
    const userEmail = localStorage.getItem('email')    || '';
    const initials  = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => {
        if (window.confirm('¿Deseas cerrar sesión?')) {
            localStorage.clear();
            window.dispatchEvent(new Event('authChange'));
            window.location.href = '/';
        }
    };

    const navItems = [
        { id: 'inicio',    label: 'Inicio',               icon: <IconHome /> },
        { id: 'explorar',  label: 'Explorar Cursos',      icon: <IconExplore /> },
        { id: 'cursos',    label: 'Mis Cursos',           icon: <IconBook /> },
        { id: 'rutas',     label: 'Rutas de Aprendizaje', icon: <IconMap /> },
        { id: 'progreso',  label: 'Progreso',             icon: <IconChart /> },
        { id: 'perfil',    label: 'Mi Perfil',            icon: <IconUser /> },
    ];

    return (
        <div className="est-wrapper">
            <aside className={`est-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="est-sidebar-header">
                    <div className="est-logo">
                        <span className="est-logo-nex">NEX</span><span className="est-logo-us">US</span>
                        <span className="est-role-badge">ESTUDIANTE</span>
                    </div>
                    <button className="est-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <IconToggle />
                    </button>
                </div>

                <div className="est-profile-mini">
                    <div className="est-avatar-sm">{initials}</div>
                    {sidebarOpen && (
                        <div className="est-profile-info">
                            <span className="est-profile-name">{userName}</span>
                            <span className="est-profile-sub">NEXUS ID</span>
                        </div>
                    )}
                </div>

                <nav className="est-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`est-nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            <span className="est-nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="est-nav-label">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="est-sidebar-footer">
                    <button className="est-logout-btn" onClick={handleLogout} type="button">
                        <IconLogout />
                        {sidebarOpen && <span style={{marginLeft:'10px'}}>Cerrar sesión</span>}
                    </button>
                </div>
            </aside>

            <main className="est-main">
                <header className="est-topbar">
                    <h1 className="est-page-title">{navItems.find(n => n.id === activeSection)?.label}</h1>
                    <div className="est-topbar-right">
                        <span>Hola, {userName.split(' ')[0]}</span>
                        <div className="est-avatar-top">{initials}</div>
                    </div>
                </header>
                <div className="est-content">
                    {activeSection === 'inicio'   && <SectionInicio userName={userName} initials={initials} setActiveSection={setActiveSection} />}
                    {activeSection === 'explorar' && <SectionExplorar setActiveSection={setActiveSection} />}
                    {activeSection === 'cursos'   && <SectionCursos />}
                    {activeSection === 'rutas'    && <SectionRutas />}
                    {activeSection === 'progreso' && <SectionProgreso />}
                    {activeSection === 'perfil'   && <SectionPerfil userName={userName} userEmail={userEmail} initials={initials} />}
                </div>
            </main>

            <NexIA />
        </div>
    );
};

// ─── SECCIÓN: INICIO ──────────────────────────────────────────────────────────
const SectionInicio = ({ userName, initials, setActiveSection }) => {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        axios.get('/api/estudiante/resumen/', authHeaders())
            .then(res => setData(res.data))
            .catch(() => setError('No se pudo cargar el resumen.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader />;
    if (error)   return <ErrorMsg msg={error} />;

    return (
        <div className="est-section-content">
            <div className="est-welcome-card">
                <div className="est-welcome-text">
                    <p className="est-welcome-sub">Bienvenido de nuevo,</p>
                    <h2 className="est-welcome-name">{userName}</h2>
                    <span className="est-level-badge">Nivel {data.nivel}</span>
                </div>
                <div className="est-welcome-avatar">{initials}</div>
            </div>

            <div className="est-metrics-grid">
                <div className="est-metric-card cyan" onClick={() => setActiveSection('cursos')} style={{cursor:'pointer'}}>
                    <IconBook />
                    <div><span className="est-metric-value">{data.cursos_activos}</span><span className="est-metric-label">Cursos activos</span></div>
                </div>
                <div className="est-metric-card green">
                    <IconChart />
                    <div><span className="est-metric-value">{data.progreso_global}%</span><span className="est-metric-label">Progreso general</span></div>
                </div>
                <div className="est-metric-card purple" onClick={() => setActiveSection('rutas')} style={{cursor:'pointer'}}>
                    <IconMap />
                    <div><span className="est-metric-value">{data.rutas_activas}</span><span className="est-metric-label">Rutas activas</span></div>
                </div>
                <div className="est-metric-card orange">
                    <IconStar />
                    <div><span className="est-metric-value">{data.xp_total.toLocaleString()}</span><span className="est-metric-label">XP acumulados</span></div>
                </div>
            </div>

            <div className="est-block">
                <h3 className="est-block-title">Actividad reciente</h3>
                <div className="est-activity-list">
                    {data.actividad.length > 0 ? data.actividad.map((item, i) => (
                        <div key={i} className="est-activity-item">
                            <span className="est-activity-dot" style={{background: item.color}} />
                            <div>
                                <p className="est-activity-text">{item.texto}</p>
                                <p className="est-activity-time">{item.tiempo}</p>
                            </div>
                        </div>
                    )) : (
                        <div style={{textAlign:'center', padding:'24px'}}>
                            <p style={{color:'var(--est-muted)', fontSize:'14px', marginBottom:'12px'}}>
                                Aún no tienes actividad. ¡Explora los cursos disponibles!
                            </p>
                            <button
                                onClick={() => setActiveSection('explorar')}
                                style={{
                                    background:'#00E5FF', color:'#060B14', border:'none',
                                    borderRadius:'8px', padding:'9px 20px', fontWeight:'700',
                                    fontSize:'13px', cursor:'pointer',
                                }}
                            >
                                Explorar cursos →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── SECCIÓN: EXPLORAR CURSOS ────────────────────────────────────────────────
const SectionExplorar = ({ setActiveSection }) => {
    const [cursos,    setCursos]    = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState('');
    const [inscribiendo, setInscribiendo] = useState(null);
    const [mensajes,  setMensajes]  = useState({});

    useEffect(() => {
        axios.get('/api/cursos/catalogo/', authHeaders())
            .then(res => setCursos(res.data))
            .catch(() => setError('No se pudo cargar el catálogo.'))
            .finally(() => setLoading(false));
    }, []);

    const inscribirse = async (cursoId, nombreCurso) => {
        setInscribiendo(cursoId);
        setMensajes({});
        try {
            const res = await axios.post('/api/cursos/inscribirse/', { curso_id: cursoId }, authHeaders());
            setCursos(prev => prev.map(c => c.id === cursoId ? {...c, inscrito: true} : c));
            setMensajes({ [cursoId]: { tipo:'ok', texto: res.data.mensaje } });
        } catch (err) {
            setMensajes({ [cursoId]: { tipo:'err', texto: err.response?.data?.error || 'Error al inscribirse.' } });
        } finally {
            setInscribiendo(null);
        }
    };

    if (loading) return <Loader />;
    if (error)   return <ErrorMsg msg={error} />;

    return (
        <div className="est-section-content">
            <p style={{color:'var(--est-muted)', fontSize:'14px', marginBottom:'24px'}}>
                {cursos.length} cursos disponibles en NEXUS — inscríbete en los que quieras seguir.
            </p>

            {cursos.length === 0 ? (
                <div style={{textAlign:'center', padding:'48px', color:'var(--est-muted)'}}>
                    No hay cursos disponibles por el momento.
                </div>
            ) : (
                <div className="est-courses-grid">
                    {cursos.map(curso => (
                        <div key={curso.id} className="est-course-card" style={{opacity: curso.inscrito ? 0.85 : 1}}>
                            <div className="est-course-top" style={{borderColor: curso.color}}>
                                <span className="est-course-tag" style={{color: curso.color, borderColor: curso.color}}>
                                    {curso.tecnologia.toUpperCase()}
                                </span>
                                <h4 className="est-course-name">{curso.nombre}</h4>
                                <p className="est-course-docente">Docente: {curso.docente}</p>
                                {curso.descripcion && (
                                    <p style={{fontSize:'12px', color:'var(--est-muted)', marginTop:'6px', lineHeight:'1.5'}}>
                                        {curso.descripcion}
                                    </p>
                                )}
                            </div>
                            <div className="est-course-bottom">
                                <p style={{fontSize:'12px', color:'var(--est-muted)', marginBottom:'12px'}}>
                                    {curso.num_modulos} módulos
                                </p>

                                {mensajes[curso.id] && (
                                    <p style={{
                                        fontSize:'12px', marginBottom:'10px',
                                        color: mensajes[curso.id].tipo === 'ok' ? '#00f5a0' : '#f87171'
                                    }}>
                                        {mensajes[curso.id].texto}
                                    </p>
                                )}

                                {curso.inscrito ? (
                                    <button
                                        className="est-btn-outline"
                                        style={{borderColor:'#00f5a0', color:'#00f5a0', cursor:'default'}}
                                        disabled
                                    >
                                        ✓ Ya inscrito — ir a Mis Cursos
                                    </button>
                                ) : (
                                    <button
                                        className="est-btn-outline"
                                        style={{borderColor: curso.color, color: curso.color}}
                                        onClick={() => inscribirse(curso.id, curso.nombre)}
                                        disabled={inscribiendo === curso.id}
                                    >
                                        {inscribiendo === curso.id ? 'Inscribiendo...' : 'Inscribirme'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── SECCIÓN: MIS CURSOS ──────────────────────────────────────────────────────
const SectionCursos = () => {
    const [cursos,  setCursos]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/estudiante/cursos/', authHeaders())
            .then(res => setCursos(res.data))
            .catch(() => setError('No se pudieron cargar tus cursos.'))
            .finally(() => setLoading(false));
    }, []);

    const getTag = (p) => p === 0 ? 'No iniciado' : p === 100 ? 'Completado' : 'En progreso';

    if (loading) return <Loader />;
    if (error)   return <ErrorMsg msg={error} />;

    return (
        <div className="est-section-content">
            {cursos.length === 0 ? (
                <div style={{textAlign:'center', padding:'48px', color:'var(--est-muted)'}}>
                    <p style={{marginBottom:'12px'}}>No tienes cursos inscritos aún.</p>
                </div>
            ) : (
                <div className="est-courses-grid">
                    {cursos.map(curso => (
                        <div key={curso.id} className="est-course-card">
                            <div className="est-course-top" style={{borderColor: curso.color}}>
                                <span className="est-course-tag" style={{color: curso.color, borderColor: curso.color}}>
                                    {getTag(curso.progreso)}
                                </span>
                                <h4 className="est-course-name">{curso.nombre}</h4>
                                <p className="est-course-docente">Docente: {curso.docente_nombre}</p>
                            </div>
                            <div className="est-course-bottom">
                                <div className="est-progress-bar-wrap">
                                    <div className="est-progress-bar" style={{width:`${curso.progreso}%`, background: curso.color}} />
                                </div>
                                <div className="est-course-meta">
                                    <span>{curso.modulos_completados}/{curso.modulos_total} módulos</span>
                                    <span style={{color: curso.color}}>{curso.progreso}%</span>
                                </div>
                                <button className="est-btn-outline" style={{borderColor: curso.color, color: curso.color}} onClick={() => navigate(`/curso/${curso.id}/ver`)}>
                                    {curso.progreso === 0 ? 'Comenzar' : curso.progreso === 100 ? 'Revisar' : 'Continuar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── SECCIÓN: RUTAS ───────────────────────────────────────────────────────────
const SectionRutas = () => {
    const [rutas,   setRutas]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        axios.get('/api/estudiante/rutas/', authHeaders())
            .then(res => setRutas(res.data))
            .catch(() => setError('No se pudieron cargar tus rutas.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader />;
    if (error)   return <ErrorMsg msg={error} />;

    return (
        <div className="est-section-content">
            {rutas.length === 0 ? (
                <p style={{color:'var(--est-muted)'}}>No tienes rutas de aprendizaje activas.</p>
            ) : (
                <div className="est-rutas-grid">
                    {rutas.map(ruta => (
                        <div key={ruta.id} className="est-ruta-card" style={{borderLeft:`4px solid ${ruta.color}`}}>
                            <h4>{ruta.nombre}</h4>
                            <p style={{color:'var(--est-muted)',fontSize:'13px',margin:'6px 0'}}>{ruta.descripcion}</p>
                            <p>Duración: {ruta.duracion} · {ruta.num_cursos} cursos</p>
                            <div className="est-progress-bar-wrap" style={{margin:'12px 0 6px'}}>
                                <div className="est-progress-bar" style={{width:`${ruta.progreso}%`, background: ruta.color}} />
                            </div>
                            <span style={{color: ruta.color}}>{ruta.progreso}% completado</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── SECCIÓN: PROGRESO ────────────────────────────────────────────────────────
const SectionProgreso = () => {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        axios.get('/api/estudiante/progreso/', authHeaders())
            .then(res => setData(res.data))
            .catch(() => setError('No se pudo cargar el progreso.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader />;
    if (error)   return <ErrorMsg msg={error} />;

    return (
        <div className="est-section-content">
            <div className="est-perfil-card">
                <h3 className="est-block-title"><IconChart /> Estadísticas de aprendizaje</h3>
                <p style={{color:'var(--est-muted)',margin:'8px 0 20px',fontSize:'14px'}}>
                    Has completado <strong style={{color:'var(--est-cyan)'}}>{data.modulos_completados_total} módulos</strong> en total.
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                    {data.detalle_cursos.map((curso, i) => (
                        <div key={i}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                                <span style={{fontSize:'13px',color:'var(--est-text)'}}>{curso.curso}</span>
                                <span style={{fontSize:'13px',color:curso.color}}>{curso.progreso}% · {curso.completados}/{curso.total} módulos</span>
                            </div>
                            <div className="est-progress-bar-wrap">
                                <div className="est-progress-bar" style={{width:`${curso.progreso}%`,background:curso.color}} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── SECCIÓN: PERFIL ──────────────────────────────────────────────────────────
const SectionPerfil = ({ userName, userEmail, initials }) => {
    const [pass,     setPass]     = useState({ actual:'', nueva:'', confirmar:'' });
    const [passMsg,  setPassMsg]  = useState('');
    const [showPass, setShowPass] = useState({ actual:false, nueva:false, confirmar:false });

    const handlePassSave = async () => {
        setPassMsg('');
        if (!pass.actual || !pass.nueva || pass.nueva !== pass.confirmar) {
            setPassMsg('err:Las contraseñas no coinciden o hay campos vacíos.');
            return;
        }
        try {
            await axios.post('/api/cambiar-password-perfil/',
                { password_actual: pass.actual, nueva_password: pass.nueva },
                authHeaders()
            );
            setPassMsg('ok:Contraseña actualizada correctamente.');
            setPass({ actual:'', nueva:'', confirmar:'' });
        } catch (err) {
            setPassMsg(`err:${err.response?.data?.error || 'Error de conexión'}`);
        }
    };

    return (
        <div className="est-section-content">
            <div className="est-perfil-card">
                <div className="est-perfil-top">
                    <div className="est-avatar-lg">{initials}</div>
                    <div>
                        <h2 className="est-perfil-nombre">{userName}</h2>
                        <p className="est-perfil-email">{userEmail}</p>
                    </div>
                </div>
                <hr className="est-divider" />
                <h3 className="est-block-title"><IconLock /> Seguridad</h3>
                <div className="est-pass-grid">
                    {['actual','nueva','confirmar'].map(f => (
                        <div key={f} className="est-perfil-field">
                            <label className="est-label-mini">{f === 'actual' ? 'Actual' : f === 'nueva' ? 'Nueva' : 'Confirmar'}</label>
                            <div className="est-input-wrapper">
                                <input
                                    type={showPass[f] ? 'text' : 'password'}
                                    value={pass[f]}
                                    onChange={e => setPass({...pass, [f]: e.target.value})}
                                    className="est-input-dark"
                                />
                                <button type="button" onClick={() => setShowPass({...showPass, [f]: !showPass[f]})} className="est-eye-btn">
                                    <IconEye />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {passMsg && (
                    <div className={`est-msg ${passMsg.startsWith('ok') ? 'ok' : 'err'}`} style={{marginTop:'10px'}}>
                        {passMsg.split(':')[1]}
                    </div>
                )}
                <button className="est-btn-primary" onClick={handlePassSave} style={{marginTop:'20px'}}>
                    <IconSave /> Actualizar contraseña
                </button>
            </div>
        </div>
    );
};

export default HomeEstudiante;
