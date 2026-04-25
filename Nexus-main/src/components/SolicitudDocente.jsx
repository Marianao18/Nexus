import React, { useState } from 'react';
import axios from 'axios';
import './SolicitudDocente.css';

const SolicitudDocente = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [link, setLink] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [respuestaServidor, setRespuestaServidor] = useState('');

    const enviarSolicitud = async (e) => {
        e.preventDefault();
        setRespuestaServidor('');

        try {
            const res = await axios.post('http://localhost:8000/api/solicitud-docente/', {
                nombre_completo: nombre,
                email: email,
                especialidad: especialidad,
                link_certificacion: link,
                mensaje_motivacion: mensaje
            });

            setRespuestaServidor(res.data.mensaje);
            setNombre(''); setEmail(''); setEspecialidad(''); setLink(''); setMensaje('');
        } catch (err) {
            setRespuestaServidor(err.response?.data?.error || "Error al enviar la solicitud");
        }
    };

    return (
        <div className="solicitud-container">
            <div className="solicitud-card">
                <h2>Postulación para Docente</h2>
                <p className="solicitud-subtitle">
                    Completa tus datos para que el administrador revise tu perfil.
                </p>
                
                <form className="solicitud-form" onSubmit={enviarSolicitud}>
                    <input 
                        type="text" 
                        placeholder="Nombre completo" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)} 
                        required 
                        className="solicitud-input"
                    />
                    
                    <input 
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="solicitud-input"
                    />
                    
                    <input 
                        type="text" 
                        placeholder="Especialidad (Ej: Matemáticas)" 
                        value={especialidad} 
                        onChange={(e) => setEspecialidad(e.target.value)} 
                        required 
                        className="solicitud-input"
                    />
                    
                    <input 
                        type="url" 
                        placeholder="Link a certificado o Portfolio (Opcional)" 
                        value={link} 
                        onChange={(e) => setLink(e.target.value)} 
                        className="solicitud-input"
                    />
                    
                    <textarea 
                        placeholder="¿Por qué quieres ser docente en Nexus?" 
                        rows="4"
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                        className="solicitud-textarea"
                    />

                    <button type="submit" className="btn-enviar">
                        Enviar Postulación
                    </button>
                </form>

                {respuestaServidor && (
                    <div className="respuesta-mensaje">
                        {respuestaServidor}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SolicitudDocente;