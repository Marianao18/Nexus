import React, { useState } from 'react';
import axios from 'axios';
import './SolicitudDocente.css';

const SolicitudDocente = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [link, setLink] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [respuestaServidor, setRespuestaServidor] = useState({ texto: '', esError: false });
    const [cargando, setCargando] = useState(false);

    const enviarSolicitud = async (e) => {
        e.preventDefault();
        
        // Validación manual adicional antes de enviar
        if (nombre.trim().length < 3) {
            setRespuestaServidor({ texto: "El nombre es demasiado corto", esError: true });
            return;
        }

        setCargando(true);
        setRespuestaServidor({ texto: '', esError: false });

        try {
            const res = await axios.post('/api/solicitud-docente/', {
                nombre_completo: nombre,
                email: email,
                especialidad: especialidad,
                link_certificacion: link,
                mensaje_motivacion: mensaje
            });

            // Éxito
            setRespuestaServidor({ texto: res.data.mensaje, esError: false });
            // Limpiar formulario
            setNombre(''); setEmail(''); setEspecialidad(''); setLink(''); setMensaje('');
        } catch (err) {
            // Error
            const mensajeError = err.response?.data?.error || "Error de conexión con el servidor";
            setRespuestaServidor({ texto: mensajeError, esError: true });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="solicitud-container">
            <div className="solicitud-card">
            <div className="brand-header">
                <h1 className="nexus-brand">NEXUS <span>DOC</span></h1>
                <p className="solicitud-subtitle-branding">POSTULACIÓN PARA DOCENTES</p>
            </div>
                <p className="solicitud-description">Completa tus datos para que el administrador revise tu perfil.</p>
                
                <form className="solicitud-form" onSubmit={enviarSolicitud}>
                    <input 
                        type="text" 
                        placeholder="Nombre completo" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        required 
                        minLength="3"
                        className="solicitud-input"
                        disabled={cargando}
                    />
                    
                    <input 
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="solicitud-input"
                        disabled={cargando}
                    />
                    
                    <input 
                        type="text" 
                        placeholder="Especialidad (Ej: Matemáticas)" 
                        value={especialidad} 
                        onChange={(e) => setEspecialidad(e.target.value)} 
                        required 
                        className="solicitud-input"
                        disabled={cargando}
                    />
                    
                    <input 
                        type="url" 
                        placeholder="Link a certificado o Portfolio (Opcional)" 
                        value={link} 
                        onChange={(e) => setLink(e.target.value)} 
                        className="solicitud-input"
                        disabled={cargando}
                    />
                    
                    <textarea 
                        placeholder="¿Por qué quieres ser docente en Nexus?" 
                        rows="4"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        required
                        minLength="10"
                        className="solicitud-textarea"
                        disabled={cargando}
                    />

                    <button 
                        type="submit" 
                        className={`btn-enviar ${cargando ? 'btn-disabled' : ''}`}
                        disabled={cargando}
                    >
                        {cargando ? "Enviando..." : "Enviar Postulación"}
                    </button>
                </form>

                {respuestaServidor.texto && (
                    <div className={`respuesta-mensaje ${respuestaServidor.esError ? 'error' : 'exito'}`}>
                        {respuestaServidor.texto}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SolicitudDocente;