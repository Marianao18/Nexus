import { useNexusModal } from './NexusModal';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './HomeEstudiante.css';
import NexIA from './NexIA';
import { useNavigate } from 'react-router-dom';



const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});

// --- ICONOS -------------------------------------------------------------------
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

// --- HELPERS UI ---------------------------------------------------------------
const Loader = () => (
    <div style={{display:'flex',justifyContent:'center',padding:'60px',color:'var(--est-muted)'}}>
        Cargando...
    </div>
);
const ErrorMsg = ({ msg }) => (
    <div style={{padding:'16px',color:'#f87171',background:'rgba(248,113,113,0.1)',borderRadius:'8px',margin:'20px 0'}}>
        ⚠ {msg}
    </div>
);

// --- COMPONENTE PRINCIPAL -----------------------------------------------------
const HomeEstudiante = () => {
    const { modalJSX, showAlert, showConfirm } = useNexusModal();
    const [activeSection, setActiveSection] = useState('inicio');
    const [sidebarOpen,   setSidebarOpen]   = useState(true);

    const userName  = localStorage.getItem('userName') || 'Estudiante';
    const userEmail = localStorage.getItem('email')    || '';
    const initials  = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Avatar global — se comparte con sidebar, topbar y perfil
    const [avatarId,  setAvatarId]  = useState(null);   // id animal: oso, gato, tortuga, ave
    const [fotoUrl,   setFotoUrl]   = useState(null);   // URL foto subida por el usuario

    useEffect(() => {
        const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });
        axios.get('/api/perfil/', authH()).then(res => {
            if (res.data.avatar_id)   setAvatarId(res.data.avatar_id);
            if (res.data.foto_perfil) setFotoUrl(res.data.foto_perfil);
        }).catch(() => {});
    }, []);

    const handleLogout = async () => {
        const ok = await showConfirm('¿Deseas cerrar sesión?', { type: 'warning', title: 'Cerrar sesión', confirmLabel: 'Sí, salir' });
        if (ok) {
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
        <>
        {modalJSX}
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
                    <AvatarDisplay
                        avatarId={avatarId} fotoUrl={fotoUrl} initials={initials}
                        size={36} colorBorder={false}
                    />
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
                        <AvatarDisplay
                            avatarId={avatarId} fotoUrl={fotoUrl} initials={initials}
                            size={36} colorBorder={true}
                        />
                    </div>
                </header>
                <div className="est-content">
                    {activeSection === 'inicio' && <SectionInicio userName={userName} initials={initials} avatarId={avatarId} fotoUrl={fotoUrl} setActiveSection={setActiveSection} />}
                    {activeSection === 'explorar' && <SectionExplorar setActiveSection={setActiveSection} />}
                    {activeSection === 'cursos'   && <SectionCursos />}
                    {activeSection === 'rutas'    && <SectionRutas />}
                    {activeSection === 'progreso' && <SectionProgreso />}
                    {activeSection === 'perfil' && <SectionPerfil userName={userName} userEmail={userEmail} initials={initials} avatarId={avatarId} fotoUrl={fotoUrl} setAvatarId={setAvatarId} setFotoUrl={setFotoUrl} />}
                </div>
            </main>

            <NexIA />
        </div>
        </>
    );
};

// --- SECCIÓN: INICIO ----------------------------------------------------------
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

// --- SECCIÓN: EXPLORAR CURSOS ------------------------------------------------
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
                {cursos.length} cursos disponibles en NEXUS - inscríbete en los que quieras seguir.
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
                                        ✓ Ya inscrito - ir a Mis Cursos
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

// --- SECCIÓN: MIS CURSOS ------------------------------------------------------
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

// --- SECCIÓN: RUTAS -----------------------------------------------------------
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

// --- SECCIÓN: PROGRESO --------------------------------------------------------
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

// ── AVATARES ANIMALES TECNOLÓGICOS ──────────────────────────────────────────
const AVATARES = [
    {
        id: 'oso',
        nombre: 'Oso Dev',
        color: '#7b5cfa',
        svg: (
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                {/* Orejas */}
                <circle cx="18" cy="22" r="12" fill="#7b5cfa"/>
                <circle cx="62" cy="22" r="12" fill="#7b5cfa"/>
                <circle cx="18" cy="22" r="7" fill="#a78bfa"/>
                <circle cx="62" cy="22" r="7" fill="#a78bfa"/>
                {/* Cara */}
                <circle cx="40" cy="46" r="28" fill="#7b5cfa"/>
                {/* Hocico */}
                <ellipse cx="40" cy="55" rx="12" ry="8" fill="#a78bfa"/>
                {/* Ojos */}
                <circle cx="30" cy="40" r="5" fill="white"/>
                <circle cx="50" cy="40" r="5" fill="white"/>
                <circle cx="31" cy="41" r="3" fill="#1a0a2e"/>
                <circle cx="51" cy="41" r="3" fill="#1a0a2e"/>
                <circle cx="32" cy="40" r="1" fill="white"/>
                <circle cx="52" cy="40" r="1" fill="white"/>
                {/* Nariz */}
                <ellipse cx="40" cy="52" rx="4" ry="3" fill="#1a0a2e"/>
                {/* Wifi en frente */}
                <path d="M35 30 Q40 26 45 30" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M32 27 Q40 21 48 27" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
                <circle cx="40" cy="33" r="2" fill="#00e5ff"/>
            </svg>
        ),
    },
    {
        id: 'gato',
        nombre: 'Gato Coder',
        color: '#00e5ff',
        svg: (
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                {/* Orejas puntiagudas */}
                <polygon points="12,30 22,8 32,30" fill="#0d9aaa"/>
                <polygon points="48,30 58,8 68,30" fill="#0d9aaa"/>
                <polygon points="15,28 22,13 29,28" fill="#00e5ff" opacity="0.5"/>
                <polygon points="51,28 58,13 65,28" fill="#00e5ff" opacity="0.5"/>
                {/* Cara */}
                <circle cx="40" cy="48" r="26" fill="#0d9aaa"/>
                {/* Ojos grandes */}
                <ellipse cx="30" cy="43" rx="7" ry="8" fill="#00f5a0"/>
                <ellipse cx="50" cy="43" rx="7" ry="8" fill="#00f5a0"/>
                <ellipse cx="30" cy="44" rx="3" ry="6" fill="#0a0a0a"/>
                <ellipse cx="50" cy="44" rx="3" ry="6" fill="#0a0a0a"/>
                <circle cx="28" cy="41" r="1.5" fill="white"/>
                <circle cx="48" cy="41" r="1.5" fill="white"/>
                {/* Nariz */}
                <polygon points="40,52 37,56 43,56" fill="#ff6b9d"/>
                {/* Boca */}
                <path d="M37 56 Q40 60 43 56" stroke="#ff6b9d" strokeWidth="1.5" fill="none"/>
                {/* Bigotes */}
                <line x1="10" y1="53" x2="28" y2="54" stroke="white" strokeWidth="1" opacity="0.7"/>
                <line x1="10" y1="57" x2="28" y2="56" stroke="white" strokeWidth="1" opacity="0.7"/>
                <line x1="52" y1="54" x2="70" y2="53" stroke="white" strokeWidth="1" opacity="0.7"/>
                <line x1="52" y1="56" x2="70" y2="57" stroke="white" strokeWidth="1" opacity="0.7"/>
                {/* Terminal en frente */}
                <rect x="33" y="30" width="14" height="9" rx="2" fill="#060b14" opacity="0.8"/>
                <text x="36" y="37" fill="#00e5ff" fontSize="5" fontFamily="monospace">&gt;_</text>
            </svg>
        ),
    },
    {
        id: 'tortuga',
        nombre: 'Tortuga Senior',
        color: '#00f5a0',
        svg: (
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                {/* Caparazón */}
                <circle cx="40" cy="42" r="26" fill="#00a86b"/>
                {/* Patrón del caparazón */}
                <circle cx="40" cy="42" r="26" fill="none" stroke="#00f5a0" strokeWidth="1" opacity="0.4"/>
                <circle cx="40" cy="36" r="10" fill="#00c77a" opacity="0.6"/>
                <circle cx="27" cy="46" r="7" fill="#00c77a" opacity="0.5"/>
                <circle cx="53" cy="46" r="7" fill="#00c77a" opacity="0.5"/>
                <circle cx="40" cy="53" r="7" fill="#00c77a" opacity="0.5"/>
                {/* Cabeza */}
                <circle cx="40" cy="20" r="14" fill="#00a86b"/>
                {/* Ojos con lentes de programador */}
                <rect x="26" y="14" width="10" height="8" rx="3" fill="#060b14"/>
                <rect x="44" y="14" width="10" height="8" rx="3" fill="#060b14"/>
                <rect x="36" y="17" width="8" height="2" rx="1" fill="#444"/>
                <circle cx="31" cy="18" r="2.5" fill="#00f5a0" opacity="0.8"/>
                <circle cx="49" cy="18" r="2.5" fill="#00f5a0" opacity="0.8"/>
                <circle cx="30" cy="17" r="1" fill="white" opacity="0.6"/>
                <circle cx="48" cy="17" r="1" fill="white" opacity="0.6"/>
                {/* Sonrisa */}
                <path d="M34 26 Q40 31 46 26" stroke="#00f5a0" strokeWidth="2" fill="none" strokeLinecap="round"/>
                {/* Patitas */}
                <ellipse cx="18" cy="54" rx="7" ry="5" fill="#00a86b"/>
                <ellipse cx="62" cy="54" rx="7" ry="5" fill="#00a86b"/>
                <ellipse cx="26" cy="66" rx="6" ry="4" fill="#00a86b"/>
                <ellipse cx="54" cy="66" rx="6" ry="4" fill="#00a86b"/>
            </svg>
        ),
    },
    {
        id: 'ave',
        nombre: 'Ave Cloud',
        color: '#fbbf24',
        svg: (
            <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
                {/* Cuerpo */}
                <ellipse cx="40" cy="52" rx="22" ry="18" fill="#f59e0b"/>
                {/* Cabeza */}
                <circle cx="40" cy="28" r="18" fill="#f59e0b"/>
                {/* Cresta */}
                <path d="M34 12 Q37 4 40 10 Q43 2 46 10 Q50 5 48 12" fill="#ef4444"/>
                {/* Pico */}
                <path d="M30 30 L20 33 L30 36" fill="#ef4444"/>
                {/* Ojo con monocle tech */}
                <circle cx="44" cy="26" r="8" fill="white"/>
                <circle cx="44" cy="26" r="5" fill="#1a0a2e"/>
                <circle cx="44" cy="26" r="3" fill="#fbbf24"/>
                <circle cx="43" cy="25" r="1" fill="white"/>
                <circle cx="38" cy="25" r="3" fill="white" opacity="0.3"/>
                {/* Alas */}
                <path d="M18 50 Q10 42 14 58 Q20 62 26 56" fill="#d97706"/>
                <path d="M62 50 Q70 42 66 58 Q60 62 54 56" fill="#d97706"/>
                {/* Patas */}
                <line x1="34" y1="68" x2="30" y2="76" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="46" y1="68" x2="50" y2="76" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="30" y1="76" x2="24" y2="74" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                <line x1="30" y1="76" x2="28" y2="80" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                <line x1="50" y1="76" x2="56" y2="74" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                <line x1="50" y1="76" x2="52" y2="80" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                {/* Nube en pecho */}
                <circle cx="40" cy="50" r="5" fill="white" opacity="0.3"/>
                <circle cx="45" cy="48" r="4" fill="white" opacity="0.3"/>
                <circle cx="35" cy="48" r="4" fill="white" opacity="0.3"/>
            </svg>
        ),
    },
];

// ── AvatarDisplay — componente reutilizable en toda la app ─────────────────
const AvatarDisplay = ({ avatarId, fotoUrl, initials, size = 40, colorBorder = true }) => {
    const av = AVATARES.find(a => a.id === avatarId);
    const borderColor = av ? av.color : '#00e5ff';
    const border = colorBorder ? `2px solid ${borderColor}` : 'none';
    const shadow = colorBorder && av ? `0 0 10px ${borderColor}40` : 'none';

    if (fotoUrl) return (
        <img src={fotoUrl} alt="avatar"
            style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border, boxShadow:shadow, flexShrink:0 }} />
    );
    if (av) return (
        <div style={{ width:size, height:size, borderRadius:'50%', border, boxShadow:shadow,
            display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
            background:'transparent', flexShrink:0 }}>
            <div style={{ transform:`scale(${size/80})`, transformOrigin:'center', width:80, height:80,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {av.svg}
            </div>
        </div>
    );
    return (
        <div style={{ width:size, height:size, borderRadius:'50%', border,
            background:'linear-gradient(135deg, #00e5ff, #7b5cfa)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            fontSize: size * 0.3, fontWeight:'800', color:'#060b14' }}>
            {initials}
        </div>
    );
};

// ── SectionPerfil — diseño mejorado con foto subida + avatares ───────────────
const SectionPerfil = ({ userName, userEmail, initials, avatarId, fotoUrl, setAvatarId, setFotoUrl }) => {
    const [pass,        setPass]        = useState({ actual:'', nueva:'', confirmar:'' });
    const [passMsg,     setPassMsg]     = useState('');
    const [showPass,    setShowPass]    = useState({ actual:false, nueva:false, confirmar:false });
    const [mostrarPick, setMostrarPick] = useState(false);
    const [localAvId,   setLocalAvId]   = useState(avatarId);
    const [localFoto,   setLocalFoto]   = useState(fotoUrl);
    const fileRef = useRef(null);

    const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });

    // Sincronizar con estado global al abrir
    useEffect(() => { setLocalAvId(avatarId); setLocalFoto(fotoUrl); }, [avatarId, fotoUrl]);

    const seleccionarAvatar = async (id) => {
        setLocalAvId(id);
        setLocalFoto(null);       // quitar foto si había
        setAvatarId(id);
        setFotoUrl(null);
        setMostrarPick(false);
        try {
            await axios.patch('/api/perfil/', { avatar_id: id }, authH());
        } catch (err) { console.error('Error guardando avatar:', err); }
    };

    const handleFotoSubida = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Preview inmediato
        const reader = new FileReader();
        reader.onloadend = () => { setLocalFoto(reader.result); setFotoUrl(reader.result); };
        reader.readAsDataURL(file);
        setLocalAvId(null);
        setAvatarId(null);
        setMostrarPick(false);
        // Subir al backend
        const formData = new FormData();
        formData.append('foto_perfil', file);
        formData.append('avatar_id', '');
        try {
            const res = await axios.patch('/api/perfil/', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}`, 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.foto_perfil) { setLocalFoto(res.data.foto_perfil); setFotoUrl(res.data.foto_perfil); }
        } catch (err) { console.error('Error subiendo foto:', err); }
    };

    const handlePassSave = async () => {
        setPassMsg('');
        if (!pass.actual || !pass.nueva || pass.nueva !== pass.confirmar) {
            setPassMsg('err:Las contraseñas no coinciden o hay campos vacíos.'); return;
        }
        try {
            await axios.post('/api/cambiar-password-perfil/',
                { password_actual: pass.actual, nueva_password: pass.nueva }, authH());
            setPassMsg('ok:Contraseña actualizada correctamente.');
            setPass({ actual:'', nueva:'', confirmar:'' });
        } catch (err) {
            setPassMsg(`err:${err.response?.data?.error || 'Error de conexión'}`);
        }
    };

    const avActual = AVATARES.find(a => a.id === localAvId);

    return (
        <div className="est-section-content">

            {/* Modal selector */}
            {mostrarPick && (
                <div onClick={(e) => e.target === e.currentTarget && setMostrarPick(false)} style={{
                    position:'fixed', inset:0, zIndex:9000,
                    background:'rgba(6,11,20,0.88)', backdropFilter:'blur(8px)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                    <div style={{
                        background:'#0d1525', border:'1px solid rgba(0,229,255,0.2)',
                        borderRadius:'20px', padding:'32px', maxWidth:'500px', width:'92%',
                        boxShadow:'0 24px 60px rgba(0,0,0,0.6)',
                    }}>
                        <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:'800', fontSize:'18px', color:'#eef2ff', margin:'0 0 4px' }}>
                            Personaliza tu perfil
                        </h3>
                        <p style={{ color:'#7a8ba8', fontSize:'13px', margin:'0 0 20px' }}>
                            Elige un avatar o sube tu propia foto
                        </p>

                        {/* Botón subir foto propia */}
                        <button onClick={() => fileRef.current.click()} style={{
                            width:'100%', padding:'14px', marginBottom:'20px',
                            background:'rgba(0,229,255,0.06)', border:'1px dashed rgba(0,229,255,0.3)',
                            borderRadius:'12px', color:'#00e5ff', cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
                            fontFamily:'inherit', fontSize:'13px', fontWeight:'600',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Subir mi propia foto
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFotoSubida} />

                        {/* Separador */}
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
                            <span style={{ color:'#7a8ba8', fontSize:'11px', fontFamily:'monospace' }}>O ELIGE UN AVATAR</span>
                            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
                        </div>

                        {/* Grid avatares */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                            {AVATARES.map(av => (
                                <button key={av.id} onClick={() => seleccionarAvatar(av.id)} style={{
                                    background: localAvId === av.id ? `${av.color}18` : 'rgba(255,255,255,0.02)',
                                    border: `2px solid ${localAvId === av.id ? av.color : 'rgba(255,255,255,0.07)'}`,
                                    borderRadius:'14px', padding:'16px 12px', cursor:'pointer',
                                    display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
                                    transition:'all 0.2s ease',
                                }}>
                                    <div style={{ width:70, height:70, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        {av.svg}
                                    </div>
                                    <span style={{ color:'#eef2ff', fontSize:'12px', fontWeight:'600' }}>{av.nombre}</span>
                                    {localAvId === av.id && (
                                        <span style={{ fontSize:'9px', color:av.color, fontFamily:'monospace', letterSpacing:'0.1em' }}>● ACTIVO</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => setMostrarPick(false)} style={{
                            marginTop:'16px', width:'100%', background:'transparent',
                            border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px',
                            padding:'10px', color:'#7a8ba8', cursor:'pointer', fontFamily:'inherit', fontSize:'13px',
                        }}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* Card perfil */}
            <div style={{
                maxWidth:'560px', margin:'0 auto',
                background:'rgba(13,21,37,0.8)', border:'1px solid rgba(0,229,255,0.1)',
                borderRadius:'20px', padding:'40px 36px',
                boxShadow:'0 8px 32px rgba(0,0,0,0.3)',
            }}>
                {/* Avatar centrado */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'28px' }}>
                    <div style={{ position:'relative', cursor:'pointer', marginBottom:'14px' }}
                        onClick={() => setMostrarPick(true)}>
                        <AvatarDisplay avatarId={localAvId} fotoUrl={localFoto} initials={initials} size={90} colorBorder={true} />
                        <div style={{
                            position:'absolute', bottom:2, right:2,
                            width:'26px', height:'26px', borderRadius:'50%',
                            background:'#00e5ff', display:'flex', alignItems:'center', justifyContent:'center',
                            border:'2px solid #060b14', cursor:'pointer',
                        }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#060b14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </div>
                    </div>

                    <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:'800', fontSize:'22px', color:'#eef2ff', margin:'0 0 4px', textAlign:'center' }}>
                        {userName}
                    </h2>
                    <p style={{ color:'#7a8ba8', fontSize:'13px', margin:'0 0 8px' }}>{userEmail}</p>

                    {avActual && !localFoto && (
                        <span style={{
                            fontSize:'11px', fontFamily:'monospace', color:avActual.color,
                            background:`${avActual.color}18`, border:`1px solid ${avActual.color}40`,
                            padding:'3px 10px', borderRadius:'100px',
                        }}>{avActual.nombre}</span>
                    )}
                    {localFoto && (
                        <span style={{
                            fontSize:'11px', fontFamily:'monospace', color:'#00e5ff',
                            background:'rgba(0,229,255,0.08)', border:'1px solid rgba(0,229,255,0.25)',
                            padding:'3px 10px', borderRadius:'100px',
                        }}>Foto personalizada</span>
                    )}

                    <button onClick={() => setMostrarPick(true)} style={{
                        marginTop:'10px', background:'transparent', border:'none',
                        color:'#7a8ba8', fontSize:'12px', cursor:'pointer', fontFamily:'inherit',
                        display:'flex', alignItems:'center', gap:'4px',
                    }}>
                        Cambiar avatar o foto →
                    </button>
                </div>

                {/* Divider */}
                <div style={{ height:1, background:'rgba(0,229,255,0.08)', margin:'0 0 28px' }} />

                {/* Seguridad */}
                <div style={{ marginBottom:'8px' }}>
                    <h3 style={{
                        fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'15px',
                        color:'#eef2ff', margin:'0 0 20px',
                        display:'flex', alignItems:'center', gap:'8px',
                    }}>
                        <IconLock /> Cambiar contraseña
                    </h3>

                    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                        {[
                            { key:'actual',    label:'Contraseña actual'    },
                            { key:'nueva',     label:'Nueva contraseña'     },
                            { key:'confirmar', label:'Confirmar contraseña' },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label style={{
                                    display:'block', fontSize:'11px', fontWeight:'600',
                                    color:'#7a8ba8', letterSpacing:'0.08em',
                                    textTransform:'uppercase', marginBottom:'6px',
                                }}>{label}</label>
                                <div style={{ position:'relative' }}>
                                    <input
                                        type={showPass[key] ? 'text' : 'password'}
                                        value={pass[key]}
                                        onChange={e => setPass(prev => ({ ...prev, [key]: e.target.value }))}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        style={{
                                            width:'100%', boxSizing:'border-box',
                                            background:'rgba(6,11,20,0.8)',
                                            border:'1px solid rgba(0,229,255,0.15)',
                                            borderRadius:'10px', padding:'12px 44px 12px 14px',
                                            color:'#eef2ff', fontSize:'14px', fontFamily:'inherit',
                                            outline:'none', transition:'border 0.2s',
                                        }}
                                    />
                                    <button type="button"
                                        onClick={() => setShowPass(prev => ({ ...prev, [key]: !prev[key] }))}
                                        style={{
                                            position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                                            background:'none', border:'none', cursor:'pointer', color:'#7a8ba8', padding:0,
                                        }}>
                                        <IconEye />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {passMsg && (
                        <div style={{
                            marginTop:'14px', padding:'10px 14px', borderRadius:'8px', fontSize:'13px',
                            background: passMsg.startsWith('ok') ? 'rgba(0,245,160,0.08)' : 'rgba(248,113,113,0.08)',
                            color:      passMsg.startsWith('ok') ? '#00f5a0' : '#f87171',
                            border:     `1px solid ${passMsg.startsWith('ok') ? 'rgba(0,245,160,0.25)' : 'rgba(248,113,113,0.25)'}`,
                        }}>
                            {passMsg.split(':')[1]}
                        </div>
                    )}

                    <div style={{ display:'flex', justifyContent:'center', marginTop:'24px' }}>
                        <button onClick={handlePassSave} style={{
                            background:'linear-gradient(135deg, #00e5ff, #7b5cfa)',
                            color:'#060b14', border:'none', borderRadius:'10px',
                            padding:'12px 36px', fontWeight:'700', fontSize:'14px',
                            cursor:'pointer', fontFamily:'inherit', display:'flex',
                            alignItems:'center', gap:'8px', boxShadow:'0 4px 16px rgba(0,229,255,0.25)',
                        }}>
                            <IconSave /> Actualizar contraseña
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeEstudiante;