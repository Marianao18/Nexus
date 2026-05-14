import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RestablecerPassword.css';

const RestablecerPassword = () => {
    const { uid, token } = useParams(); 
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const navigate = useNavigate();

    const manejarCambioPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (password !== confirmar) {
            return setError("Las contraseñas no coinciden.");
        }

        setCargando(true);

        try {
            const res = await axios.post('http://localhost:8000/api/confirmar-password/', {
                uid: uid,
                token: token,
                new_password: password
            });

            setMensaje("¡Contraseña actualizada con éxito! Redirigiendo...");
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError("El enlace ha expirado o es inválido. Por favor, solicita uno nuevo.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                <header className="reset-header">
                    <h2 className="reset-title">NUEVA <span>CONTRASEÑA</span></h2>
                    <p className="reset-subtitle">Establece tu nuevo acceso seguro</p>
                </header>

                <form onSubmit={manejarCambioPassword} className="reset-form">
                    <div className="reset-input-group">
                        <label className="reset-label">Nueva Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="reset-input"
                        />
                    </div>

                    <div className="reset-input-group">
                        <label className="reset-label">Confirmar Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmar}
                            onChange={(e) => setConfirmar(e.target.value)}
                            required
                            className="reset-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="reset-button"
                    >
                        {cargando ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
                    </button>
                </form>

                {mensaje && <div className="reset-success-box">{mensaje}</div>}
                {error && <div className="reset-error-box">{error}</div>}
            </div>
        </div>
    );
};

export default RestablecerPassword;