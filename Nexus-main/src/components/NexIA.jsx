import React, { useState, useRef, useEffect } from 'react';
import styles from './NexIA.module.css';

/* ── Respuestas del asistente según palabras clave ── */
const getResponse = (text) => {
    const t = text.toLowerCase();
    if (t.includes('curso') || t.includes('disponible') || t.includes('activo'))
        return 'Tienes cursos activos en NEXUS: Análisis con Python, Django REST y PostgreSQL Avanzado. ¿Quieres saber tu progreso en alguno?';
    if (t.includes('progreso') || t.includes('avanzado') || t.includes('completado'))
        return 'Tu progreso global en NEXUS es del 42%. En Python llevas 3 módulos completos, te faltan Matplotlib y el proyecto final. ¡Vas muy bien!';
    if (t.includes('hoy') || t.includes('estudi') || t.includes('recomien'))
        return 'Para hoy te recomiendo repasar el módulo de Pandas (25 min) antes de tu clase de Django de esta noche. Vas en buen ritmo.';
    if (t.includes('django'))
        return 'En tu curso de Django llevas el módulo de modelos y vistas. El siguiente paso es REST Framework y autenticación JWT. ¿Tienes alguna duda puntual?';
    if (t.includes('python'))
        return 'Tu ruta de Python incluye: NumPy, Pandas, Matplotlib y un proyecto final de análisis real. Llevas un 42% completado.';
    if (t.includes('postgres') || t.includes('sql') || t.includes('base de dato'))
        return 'PostgreSQL es tu tercer curso activo. Cubre SQL avanzado, índices, transacciones y optimización de consultas. ¿Quieres recursos adicionales?';
    if (t.includes('certificado') || t.includes('diploma'))
        return 'Obtienes tu certificado NEXUS al completar el 100% del curso y aprobar el proyecto final. ¡Ya estás a mitad de camino!';
    if (t.includes('horario') || t.includes('clase') || t.includes('próximo'))
        return 'Tu próxima clase es Django hoy en la tarde. Recuerda que las clases son presenciales en Medellín.';
    if (t.includes('hola') || t.includes('buenas') || t.includes('hey'))
        return '¡Hola! Soy NEXIA, tu asistente de aprendizaje en NEXUS. Puedo ayudarte con tus cursos, progreso, dudas técnicas y más. ¿Qué necesitas?';
    return 'Entendido. Estoy aquí para ayudarte con tus cursos, tu progreso o cualquier duda sobre la plataforma. ¿Qué más necesitas?';
};

const CHIPS_INICIALES = [
    { label: 'Ver mis cursos',     msg: '¿Qué cursos tengo activos?' },
    { label: 'Mi progreso',        msg: '¿Cuánto he progresado en Python?' },
    { label: '¿Qué estudio hoy?',  msg: '¿Qué debo estudiar hoy?' },
];

export default function NexIA() {
    const [abierto, setAbierto]       = useState(false);
    const [mensajes, setMensajes]     = useState([
        { rol: 'ai', texto: '¡Hola! Soy <strong>NEXIA</strong>, tu asistente de aprendizaje. ¿En qué te puedo ayudar hoy?' }
    ]);
    const [input, setInput]           = useState('');
    const [escribiendo, setEscribiendo] = useState(false);
    const [chipsVisible, setChipsVisible] = useState(true);
    const [labelVisible, setLabelVisible] = useState(false);
    const mensajesRef = useRef(null);

    /* Mostrar etiqueta flotante al montar */
    useEffect(() => {
        const t = setTimeout(() => setLabelVisible(true), 900);
        return () => clearTimeout(t);
    }, []);

    /* Auto-scroll al nuevo mensaje */
    useEffect(() => {
        if (mensajesRef.current) {
            mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
        }
    }, [mensajes, escribiendo]);

    const toggleChat = () => {
        setAbierto(prev => !prev);
        if (!abierto) setLabelVisible(false);
    };

    const enviarMensaje = (texto = input) => {
        const msg = texto.trim();
        if (!msg) return;
        setInput('');
        setChipsVisible(false);
        setMensajes(prev => [...prev, { rol: 'user', texto: msg }]);
        setEscribiendo(true);
        setTimeout(() => {
            setEscribiendo(false);
            setMensajes(prev => [...prev, { rol: 'ai', texto: getResponse(msg) }]);
        }, 1100);
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
                    title="Abrir asistente NEXIA"
                    aria-label="Abrir asistente virtual NEXIA"
                >
                    {abierto ? (
                        /* Ícono X (cerrar) */
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <line x1="5" y1="5" x2="17" y2="17" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round"/>
                            <line x1="17" y1="5" x2="5"  y2="17" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    ) : (
                        /* Ícono IA (radial) */
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
                                    <line x1="9" y1="12.5" x2="9"  y2="16" stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round"/>
                                    <line x1="2" y1="9"    x2="5.5" y2="9" stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round"/>
                                    <line x1="12.5" y1="9" x2="16"  y2="9" stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <div>
                                <div className={styles.aiName}>NEX<span>IA</span></div>
                                <div className={styles.aiStatus}>En línea</div>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={toggleChat} aria-label="Cerrar chat">✕</button>
                    </div>

                    {/* Mensajes */}
                    <div className={styles.messages} ref={mensajesRef}>
                        {mensajes.map((m, i) => (
                            <div key={i} className={`${styles.msg} ${m.rol === 'user' ? styles.user : styles.ai}`}>
                                <div
                                    className={styles.msgBubble}
                                    dangerouslySetInnerHTML={{ __html: m.texto }}
                                />
                                <span className={styles.msgTime}>Ahora</span>
                            </div>
                        ))}
                        {escribiendo && (
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
                                <button key={i} className={styles.chip} onClick={() => enviarMensaje(c.msg)}>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className={styles.inputRow}>
                        <input
                            className={styles.chatInput}
                            type="text"
                            placeholder="Pregúntale a NEXIA..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
                            aria-label="Mensaje para NEXIA"
                        />
                        <button className={styles.sendBtn} onClick={() => enviarMensaje()} aria-label="Enviar mensaje">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="#060B14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
