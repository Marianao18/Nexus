import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecuperarPassword.css'; // <--- Importamos el nuevo CSS

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
            // Ajustamos a la URL de tu backend
            await axios.post('http://localhost:8000/api/password-reset/', { 
                email: email.trim().toLowerCase() 
            });
            
            setMensaje("Petición enviada. Si el correo existe, recibirás un enlace pronto.");
        } catch (err) {
            console.error(err);
            setError("Error al procesar la solicitud. Verifica tu conexión.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <header className="reset-header">
                    <h2 className="reset-title">NEXUS <span>RESET</span></h2>
                    <p className="reset-subtitle">Recuperación de Acceso</p>
                </header>

                <form onSubmit={manejarRecuperacion} className="reset-form">
                    <div className="reset-input-group">
                        <label className="reset-label">Correo </label>
                        <input
                            type="email"
                            placeholder="Introduce tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="reset-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="reset-button"
                    >
                        {cargando ? 'Procesando...' : 'Enviar enlace de seguridad'}
                    </button>
                </form>

                <div className="reset-footer">
                    <button 
                        type="button" 
                        className="back-link"
                        onClick={() => navigate('/login')}
                    >
                        ¿Recordaste tu clave? <span>Volver al Login</span>
                    </button>
                </div>

                {mensaje && <div className="reset-success-box">{mensaje}</div>}
                {error && <div className="reset-error-box">{error}</div>}
            </div>
        </div>
    );
};

export default RecuperarPassword;