import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoProtegido from './VideoProtegido';

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});

export default function EstudianteCursoVista() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);
    const [modulos, setModulos] = useState([]);
    const [moduloActivo, setModuloActivo] = useState(null);
    const [leccionActiva, setLeccionActiva] = useState(null);
    const [progreso, setProgreso] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/estudiante/cursos/${id}/contenido/`, authHeaders());
            setCurso({ nombre: res.data.curso_nombre, color: res.data.curso_color });
            setModulos(res.data.modulos);
            setProgreso(res.data.progreso);
            if (res.data.modulos.length > 0) {
                setModuloActivo(res.data.modulos[0]);
                if (res.data.modulos[0].lecciones.length > 0) {
                    setLeccionActiva(res.data.modulos[0].lecciones[0]);
                }
            }
        } catch {
            setError('No se pudo cargar el contenido. Verifica que estés inscrito en este curso.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, [id]);


    const seleccionarLeccion = (modulo, leccion) => {
        setModuloActivo(modulo);
        setLeccionActiva(leccion);
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#00E5FF', background: '#060B14' }}>
            Cargando contenido...
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#f87171', background: '#060B14', gap: '16px' }}>
            <p>{error}</p>
            <button onClick={() => navigate('/estudiante-dashboard')} style={btnSecStyle}>← Volver al dashboard</button>
        </div>
    );

    const color = curso?.color || '#00E5FF';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#060B14', color: '#EEF2FF' }}>

            {/* SIDEBAR */}
            <aside style={{
                width: '280px', minHeight: '100vh', flexShrink: 0,
                background: '#0D1525', borderRight: '1px solid rgba(0,229,255,0.1)',
                display: 'flex', flexDirection: 'column', padding: '20px 0',
            }}>
                {/* Header sidebar */}
                <div style={{ padding: '0 16px 20px', borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
                    <button onClick={() => navigate('/estudiante-dashboard')} style={{ ...btnSecStyle, marginBottom: '12px', width: '100%', textAlign: 'left' }}>
                        ← Dashboard
                    </button>
                    <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#EEF2FF', lineHeight: '1.4' }}>{curso?.nombre}</h2>

                    {/* Barra de progreso */}
                    <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#7A8BA8' }}>Tu progreso</span>
                            <span style={{ fontSize: '11px', color, fontWeight: '700' }}>{progreso}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progreso}%`, background: color, borderRadius: '100px', transition: 'width 0.4s' }} />
                        </div>
                    </div>
                </div>

                {/* Lista de módulos y lecciones */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
                    {modulos.map(m => (
                        <div key={m.id} style={{ marginBottom: '8px' }}>
                            <p style={{
                                fontSize: '11px', fontWeight: '700', color: '#7A8BA8',
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                padding: '8px 12px', marginBottom: '4px',
                            }}>
                                {m.nombre}
                            </p>
                            {m.lecciones.map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => seleccionarLeccion(m, l)}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '10px 12px',
                                        borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        fontFamily: 'inherit', fontSize: '13px',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        background: leccionActiva?.id === l.id ? `rgba(${hexToRgb(color)},0.12)` : 'transparent',
                                        color: leccionActiva?.id === l.id ? color : '#EEF2FF',
                                        marginBottom: '2px',
                                    }}
                                >
                                    {/* Indicador vista */}
                                    <span style={{
                                        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                                        background: l.vista ? color : 'transparent',
                                        border: `2px solid ${l.vista ? color : 'rgba(255,255,255,0.2)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '9px', color: '#060B14', fontWeight: '900',
                                    }}>
                                        {l.vista ? '✓' : ''}
                                    </span>
                                    <span style={{ lineHeight: '1.3', flex: 1 }}>{l.titulo}</span>
                                </button>
                            ))}
                            {m.lecciones.length === 0 && (
                                <p style={{ fontSize: '12px', color: '#7A8BA8', padding: '6px 12px' }}>Sin lecciones aún.</p>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
                {!leccionActiva ? (
                    <div style={{ textAlign: 'center', padding: '80px', color: '#7A8BA8' }}>
                        <p style={{ fontSize: '16px' }}>Este curso aún no tiene contenido disponible.</p>
                        <p style={{ fontSize: '13px', marginTop: '8px' }}>El administrador agregará las lecciones pronto.</p>
                    </div>
                ) : (
                    <>
                        {/* Header lección */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: '#7A8BA8', marginBottom: '6px' }}>{moduloActivo?.nombre}</p>
                                <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' }}>{leccionActiva.titulo}</h1>
                                {leccionActiva.descripcion && (
                                    <p style={{ fontSize: '13px', color: '#7A8BA8', marginTop: '8px', lineHeight: '1.6', maxWidth: '600px' }}>
                                        {leccionActiva.descripcion}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* protección video desde youtube */}
                        <VideoProtegido
                            leccionId={leccionActiva.id}
                            titulo={leccionActiva.titulo}
                            yaVisto={leccionActiva.vista}
                            onVisto={(id) => {
                                const nuevosModulos = modulos.map(m => ({
                                    ...m,
                                    lecciones: m.lecciones.map(l =>
                                        l.id === id ? { ...l, vista: true } : l
                                    )
                                }));
                                setModulos(nuevosModulos);
                                setLeccionActiva({ ...leccionActiva, vista: true });
                                const total = nuevosModulos.reduce((acc, m) => acc + m.lecciones.length, 0);
                                const vistas = nuevosModulos.reduce((acc, m) => acc + m.lecciones.filter(l => l.vista).length, 0);
                                setProgreso(total > 0 ? Math.round((vistas / total) * 100) : 0);
                            }}
                        />

                        {/* Navegación entre lecciones */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            {(() => {
                                const todasLecciones = modulos.flatMap(m => m.lecciones.map(l => ({ ...l, modulo: m })));
                                const idx = todasLecciones.findIndex(l => l.id === leccionActiva.id);
                                const prev = todasLecciones[idx - 1];
                                const next = todasLecciones[idx + 1];
                                return (
                                    <>
                                        {prev ? (
                                            <button onClick={() => seleccionarLeccion(prev.modulo, prev)} style={btnSecStyle}>
                                                ← {prev.titulo}
                                            </button>
                                        ) : <div />}
                                        {next ? (
                                            <button onClick={() => seleccionarLeccion(next.modulo, next)} style={{ ...btnPrimStyle, background: color }}>
                                                {next.titulo} →
                                            </button>
                                        ) : (
                                            <button onClick={() => navigate('/estudiante-dashboard')} style={{ ...btnPrimStyle, background: color }}>
                                                Finalizar curso →
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

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
const hexToRgb = (hex) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}` : '0,229,255';
};
