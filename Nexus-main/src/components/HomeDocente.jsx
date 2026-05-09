import { useNexusModal } from './NexusModal';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomeDocente.css';

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});

const multipartHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'multipart/form-data',
    }
});

//  ICONOS 
const IconHome = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const IconUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconBook = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>;
const IconStudents = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
const IconChart = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>;
const IconLogout = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const IconCamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>;
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconSave = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
const IconLock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const IconEye = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconUpload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" /></svg>;
const IconFile = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const IconBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="15 18 9 12 15 6" /></svg>;

//  HELPERS 
const Loader = () => <div style={{ padding: '40px', textAlign: 'center', color: '#7a8ba8' }}>Cargando...</div>;
const ErrorMsg = ({ msg }) => <div style={{ padding: '16px', color: '#f87171', background: 'rgba(248,113,113,0.1)', borderRadius: '8px', marginBottom: '12px' }}>⚠ {msg}</div>;

const StatCard = ({ label, value, icon, color, sub }) => (
    <div className="nd-stat-card" style={{ borderTopColor: color }}>
        <div className="nd-stat-icon" style={{ color }}>{icon}</div>
        <div className="nd-stat-info">
            <span className="nd-stat-value" style={{ color }}>{value}</span>
            <span className="nd-stat-label">{label}</span>
            {sub && <span className="nd-stat-sub">{sub}</span>}
        </div>
    </div>
);

const TIPO_ICON = { pdf: '📄', docx: '📝', xlsx: '📊', csv: '📋', otro: '📎' };
const TIPO_COLOR = { pdf: '#f87171', docx: '#60a5fa', xlsx: '#4ade80', csv: '#fbbf24', otro: '#a78bfa' };

//  COMPONENTE PRINCIPAL 
// VistaPerfil_ — componente independiente para evitar re-montaje al escribir
const VistaPerfil_ = ({ nombre, email, especialidad, initials, avatar, fileRef, handleAvatar }) => {
    const [bio,      setBio]      = React.useState('');
    const [editBio,  setEditBio]  = React.useState(false);
    const [bioTemp,  setBioTemp]  = React.useState('');
    const [pass,     setPass]     = React.useState({ actual: '', nueva: '', confirmar: '' });
    const [passMsg,  setPassMsg]  = React.useState('');
    const [showPass, setShowPass] = React.useState({ actual: false, nueva: false, confirmar: false });

    const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });

    React.useEffect(() => {
        axios.get('/api/perfil/', authH()).then(res => {
            if (res.data.biografia) setBio(res.data.biografia);
        }).catch(() => {});
    }, []);

    const guardarBio = async () => {
        try {
            await axios.patch('/api/perfil/', { biografia: bioTemp }, authH());
            setBio(bioTemp);
            setEditBio(false);
        } catch (err) { console.error('Error guardando bio:', err); }
    };

    const handlePassSave = async () => {
        setPassMsg('');
        if (!pass.actual || !pass.nueva || !pass.confirmar) { setPassMsg('err:Todos los campos son obligatorios.'); return; }
        if (pass.nueva !== pass.confirmar) { setPassMsg('err:Las nuevas contraseñas no coinciden.'); return; }
        try {
            await axios.post('/api/cambiar-password-perfil/',
                { password_actual: pass.actual, nueva_password: pass.nueva }, authH());
            setPassMsg('ok:Contraseña actualizada correctamente.');
            setPass({ actual: '', nueva: '', confirmar: '' });
        } catch (err) {
            setPassMsg(`err:${err.response?.data?.error || 'Error al conectar con el servidor.'}`);
        }
    };

    return (
        <div className="nd-view nd-fade-in">
            <div className="nd-section-title">Mi Perfil</div>
            <div className="nd-profile-card">
                <div className="nd-avatar-section">
                    <div className="nd-avatar-wrapper">
                        {avatar ? <img src={avatar} alt="av" className="nd-avatar-xl" />
                            : <div className="nd-avatar-initials-xl">{initials}</div>}
                        <button className="nd-avatar-edit-btn" onClick={() => fileRef.current.click()}>
                            <IconCamera />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*"
                            style={{ display: 'none' }} onChange={handleAvatar} />
                    </div>
                    <div className="nd-profile-name-section">
                        <h3 className="nd-profile-name">{nombre}</h3>
                        <span className="nd-profile-badge">{especialidad}</span>
                        <span className="nd-profile-email">{email}</span>
                    </div>
                </div>
                <div className="nd-profile-readonly">
                    <p className="nd-readonly-note">Los siguientes campos no son editables.</p>
                    <div className="nd-readonly-grid">
                        {[
                            { label: 'Nombre completo', value: nombre },
                            { label: 'Especialidad',    value: especialidad },
                            { label: 'Correo',          value: email },
                            { label: 'Rol',             value: 'Docente', tag: true },
                        ].map(({ label, value, tag }) => (
                            <div key={label} className="nd-readonly-field">
                                <label>{label}</label>
                                <div className={`nd-readonly-value${tag ? ' nd-role-tag' : ''}`}>{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="nd-edit-card">
                <div className="nd-edit-card-header">
                    <span>Descripción / Biografía</span>
                    {!editBio && (
                        <button className="nd-btn-ghost" onClick={() => { setEditBio(true); setBioTemp(bio); }}>
                            <IconEdit /> Editar
                        </button>
                    )}
                </div>
                {editBio ? (
                    <div className="nd-bio-edit">
                        <textarea className="nd-textarea" rows={4} maxLength={300}
                            placeholder="Cuéntale a tus estudiantes sobre ti..."
                            value={bioTemp} onChange={e => setBioTemp(e.target.value)} />
                        <span className="nd-char-count">{bioTemp.length}/300</span>
                        <div className="nd-edit-actions">
                            <button className="nd-btn-secondary" onClick={() => setEditBio(false)}>Cancelar</button>
                            <button className="nd-btn-primary" onClick={guardarBio}>
                                <IconSave /> Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="nd-bio-text">{bio || 'No has agregado una descripción todavía.'}</p>
                )}
            </div>

            <div className="nd-edit-card">
                <div className="nd-edit-card-header">
                    <span className="nd-lock-title"><IconLock /> Cambiar Contraseña</span>
                </div>
                <div className="nd-pass-grid">
                    {[
                        { label: 'Contraseña actual',    key: 'actual'    },
                        { label: 'Nueva contraseña',     key: 'nueva'     },
                        { label: 'Confirmar contraseña', key: 'confirmar' },
                    ].map(({ label, key }) => (
                        <div className="nd-pass-field" key={key}>
                            <label>{label}</label>
                            <div className="nd-pass-input-wrap">
                                <input
                                    type={showPass[key] ? 'text' : 'password'}
                                    value={pass[key]}
                                    onChange={e => setPass(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="nd-input"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                                <button className="nd-pass-toggle" type="button"
                                    onClick={() => setShowPass(p => ({ ...p, [key]: !p[key] }))}>
                                    <IconEye />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {passMsg && (
                    <div className={`nd-msg ${passMsg.startsWith('ok') ? 'nd-msg-ok' : 'nd-msg-err'}`}>
                        {passMsg.split(':')[1]}
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button className="nd-btn-primary" onClick={handlePassSave}
                        style={{ padding: '10px 32px', width: 'auto' }}>
                        <IconSave /> Actualizar contraseña
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function HomeDocente() {
    const navigate = useNavigate();
    const { modalJSX, showAlert, showConfirm } = useNexusModal();
    const fileRef = useRef(null);
    const archivoRef = useRef(null);

    const [vista, setVista] = useState('inicio');
    const [avatar, setAvatar] = useState(null);
    const [bio, setBio] = useState('');
    const [editBio, setEditBio] = useState(false);
    const [bioTemp, setBioTemp] = useState('');
    const [cursoActivo, setCursoActivo] = useState(null); // curso seleccionado para ver detalle

    const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' });
    const [passMsg, setPassMsg] = useState('');
    const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirmar: false });

    const nombre = localStorage.getItem('userName') || 'Docente';
    const email = localStorage.getItem('email') || '';
    const especialidad = localStorage.getItem('especialidad') || 'Docente NEXUS';
    const initials = nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const cerrarSesion = async () => {
        const ok = await showConfirm('Seras redirigido al inicio de sesion.', {
            type: 'warning', title: 'Cerrar sesion',
            confirmLabel: 'Si, salir', cancelLabel: 'Cancelar',
        });
        if (!ok) return;
        localStorage.clear();
        navigate('/login');
    };

    const handleAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Preview inmediato
        const reader = new FileReader();
        reader.onloadend = () => setAvatar(reader.result);
        reader.readAsDataURL(file);
        // Guardar en backend
        const formData = new FormData();
        formData.append('foto_perfil', file);
        try {
            await axios.patch('/api/perfil/', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
        } catch (err) {
            console.error('Error al guardar foto:', err);
        }
    };

    const handlePassSave = async () => {
        setPassMsg('');
        if (!pass.actual || !pass.nueva || !pass.confirmar) { setPassMsg('err:Todos los campos son obligatorios.'); return; }
        if (pass.nueva !== pass.confirmar) { setPassMsg('err:Las nuevas contraseñas no coinciden.'); return; }
        try {
            await axios.post('/api/cambiar-password-perfil/',
                { password_actual: pass.actual, nueva_password: pass.nueva },
                authHeaders()
            );
            setPassMsg('ok:Contraseña actualizada correctamente.');
            setPass({ actual: '', nueva: '', confirmar: '' });
        } catch (err) {
            setPassMsg(`err:${err.response?.data?.error || 'Error al conectar con el servidor.'}`);
        }
    };

    const navItems = [
        { id: 'inicio', label: 'Inicio', icon: <IconHome /> },
        { id: 'perfil', label: 'Mi Perfil', icon: <IconUser /> },
        { id: 'cursos', label: 'Mis Cursos', icon: <IconBook /> },
        { id: 'estudiantes', label: 'Mis Estudiantes', icon: <IconStudents /> },
    ];

    //  VISTA: INICIO 
    const VistaInicio = () => {
        const [resumen, setResumen] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');

        // Cargar perfil desde backend al montar
    useEffect(() => {
        axios.get('/api/perfil/', authHeaders()).then(res => {
            if (res.data.biografia) setBio(res.data.biografia);
            if (res.data.foto_perfil) setAvatar(res.data.foto_perfil);
        }).catch(() => {});
    }, []);

    useEffect(() => {
            axios.get('/api/docente/resumen/', authHeaders())
                .then(res => setResumen(res.data))
                .catch(() => setError('No se pudo cargar el resumen.'))
                .finally(() => setLoading(false));
        }, []);

        if (loading) return <Loader />;
        if (error) return <ErrorMsg msg={error} />;

        return (
            <div className="nd-view nd-fade-in">
                <div className="nd-welcome-banner">
                    <div className="nd-welcome-text">
                        <p className="nd-welcome-greeting">Bienvenido de nuevo,</p>
                        <h2 className="nd-welcome-name">{nombre}</h2>
                        <span className="nd-welcome-role">{especialidad}</span>
                    </div>
                    <div className="nd-welcome-avatar">
                        {avatar ? <img src={avatar} alt="av" className="nd-avatar-lg" />
                            : <div className="nd-avatar-initials-lg">{initials}</div>}
                    </div>
                </div>
                <div className="nd-stats-grid">
                    <StatCard label="Cursos activos" value={resumen.cursos_activos} icon={<IconBook />} color="#00E5FF" />
                    <StatCard label="Estudiantes" value={resumen.total_estudiantes} icon={<IconStudents />} color="#A3FF4F" sub="En todos tus cursos" />
                    <StatCard label="Tasa completación" value={`${resumen.tasa_completacion}%`} icon={<IconChart />} color="#7B5CFA" sub="Promedio general" />
                </div>
                <div className="nd-section-title" style={{ marginTop: '24px' }}>
                    Accesos rápidos
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <button onClick={() => setVista('cursos')} style={quickBtnStyle('#00E5FF')}>
                        <IconBook /> Ver mis cursos
                    </button>
                    <button onClick={() => setVista('estudiantes')} style={quickBtnStyle('#A3FF4F')}>
                        <IconStudents /> Ver estudiantes
                    </button>
                </div>
            </div>
        );
    };

    //  VISTA: MIS CURSOS 
    const VistaCursos = () => {
        const [cursos, setCursos] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');

        // Estado para recursos del curso seleccionado
        const [recursos, setRecursos] = useState([]);
        const [loadingRec, setLoadingRec] = useState(false);
        const [subiendoRec, setSubiendoRec] = useState(false);
        const [msgRec, setMsgRec] = useState('');
        const [nombreArchivo, setNombreArchivo] = useState('');
        const [archivoSel, setArchivoSel] = useState(null);

        useEffect(() => {
            axios.get('/api/docente/cursos/', authHeaders())
                .then(res => setCursos(res.data))
                .catch(() => setError('No se pudieron cargar tus cursos.'))
                .finally(() => setLoading(false));
        }, []);

        const verDetalle = (curso) => {
            setCursoActivo(curso);
            setLoadingRec(true);
            setMsgRec('');
            setArchivoSel(null);
            setNombreArchivo('');
            axios.get(`/api/docente/cursos/${curso.id}/recursos/`, authHeaders())
                .then(res => setRecursos(res.data))
                .catch(() => setRecursos([]))
                .finally(() => setLoadingRec(false));
        };

        const handleArchivoChange = (e) => {
            const f = e.target.files[0];
            if (!f) return;
            setArchivoSel(f);
            setNombreArchivo(f.name.replace(/\.[^/.]+$/, ''));
        };

        const subirArchivo = async () => {
            if (!archivoSel) { setMsgRec('err:Selecciona un archivo primero.'); return; }
            setSubiendoRec(true);
            setMsgRec('');
            const fd = new FormData();
            fd.append('archivo', archivoSel);
            fd.append('nombre', nombreArchivo || archivoSel.name);
            try {
                await axios.post(`/api/docente/cursos/${cursoActivo.id}/recursos/`, fd, multipartHeaders());
                setMsgRec('ok:Archivo subido correctamente.');
                setArchivoSel(null);
                setNombreArchivo('');
                if (archivoRef.current) archivoRef.current.value = '';
                // Recargar recursos
                const res = await axios.get(`/api/docente/cursos/${cursoActivo.id}/recursos/`, authHeaders());
                setRecursos(res.data);
            } catch (err) {
                setMsgRec(`err:${err.response?.data?.error || 'Error al subir el archivo.'}`);
            } finally {
                setSubiendoRec(false);
            }
        };

        const eliminarRecurso = async (recursoId) => {
            if (!window.confirm('¿Eliminar este recurso?')) return;
            try {
                await axios.delete(`/api/docente/recursos/${recursoId}/`, authHeaders());
                setRecursos(prev => prev.filter(r => r.id !== recursoId));
            } catch { alert('Error al eliminar el recurso.'); }
        };

        if (loading) return <Loader />;
        if (error) return <ErrorMsg msg={error} />;

        // Vista detalle de un curso
        if (cursoActivo) {
            return (
                <div className="nd-view nd-fade-in">
                    <button onClick={() => setCursoActivo(null)} style={backBtnStyle}>
                        <IconBack /> Volver a mis cursos
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 24px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cursoActivo.color, flexShrink: 0 }} />
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#EEF2FF' }}>{cursoActivo.nombre}</h2>
                        <span style={{ fontSize: '12px', color: cursoActivo.color, border: `1px solid ${cursoActivo.color}`, borderRadius: '100px', padding: '3px 10px' }}>
                            {cursoActivo.inscritos} estudiantes
                        </span>
                    </div>

                    {/* Subir archivo */}
                    <div style={seccionStyle}>
                        <h3 style={seccionTitleStyle}><IconUpload /> Subir recurso</h3>
                        <p style={{ fontSize: '12px', color: '#7a8ba8', marginBottom: '16px' }}>
                            Formatos permitidos: PDF, DOCX, XLSX, CSV
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input
                                ref={archivoRef}
                                type="file"
                                accept=".pdf,.docx,.xlsx,.csv"
                                onChange={handleArchivoChange}
                                style={{ color: '#EEF2FF', fontSize: '13px' }}
                            />
                            {archivoSel && (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        style={inputStyle}
                                        placeholder="Nombre del recurso"
                                        value={nombreArchivo}
                                        onChange={e => setNombreArchivo(e.target.value)}
                                    />
                                    <button
                                        onClick={subirArchivo}
                                        disabled={subiendoRec}
                                        style={{ ...btnPrimaryStyle, whiteSpace: 'nowrap', opacity: subiendoRec ? 0.7 : 1 }}
                                    >
                                        {subiendoRec ? 'Subiendo...' : 'Subir archivo'}
                                    </button>
                                </div>
                            )}
                            {msgRec && (
                                <p style={{ fontSize: '13px', color: msgRec.startsWith('ok') ? '#00f5a0' : '#f87171' }}>
                                    {msgRec.split(':')[1]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Lista de recursos */}
                    <div style={seccionStyle}>
                        <h3 style={seccionTitleStyle}><IconFile /> Recursos del curso</h3>
                        {loadingRec ? <Loader /> : recursos.length === 0 ? (
                            <p style={{ color: '#7a8ba8', fontSize: '13px' }}>No hay recursos subidos aún.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {recursos.map(r => (
                                    <div key={r.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
                                        padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)',
                                    }}>
                                        <span style={{ fontSize: '20px' }}>{TIPO_ICON[r.tipo] || '📎'}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#EEF2FF', marginBottom: '2px' }}>{r.nombre}</p>
                                            <p style={{ fontSize: '11px', color: '#7a8ba8' }}>{r.tipo.toUpperCase()} · Subido el {r.fecha}</p>
                                        </div>
                                        <a href={r.url} target="_blank" rel="noreferrer" style={{
                                            fontSize: '12px', color: TIPO_COLOR[r.tipo] || '#00E5FF',
                                            border: `1px solid ${TIPO_COLOR[r.tipo] || '#00E5FF'}`,
                                            borderRadius: '6px', padding: '4px 10px', textDecoration: 'none',
                                        }}>
                                            Descargar
                                        </a>
                                        <button onClick={() => eliminarRecurso(r.id)} style={{
                                            background: 'transparent', border: 'none', cursor: 'pointer',
                                            color: '#f87171', padding: '4px',
                                        }}>
                                            <IconTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Lista de cursos
        return (
            <div className="nd-view nd-fade-in">
                <div className="nd-section-title">Mis Cursos</div>
                <p className="nd-section-sub">Cursos asignados por el administrador de NEXUS.</p>

                {cursos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#7a8ba8' }}>
                        <p>No tienes cursos asignados aún.</p>
                        <p style={{ fontSize: '13px', marginTop: '8px' }}>El administrador de NEXUS te asignará los cursos que dictes.</p>
                    </div>
                ) : (
                    <div className="nd-courses-grid">
                        {cursos.map(curso => (
                            <div key={curso.id} className="nd-course-card" onClick={() => verDetalle(curso)} style={{ cursor: 'pointer' }}>
                                <div className="nd-course-accent" style={{ background: curso.color }} />
                                <div className="nd-course-body">
                                    <span className="nd-course-level" style={{ color: curso.color, borderColor: curso.color }}>
                                        {curso.tecnologia.toUpperCase()}
                                    </span>
                                    <h4 className="nd-course-title">{curso.nombre}</h4>
                                    {curso.descripcion && (
                                        <p style={{ fontSize: '12px', color: '#7a8ba8', margin: '6px 0', lineHeight: '1.5' }}>
                                            {curso.descripcion}
                                        </p>
                                    )}
                                    <div className="nd-course-meta">
                                        <span className="nd-course-students">👥 {curso.inscritos} estudiantes</span>
                                        <span style={{ fontSize: '12px', color: '#7a8ba8' }}>{curso.num_modulos} módulos</span>
                                    </div>
                                    <div className="nd-progress-bar">
                                        <div className="nd-progress-fill" style={{ width: `${curso.progreso_promedio}%`, background: curso.color }} />
                                    </div>
                                    <span className="nd-progress-label">{curso.progreso_promedio}% completado en promedio</span>
                                    <p style={{ fontSize: '11px', color: curso.color, marginTop: '10px' }}>
                                        Clic para ver estudiantes y subir recursos →
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    //  VISTA: MIS ESTUDIANTES 
    const VistaEstudiantes = () => {
        const [cursos, setCursos] = useState([]);
        const [cursoSel, setCursoSel] = useState('');
        const [estudiantes, setEstudiantes] = useState([]);
        const [loadingC, setLoadingC] = useState(true);
        const [loadingE, setLoadingE] = useState(false);
        const [error, setError] = useState('');

        useEffect(() => {
            axios.get('/api/docente/cursos/', authHeaders())
                .then(res => { setCursos(res.data); if (res.data.length > 0) cargarEstudiantes(res.data[0].id); })
                .catch(() => setError('No se pudieron cargar los cursos.'))
                .finally(() => setLoadingC(false));
        }, []);

        const cargarEstudiantes = (id) => {
            setCursoSel(id);
            setLoadingE(true);
            axios.get(`/api/docente/cursos/${id}/estudiantes/`, authHeaders())
                .then(res => setEstudiantes(res.data.estudiantes || []))
                .catch(() => setEstudiantes([]))
                .finally(() => setLoadingE(false));
        };

        if (loadingC) return <Loader />;
        if (error) return <ErrorMsg msg={error} />;

        return (
            <div className="nd-view nd-fade-in">
                <div className="nd-section-title">Mis Estudiantes</div>
                <p className="nd-section-sub">Vista de solo lectura — puedes ver el progreso de tus estudiantes.</p>

                {cursos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#7a8ba8' }}>
                        No tienes cursos asignados aún.
                    </div>
                ) : (
                    <>
                        {/* Selector de curso */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            {cursos.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => cargarEstudiantes(c.id)}
                                    style={{
                                        padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
                                        fontFamily: 'inherit', cursor: 'pointer',
                                        border: cursoSel === c.id ? `1px solid ${c.color}` : '1px solid rgba(255,255,255,0.1)',
                                        background: cursoSel === c.id ? `rgba(${hexToRgb(c.color)},0.1)` : 'transparent',
                                        color: cursoSel === c.id ? c.color : '#7a8ba8',
                                    }}
                                >
                                    {c.nombre}
                                </button>
                            ))}
                        </div>

                        {loadingE ? <Loader /> : (
                            <div className="nd-students-table">
                                <div className="nd-table-header">
                                    <span>Nombre</span>
                                    <span>Correo</span>
                                    <span>Progreso</span>
                                    <span>Módulos</span>
                                </div>
                                {estudiantes.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#7a8ba8', fontSize: '14px' }}>
                                        No hay estudiantes inscritos en este curso aún.
                                    </div>
                                ) : estudiantes.map((e, i) => (
                                    <div key={i} className="nd-table-row">
                                        <span className="nd-student-name">
                                            <div className="nd-student-avatar">{e.nombre[0]}</div>
                                            {e.nombre}
                                        </span>
                                        <span className="nd-student-course" style={{ color: '#7a8ba8', fontSize: '12px' }}>{e.email}</span>
                                        <span className="nd-student-progress">
                                            <div className="nd-mini-bar">
                                                <div className="nd-mini-fill" style={{ width: `${e.progreso}%` }} />
                                            </div>
                                            {e.progreso}%
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#7a8ba8' }}>
                                            {e.lecciones_vistas}/{e.lecciones_total} lecciones
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    //  VISTA: PERFIL 
    const VistaPerfil = () => (
        <VistaPerfil_
            nombre={nombre} email={email} especialidad={especialidad}
            initials={initials} avatar={avatar} fileRef={fileRef}
            handleAvatar={handleAvatar}
        />
    );

    const views = {
        inicio: <VistaInicio />,
        perfil: <VistaPerfil />,
        cursos: <VistaCursos />,
        estudiantes: <VistaEstudiantes />,
    };

    return (
        <>
        {modalJSX}
        <div className="nd-layout">
            <aside className="nd-sidebar">
                <div className="nd-sidebar-logo">NEX<span>U</span>S <span className="nd-sidebar-tag">DOCENTE</span></div>
                <div className="nd-sidebar-avatar-mini">
                    {avatar ? <img src={avatar} alt="av" className="nd-avatar-sm" />
                        : <div className="nd-avatar-initials-sm">{initials}</div>}
                    <div className="nd-sidebar-user-info">
                        <span className="nd-sidebar-name">{nombre}</span>
                        <span className="nd-sidebar-role">{especialidad}</span>
                    </div>
                </div>
                <nav className="nd-sidebar-nav">
                    {navItems.map(item => (
                        <button key={item.id}
                            className={`nd-nav-item ${vista === item.id ? 'nd-nav-active' : ''}`}
                            onClick={() => { setVista(item.id); setCursoActivo(null); }}>
                            <span className="nd-nav-icon">{item.icon}</span>
                            <span className="nd-nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <button className="nd-logout-btn" onClick={cerrarSesion}>
                    <IconLogout /> Cerrar sesión
                </button>
            </aside>

            <main className="nd-main">
                <header className="nd-topbar">
                    <span className="nd-breadcrumb-section">
                        {cursoActivo ? cursoActivo.nombre : navItems.find(n => n.id === vista)?.label}
                    </span>
                    <div className="nd-topbar-right">
                        <span className="nd-topbar-greeting">Hola, {nombre.split(' ')[0]}</span>
                        {avatar ? <img src={avatar} alt="av" className="nd-topbar-avatar" />
                            : <div className="nd-topbar-initials">{initials}</div>}
                    </div>
                </header>
                <div className="nd-content">
                    {views[vista] || views.inicio}
                </div>
            </main>
        </div>
        </>
    );
}

//  ESTILOS INLINE 
const quickBtnStyle = (color) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 18px', borderRadius: '8px',
    border: `1px solid ${color}`, background: `rgba(${hexToRgb(color)},0.08)`,
    color, fontFamily: 'inherit', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer',
});

const seccionStyle = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', padding: '20px', marginBottom: '16px',
};

const seccionTitleStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '14px', fontWeight: '700', color: '#EEF2FF',
    marginBottom: '14px',
};

const backBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '7px 14px', color: '#7a8ba8',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
};

const btnPrimaryStyle = {
    background: '#00E5FF', color: '#060B14', border: 'none',
    borderRadius: '8px', padding: '9px 18px', fontWeight: '700',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
};

const inputStyle = {
    flex: 1, background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
    padding: '8px 12px', color: '#EEF2FF', fontSize: '13px',
    fontFamily: 'inherit', outline: 'none',
};

// Helper para convertir hex a rgb
const hexToRgb = (hex) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}` : '0,229,255';
};
