import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './NexIA.module.css';

// ── Chips de sugerencias iniciales ───────────────────────────────────────────
const CHIPS_INICIALES = [
    { label: '¿Qué estudio hoy?',   msg: '¿Qué me recomiendas estudiar hoy según mi progreso?' },
    { label: 'Mi progreso',          msg: '¿Cuánto he avanzado en mis cursos?' },
    { label: 'Ver mis cursos',       msg: '¿En qué cursos estoy inscrito y cómo voy en cada uno?' },
    { label: 'Estoy bloqueado',      msg: 'Estoy atascado y no sé cómo continuar, ¿me ayudas?' },
];

export default function NexIA() {
    const [abierto, setAbierto]           = useState(false);
    const [mensajes, setMensajes]         = useState([
        { rol: 'ai', texto: '¡Hola! Soy **NexIA**, tu asistente de aprendizaje en NEXUS. Puedo ayudarte con tus cursos, tu progreso y cualquier duda técnica. ¿En qué te puedo ayudar hoy?' }
    ]);
    const [input, setInput]               = useState('');
    const [cargando, setCargando]         = useState(false);
    const [chipsVisible, setChipsVisible] = useState(true);
    const [labelVisible, setLabelVisible] = useState(false);
    const [error, setError]               = useState(null);
    const mensajesRef                     = useRef(null);
    const inputRef                        = useRef(null);

    // Mostrar etiqueta flotante al montar
    useEffect(() => {
        const t = setTimeout(() => setLabelVisible(true), 900);
        return () => clearTimeout(t);
    }, []);

    // Auto-scroll al nuevo mensaje
    useEffect(() => {
        if (mensajesRef.current) {
            mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
        }
    }, [mensajes, cargando]);

    // Focus en input al abrir
    useEffect(() => {
        if (abierto && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [abierto]);

    const toggleChat = () => {
        setAbierto(prev => !prev);
        if (!abierto) setLabelVisible(false);
    };

    // Construye el historial de los últimos 10 mensajes para enviar al backend
    const buildHistorial = useCallback((mensajesActuales) => {
        // Excluir el mensaje de bienvenida inicial (primer mensaje AI)
        const conversacion = mensajesActuales.slice(1);
        return conversacion.slice(-10).map(m => ({
            rol:   m.rol === 'user' ? 'user' : 'assistant',
            texto: m.texto,
        }));
    }, []);

    const enviarMensaje = useCallback(async (texto = input) => {
        const msg = texto.trim();
        if (!msg || cargando) return;

        setInput('');
        setChipsVisible(false);
        setError(null);

        const nuevosMensajes = [...mensajes, { rol: 'user', texto: msg }];
        setMensajes(nuevosMensajes);
        setCargando(true);

        try {
            const token = localStorage.getItem('access_token');
            const historial = buildHistorial(nuevosMensajes);

            const response = await axios.post(
                '/api/nexia/chat/',
                { mensaje: msg, historial },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,  // 30s timeout
                }
            );

            const respuestaIA = response.data.respuesta;
            setMensajes(prev => [
                ...prev,
                { rol: 'ai', texto: respuestaIA }
            ]);

        } catch (err) {
            let mensajeError = 'Tuve un problema al procesar tu pregunta. Intenta de nuevo.';

            if (err.code === 'ECONNABORTED') {
                mensajeError = 'La respuesta tardó demasiado. Intenta con una pregunta más corta.';
            } else if (err.response?.status === 401) {
                mensajeError = 'Tu sesión expiró. Por favor vuelve a iniciar sesión.';
            } else if (err.response?.status === 429) {
                mensajeError = 'Estoy recibiendo muchas consultas en este momento. Intenta en unos segundos.';
            } else if (err.response?.status === 503) {
                mensajeError = err.response?.data?.error || 'NexIA no está disponible en este momento.';
            } else if (err.response?.data?.error) {
                mensajeError = err.response.data.error;
            }

            setMensajes(prev => [
                ...prev,
                { rol: 'ai', texto: `⚠️ ${mensajeError}`, esError: true }
            ]);
            setError(mensajeError);

        } finally {
            setCargando(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [input, cargando, mensajes, buildHistorial]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    const limpiarChat = () => {
        setMensajes([
            { rol: 'ai', texto: '¡Hola de nuevo! ¿En qué te puedo ayudar?' }
        ]);
        setChipsVisible(true);
        setError(null);
    };

    return (
        <>
            {/* ── Burbuja flotante ── */}
            <div className={styles.bubble}>

                {/* Etiqueta "Asistente IA · Online" */}
                <div className={`${styles.bubbleLabel} ${labelVisible && !abierto ? styles.visible : ''}`}>
                    <span className={styles.labelDot} />
                    <span className={styles.labelText}>Asistente IA · Online</span>
                </div>

                {/* Botón principal */}
                <button
                    className={`${styles.bubbleBtn} ${abierto ? styles.open : ''}`}
                    onClick={toggleChat}
                    title="Abrir asistente NexIA"
                    aria-label="Abrir asistente virtual NexIA"
                >
                    {abierto ? (
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <line x1="5" y1="5" x2="17" y2="17" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round"/>
                            <line x1="17" y1="5" x2="5"  y2="17" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    ) : (
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                            <circle cx="13" cy="13" r="4" stroke="#060B14" strokeWidth="1.5"/>
                            <line x1="13" y1="3"  x2="13" y2="7"  stroke="#060B14" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="13" y1="19" x2="13" y2="23" stroke="#060B14" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="3"  y1="13" x2="7"  y2="13" stroke="#060B14" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="19" y1="13" x2="23" y2="13" stroke="#060B14" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="6.5" y1="6.5"   x2="9.2"  y2="9.2"  stroke="#060B14" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="16.8" y1="16.8" x2="19.5" y2="19.5" stroke="#060B14" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="19.5" y1="6.5"  x2="16.8" y2="9.2"  stroke="#060B14" strokeWidth="1.5" strokeLinecap="round"/>
                            <line x1="9.2"  y1="16.8" x2="6.5"  y2="19.5" stroke="#060B14" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    )}
                </button>
            </div>

            {/* ── Panel de chat ── */}
            {abierto && (
                <div className={styles.chatPanel}>

                    {/* Header */}
                    <div className={styles.chatHeader}>
                        <div className={styles.chatHeaderLeft}>
                            <div className={styles.aiIcon}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <circle cx="9" cy="9" r="2.5" stroke="#00E5FF" strokeWidth="1.2"/>
                                    <line x1="9" y1="2"    x2="9"  y2="5.5" stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round"/>
                                    <line x1="9" y1="12.5" x2="9"  y2="16"  stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round"/>
                                    <line x1="2" y1="9"    x2="5.5" y2="9"  stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round"/>
                                    <line x1="12.5" y1="9" x2="16"  y2="9"  stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div>
                                <div className={styles.aiName}>NEX<span>IA</span></div>
                                <div className={styles.aiStatus}>
                                    {cargando ? 'Pensando...' : 'En línea'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Botón limpiar chat */}
                            <button
                                className={styles.closeBtn}
                                onClick={limpiarChat}
                                title="Nueva conversación"
                                aria-label="Nueva conversación"
                                style={{ fontSize: '14px', opacity: 0.7 }}
                            >
                                ↺
                            </button>
                            <button
                                className={styles.closeBtn}
                                onClick={toggleChat}
                                aria-label="Cerrar chat"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className={styles.messages} ref={mensajesRef}>
                        {mensajes.map((m, i) => (
                            <div
                                key={i}
                                className={`${styles.msg} ${m.rol === 'user' ? styles.user : styles.ai} ${m.esError ? styles.msgError : ''}`}
                            >
                                <div className={styles.msgBubble}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Abrir links externos en nueva pestaña
                                            a: ({ node, ...props }) => (
                                                <a {...props} target="_blank" rel="noopener noreferrer" />
                                            ),
                                        }}
                                    >
                                        {m.texto}
                                    </ReactMarkdown>
                                </div>
                                <span className={styles.msgTime}>
                                    {i === 0 ? 'Inicio' : 'Ahora'}
                                </span>
                            </div>
                        ))}

                        {/* Indicador de carga */}
                        {cargando && (
                            <div className={`${styles.msg} ${styles.ai}`}>
                                <div className={styles.typing}>
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chips de sugerencias */}
                    {chipsVisible && (
                        <div className={styles.chips}>
                            {CHIPS_INICIALES.map((c, i) => (
                                <button
                                    key={i}
                                    className={styles.chip}
                                    onClick={() => enviarMensaje(c.msg)}
                                    disabled={cargando}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className={styles.inputRow}>
                        <input
                            ref={inputRef}
                            className={styles.chatInput}
                            type="text"
                            placeholder={cargando ? 'NexIA está pensando...' : 'Pregúntale a NexIA...'}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={cargando}
                            aria-label="Mensaje para NexIA"
                            maxLength={1000}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={() => enviarMensaje()}
                            disabled={cargando || !input.trim()}
                            aria-label="Enviar mensaje"
                        >
                            {cargando ? (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <circle cx="7" cy="7" r="5" stroke="#060B14" strokeWidth="1.5" strokeDasharray="8 4" strokeLinecap="round">
                                        <animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="0.8s" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="#060B14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
