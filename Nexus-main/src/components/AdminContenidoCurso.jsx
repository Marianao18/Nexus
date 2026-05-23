import { useNexusModal } from './NexusModal';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});

export default function AdminContenidoCurso() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [curso,         setCurso]         = useState(null);
    const [modulos,       setModulos]       = useState([]);
    const [moduloActivo,  setModuloActivo]  = useState(null);
    const [leccionActiva, setLeccionActiva] = useState(null);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState('');

    // Forms
    const [nuevoModulo,   setNuevoModulo]   = useState('');
    const [formLeccion,   setFormLeccion]   = useState({ titulo: '', descripcion: '', video_url: '' });
    const [mostrarFormLec, setMostrarFormLec] = useState(false);
    const [guardando,     setGuardando]     = useState(false);
    const [msg,           setMsg]           = useState('');

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/cursos/${id}/contenido/`, authHeaders());
            setCurso({ nombre: res.data.curso_nombre, color: res.data.curso_color });
            setModulos(res.data.modulos);
            if (res.data.modulos.length > 0) {
                setModuloActivo(res.data.modulos[0]);
                if (res.data.modulos[0].lecciones.length > 0) {
                    setLeccionActiva(res.data.modulos[0].lecciones[0]);
                }
            }
        } catch {
            setError('No se pudo cargar el contenido del curso.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [id]);

    const agregarModulo = async () => {
        if (!nuevoModulo.trim()) return;
        try {
            const res = await axios.post(`/api/admin/cursos/${id}/modulos/`, { nombre: nuevoModulo }, authHeaders());
            setModulos(prev => [...prev, res.data]);
            setNuevoModulo('');
        } catch { alert('Error al crear el módulo.'); }
    };

    const eliminarModulo = async (moduloId) => {
        if (!window.confirm('¿Eliminar este módulo y todo su contenido?')) return;
        try {
            await axios.delete(`/api/admin/modulos/${moduloId}/`, authHeaders());
            const nuevos = modulos.filter(m => m.id !== moduloId);
            setModulos(nuevos);
            setModuloActivo(nuevos[0] || null);
            setLeccionActiva(nuevos[0]?.lecciones[0] || null);
        } catch { alert('Error al eliminar el módulo.'); }
    };

    const agregarLeccion = async (e) => {
        e.preventDefault();
        if (!formLeccion.titulo.trim()) { setMsg('err:El título es obligatorio.'); return; }
        if (!formLeccion.video_url.trim()) { setMsg('err:La URL del video es obligatoria.'); return; }
        setGuardando(true);
        setMsg('');
        try {
            const res = await axios.post(
                `/api/admin/modulos/${moduloActivo.id}/lecciones/`,
                formLeccion,
                authHeaders()
            );
            const nuevaLeccion = res.data;
            setModulos(prev => prev.map(m =>
                m.id === moduloActivo.id
                    ? { ...m, lecciones: [...m.lecciones, nuevaLeccion] }
                    : m
            ));
            setModuloActivo(prev => ({ ...prev, lecciones: [...prev.lecciones, nuevaLeccion] }));
            setLeccionActiva(nuevaLeccion);
            setFormLeccion({ titulo: '', descripcion: '', video_url: '' });
            setMostrarFormLec(false);
            setMsg('ok:Lección agregada correctamente.');
        } catch (err) {
            setMsg(`err:${err.response?.data?.error || 'Error al agregar la lección.'}`);
        } finally { setGuardando(false); }
    };

    const eliminarLeccion = async (leccionId) => {
        if (!window.confirm('¿Eliminar esta lección?')) return;
        try {
            await axios.delete(`/api/admin/lecciones/${leccionId}/`, authHeaders());
            const nuevasLecciones = moduloActivo.lecciones.filter(l => l.id !== leccionId);
            setModulos(prev => prev.map(m =>
                m.id === moduloActivo.id ? { ...m, lecciones: nuevasLecciones } : m
            ));
            setModuloActivo(prev => ({ ...prev, lecciones: nuevasLecciones }));
            setLeccionActiva(nuevasLecciones[0] || null);
        } catch { alert('Error al eliminar la lección.'); }
    };

    const seleccionarModulo = (modulo) => {
        setModuloActivo(modulo);
        setLeccionActiva(modulo.lecciones[0] || null);
        setMostrarFormLec(false);
        setMsg('');
    };

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:'#00E5FF', background:'#060B14' }}>
            Cargando contenido...
        </div>
    );

    if (error) return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:'#f87171', background:'#060B14', gap:'16px' }}>
            <p>{error}</p>
            <button onClick={() => navigate('/admin-dashboard')} style={btnSecStyle}>â Volver al panel</button>
        </div>
    );

    return (
        <div style={{ padding:'32px', color:'#EEF2FF', minHeight:'100vh', background:'#060B14' }}>

            {/* HEADER */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
                <div>
                    <button onClick={() => navigate('/admin-dashboard')} style={btnSecStyle}>
                        â Volver al panel
                    </button>
                    <h1 style={{ fontSize:'28px', fontWeight:'800', marginTop:'10px', letterSpacing:'-0.02em' }}>
                        {curso?.nombre}
                    </h1>
                    <p style={{ color:'#7A8BA8', fontSize:'13px', marginTop:'4px' }}>
                        Gestión de contenido Â· Solo visible para administradores
                    </p>
                </div>
                {moduloActivo && (
                    <button
                        onClick={() => { setMostrarFormLec(!mostrarFormLec); setMsg(''); }}
                        style={mostrarFormLec ? btnSecStyle : btnPrimStyle}
                    >
                        {mostrarFormLec ? 'â Cancelar' : '+ Agregar lección'}
                    </button>
                )}
            </div>

            {/* FORMULARIO NUEVA LECCIÓN */}
            {mostrarFormLec && moduloActivo && (
                <div style={{ ...cardStyle, marginBottom:'24px', borderColor:'rgba(0,229,255,0.3)' }}>
                    <h3 style={{ fontSize:'15px', fontWeight:'700', marginBottom:'16px', color:'#00E5FF' }}>
                        Nueva lección en "{moduloActivo.nombre}"
                    </h3>
                    <form onSubmit={agregarLeccion}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
                            <div>
                                <label style={labelStyle}>Título *</label>
                                <input style={inputStyle} placeholder="Ej: Introducción a variables"
                                    value={formLeccion.titulo}
                                    onChange={e => setFormLeccion({...formLeccion, titulo: e.target.value})} />
                            </div>
                            <div>
                                <label style={labelStyle}>URL de YouTube *</label>
                                <input style={inputStyle} placeholder="https://www.youtube.com/watch?v=..."
                                    value={formLeccion.video_url}
                                    onChange={e => setFormLeccion({...formLeccion, video_url: e.target.value})} />
                            </div>
                            <div style={{ gridColumn:'1/-1' }}>
                                <label style={labelStyle}>Descripción (opcional)</label>
                                <textarea style={{ ...inputStyle, minHeight:'70px', resize:'vertical' }}
                                    placeholder="Describe el contenido de esta lección..."
                                    value={formLeccion.descripcion}
                                    onChange={e => setFormLeccion({...formLeccion, descripcion: e.target.value})} />
                            </div>
                        </div>
                        {msg && (
                            <p style={{ fontSize:'13px', marginBottom:'12px', color: msg.startsWith('ok') ? '#00f5a0' : '#f87171' }}>
                                {msg.split(':')[1]}
                            </p>
                        )}
                        <button type="submit" disabled={guardando} style={{ ...btnPrimStyle, opacity: guardando ? 0.7 : 1 }}>
                            {guardando ? 'Guardando...' : 'Guardar lección'}
                        </button>
                    </form>
                </div>
            )}

            {msg && !mostrarFormLec && (
                <p style={{ fontSize:'13px', marginBottom:'16px', color: msg.startsWith('ok') ? '#00f5a0' : '#f87171' }}>
                    {msg.split(':')[1]}
                </p>
            )}

            {/* GRID PRINCIPAL */}
            <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'20px' }}>

                {/* SIDEBAR MÓDULOS */}
                <div style={cardStyle}>
                    <h3 style={{ color:'#00E5FF', marginBottom:'16px', fontSize:'14px', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                        Módulos
                    </h3>

                    {/* Agregar módulo */}
                    <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                        <input
                            type="text"
                            placeholder="Nuevo módulo..."
                            value={nuevoModulo}
                            onChange={e => setNuevoModulo(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && agregarModulo()}
                            style={{ ...inputStyle, flex:1, padding:'8px 12px' }}
                        />
                        <button onClick={agregarModulo} style={{ ...btnPrimStyle, padding:'8px 14px' }}>+</button>
                    </div>

                    {/* Lista módulos */}
                    {modulos.length === 0 ? (
                        <p style={{ color:'#7A8BA8', fontSize:'13px' }}>No hay módulos aún. ¡Agrega el primero!</p>
                    ) : modulos.map(m => (
                        <div
                            key={m.id}
                            style={{
                                ...moduloItemStyle,
                                borderColor: moduloActivo?.id === m.id ? (curso?.color || '#00E5FF') : 'rgba(255,255,255,0.08)',
                                background:  moduloActivo?.id === m.id ? `rgba(0,229,255,0.08)` : 'rgba(255,255,255,0.03)',
                            }}
                        >
                            <div style={{ flex:1, cursor:'pointer' }} onClick={() => seleccionarModulo(m)}>
                                <p style={{ fontSize:'13px', fontWeight:'600', color: moduloActivo?.id === m.id ? '#00E5FF' : '#EEF2FF' }}>
                                    {m.nombre}
                                </p>
                                <p style={{ fontSize:'11px', color:'#7A8BA8', marginTop:'2px' }}>
                                    {m.lecciones.length} lecciones
                                </p>
                            </div>
                            <button
                                onClick={() => eliminarModulo(m.id)}
                                style={{ background:'transparent', border:'none', cursor:'pointer', color:'#f87171', fontSize:'14px', padding:'2px 6px' }}
                            >â</button>
                        </div>
                    ))}
                </div>

                {/* PANEL CONTENIDO */}
                <div style={cardStyle}>
                    {!moduloActivo ? (
                        <div style={{ textAlign:'center', padding:'48px', color:'#7A8BA8' }}>
                            <p>Crea o selecciona un módulo para ver su contenido.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                                <h2 style={{ fontSize:'17px', fontWeight:'700' }}>{moduloActivo.nombre}</h2>
                                <span style={{ fontSize:'12px', color:'#7A8BA8' }}>{moduloActivo.lecciones.length} lecciones</span>
                            </div>

                            {/* Tabs de lecciones */}
                            {moduloActivo.lecciones.length > 0 && (
                                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
                                    {moduloActivo.lecciones.map(l => (
                                        <button
                                            key={l.id}
                                            onClick={() => setLeccionActiva(l)}
                                            style={{
                                                padding:'6px 14px', borderRadius:'8px', fontSize:'12px',
                                                fontFamily:'inherit', cursor:'pointer',
                                                border: leccionActiva?.id === l.id ? `1px solid ${curso?.color || '#00E5FF'}` : '1px solid rgba(255,255,255,0.1)',
                                                background: leccionActiva?.id === l.id ? 'rgba(0,229,255,0.1)' : 'transparent',
                                                color: leccionActiva?.id === l.id ? '#00E5FF' : '#7A8BA8',
                                            }}
                                        >
                                            {l.titulo}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Contenido de la lección activa */}
                            {leccionActiva ? (
                                <div>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                                        <h3 style={{ fontSize:'16px', fontWeight:'700' }}>{leccionActiva.titulo}</h3>
                                        <button
                                            onClick={() => eliminarLeccion(leccionActiva.id)}
                                            style={{ background:'transparent', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'6px', padding:'5px 12px', color:'#f87171', fontSize:'12px', cursor:'pointer', fontFamily:'inherit' }}
                                        >
                                            Eliminar lección
                                        </button>
                                    </div>

                                    {leccionActiva.descripcion && (
                                        <p style={{ color:'#7A8BA8', fontSize:'13px', marginBottom:'16px', lineHeight:'1.6' }}>
                                            {leccionActiva.descripcion}
                                        </p>
                                    )}

                                    {leccionActiva.video_url ? (
                                        <div style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                                            <iframe
                                                width="100%"
                                                height="460"
                                                src={leccionActiva.video_url}
                                                title={leccionActiva.titulo}
                                                frameBorder="0"
                                                allowFullScreen
                                                style={{ display:'block' }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ textAlign:'center', padding:'48px', color:'#7A8BA8', background:'rgba(255,255,255,0.03)', borderRadius:'12px' }}>
                                            Esta lección no tiene video aún.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign:'center', padding:'48px', color:'#7A8BA8' }}>
                                    <p>Este módulo no tiene lecciones aún.</p>
                                    <p style={{ fontSize:'13px', marginTop:'8px' }}>Haz clic en "+ Agregar lección" para comenzar.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ââ ESTILOS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const cardStyle = {
    background: 'rgba(13,21,37,0.95)',
    border: '1px solid rgba(0,229,255,0.12)',
    borderRadius: '16px',
    padding: '24px',
};

const moduloItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid',
    marginBottom: '8px',
    transition: '0.2s',
};

const btnPrimStyle = {
    background: '#00E5FF', color: '#060B14', border: 'none',
    borderRadius: '8px', padding: '9px 18px', fontWeight: '700',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
};

const btnSecStyle = {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px', padding: '7px 14px', color: '#7A8BA8',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
};

const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '600',
    color: '#7A8BA8', letterSpacing: '0.1em',
    textTransform: 'uppercase', marginBottom: '6px',
};

const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
    padding: '9px 12px', color: '#EEF2FF', fontSize: '13px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
};
