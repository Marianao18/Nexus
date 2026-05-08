import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
});

/**
 * VideoProtegido — Reproductor seguro para contenido de NEXUS.
 *
 * Props:
 *   leccionId   → ID de la lección a reproducir
 *   titulo      → Título de la lección
 *   onVisto     → Callback cuando el estudiante marca como vista
 *   yaVisto     → Boolean si ya fue marcada como vista
 */
export default function VideoProtegido({ leccionId, titulo, onVisto, yaVisto }) {
    const [estado, setEstado] = useState('cargando'); // cargando | autorizado | bloqueado | sin_video
    const [embedUrl, setEmbedUrl] = useState('');
    const [msg, setMsg] = useState('');
    const [marcando, setMarcando] = useState(false);
    const contenedorRef = useRef(null);

    useEffect(() => {
        if (!leccionId) return;
        setEstado('cargando');
        setEmbedUrl('');

        // Pedirle al backend el link del video de forma segura
        axios.get(`/api/estudiante/lecciones/${leccionId}/token/`, authHeaders())
            .then(res => {
                setEmbedUrl(res.data.embed_url);
                setEstado('autorizado');
            })
            .catch(err => {
                const codigo = err.response?.status;
                if (codigo === 403) {
                    setMsg(err.response?.data?.error || 'No tienes acceso a este contenido.');
                    setEstado('bloqueado');
                } else if (codigo === 404) {
                    setEstado('sin_video');
                } else {
                    setMsg('Error al cargar el video. Intenta de nuevo.');
                    setEstado('bloqueado');
                }
            });
    }, [leccionId]);

    // Bloquear clic derecho y selección de texto en el contenedor
    const bloquearContextMenu = (e) => {
        e.preventDefault();
        setMsg('⚠️ El contenido de NEXUS está protegido.');
        setTimeout(() => setMsg(''), 3000);
    };

    const marcarVisto = async () => {
        if (yaVisto || marcando) return;
        setMarcando(true);
        try {
            await axios.post(
                `/api/estudiante/lecciones/${leccionId}/vista/`,
                {},
                authHeaders()
            );
            if (onVisto) onVisto(leccionId);
        } catch { /* silencioso */ }
        finally { setMarcando(false); }
    };

    // ── ESTADO: CARGANDO ─────────────────────────────────────────────────────
    if (estado === 'cargando') {
        return (
            <div style={contenedorStyle}>
                <div style={overlayStyle}>
                    <div style={logoStyle}>NEX<span style={{ color: '#00E5FF' }}>US</span></div>
                    <div style={spinnerStyle} />
                    <p style={{ color: '#7A8BA8', fontSize: '13px', marginTop: '16px' }}>
                        Verificando acceso al contenido...
                    </p>
                </div>
            </div>
        );
    }

    // ── ESTADO: BLOQUEADO ────────────────────────────────────────────────────
    if (estado === 'bloqueado') {
        return (
            <div style={contenedorStyle}>
                <div style={{ ...overlayStyle, background: 'rgba(6,11,20,0.97)' }}>
                    {/* Logo */}
                    <div style={logoStyle}>NEX<span style={{ color: '#00E5FF' }}>US</span></div>

                    {/* Icono candado */}
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(248,113,113,0.1)',
                        border: '2px solid rgba(248,113,113,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '16px auto',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    </div>

                    <h3 style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: '800',
                        fontSize: '18px', color: '#EEF2FF', margin: '0 0 10px',
                    }}>
                        Contenido exclusivo
                    </h3>

                    <p style={{
                        color: '#7A8BA8', fontSize: '13px', lineHeight: '1.6',
                        maxWidth: '320px', textAlign: 'center', margin: '0 auto 20px',
                    }}>
                        {msg || 'Este contenido es exclusivo para estudiantes inscritos en NEXUS.'}
                    </p>

                    <div style={{
                        background: 'rgba(0,229,255,0.06)',
                        border: '1px solid rgba(0,229,255,0.2)',
                        borderRadius: '10px', padding: '14px 20px',
                        maxWidth: '300px', margin: '0 auto',
                    }}>
                        <p style={{ color: '#00E5FF', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                            ¿Quieres acceder?
                        </p>
                        <p style={{ color: '#7A8BA8', fontSize: '12px', lineHeight: '1.5' }}>
                            Inscríbete en el curso desde tu dashboard de estudiante para ver todo el contenido.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── ESTADO: SIN VIDEO ────────────────────────────────────────────────────
    if (estado === 'sin_video') {
        return (
            <div style={{ ...contenedorStyle, minHeight: '200px' }}>
                <div style={overlayStyle}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7A8BA8" strokeWidth="1.5">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <p style={{ color: '#7A8BA8', fontSize: '13px', marginTop: '12px' }}>
                        Esta lección aún no tiene video disponible.
                    </p>
                </div>
            </div>
        );
    }

    // ── ESTADO: AUTORIZADO ───────────────────────────────────────────────────
    // ── ESTADO: AUTORIZADO ───────────────────────────────────────────────────
return (
    <div>
        {msg && (
            <div style={{
                background:'rgba(248,113,113,0.1)',
                border:'1px solid rgba(248,113,113,0.3)',
                borderRadius:'8px', padding:'10px 16px',
                marginBottom:'12px', fontSize:'13px', color:'#f87171',
            }}>
                {msg}
            </div>
        )}

        <div
            ref={contenedorRef}
            onContextMenu={bloquearContextMenu}
            style={{
                position:'relative',
                borderRadius:'14px',
                overflow:'hidden',
                border:'1px solid rgba(255,255,255,0.08)',
                userSelect:'none',
                WebkitUserSelect:'none',
            }}
        >
            <iframe
                width="100%"
                height="480"
                src={`${embedUrl}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=0&controls=1&showinfo=0&fs=1&playsinline=1`}
                title={titulo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display:'block' }}
                referrerPolicy="strict-origin-when-cross-origin"
            />
        </div>

        {/* Marca de agua NEXUS */}
        <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'10px 14px',
            background:'rgba(13,21,37,0.8)',
            borderRadius:'0 0 14px 14px',
            border:'1px solid rgba(255,255,255,0.06)',
            borderTop:'none', marginTop:'-4px',
        }}>
            <span style={{
                fontFamily:'Space Mono, monospace',
                fontSize:'10px', color:'#7A8BA8', letterSpacing:'0.1em',
            }}>
                🔒 Contenido protegido · NEX<span style={{color:'#00E5FF'}}>US</span>
            </span>
            {!yaVisto ? (
                <button
                    onClick={marcarVisto}
                    disabled={marcando}
                    style={{
                        background:'transparent',
                        border:'1px solid rgba(0,229,255,0.3)',
                        borderRadius:'6px', padding:'5px 12px',
                        color:'#00E5FF', fontSize:'11px',
                        fontFamily:'inherit', cursor:'pointer',
                        opacity: marcando ? 0.7 : 1,
                    }}
                >
                    {marcando ? 'Guardando...' : '✓ Marcar como vista'}
                </button>
            ) : (
                <span style={{
                    fontSize:'11px', color:'#A3FF4F',
                    fontFamily:'Space Mono, monospace',
                }}>
                    ✓ Completada
                </span>
            )}
        </div>
    </div>
);
}


// ── ESTILOS ───────────────────────────────────────────────────────────────────
const contenedorStyle = {
    width: '100%', minHeight: '480px',
    borderRadius: '14px', overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    background: '#060B14',
};

const overlayStyle = {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '24px',
    background: 'rgba(6,11,20,0.95)',
};

const logoStyle = {
    fontFamily: 'Syne, sans-serif',
    fontWeight: '800', fontSize: '22px',
    color: '#EEF2FF', letterSpacing: '-0.02em',
    marginBottom: '16px',
};

const spinnerStyle = {
    width: '36px', height: '36px',
    border: '3px solid rgba(0,229,255,0.2)',
    borderTop: '3px solid #00E5FF',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
};

