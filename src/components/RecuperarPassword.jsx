import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecuperarPassword.css';

const RecuperarPassword = () => {
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const navigate = useNavigate();

    const manejarRecuperacion = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        setCargando(true);

        try {
            // URL configurada para tu backend en local
            await axios.post('http://localhost:8000/api/password-reset/', { 
                email: email.trim().toLowerCase() 
            });
            
            setMensaje("PETICIÓN ENVIADA. Revisa tu correo para continuar con el proceso.");
        } catch (err) {
            console.error(err);
            const msgError = err.response?.data?.error || "Error de conexión con el servidor";
            setError(msgError.toUpperCase());
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                {/* Cabecera estilo NEXUS ID */}
                <header className="reset-header">
                    <h1 className="reset-title">NEXUS <span>RESET</span></h1>
                    <p className="reset-subtitle">INICIAR RECUPERACIÓN</p>
                </header>

                <form onSubmit={manejarRecuperacion} className="reset-form">
                    <div className="reset-input-group">
                        {/* Label optimizado para verse como en la imagen */}
                        <label className="reset-label">CORREO ELECTRÓNICO</label>
                        <input
                            type="email"
                            placeholder="usuario@nexus.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="reset-input"
                            disabled={cargando}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="reset-button"
                    >
                        {cargando ? 'PROCESANDO...' : 'ENVIAR ENLACE DE SEGURIDAD'}
                    </button>
                </form>

                <div className="reset-footer">
                    <button 
                        type="button" 
                        className="back-link"
                        onClick={() => navigate('/login')}
                    >
                        <span>Volver al Login</span>
                    </button>
                </div>

                {/* Mensajes de feedback */}
                {mensaje && (
                    <div className="reset-success-box">
                        {mensaje}
                    </div>
                )}
                
                {error && (
                    <div className="reset-error-box">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecuperarPassword;