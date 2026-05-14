import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; 
import './CambiarPassword.css';
const CambiarPassword = () => {
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (nuevaPassword !== confirmarPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (nuevaPassword.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post('http://localhost:8000/api/usuarios/cambiar-password-obligatorio/', 
                { nueva_password: nuevaPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200) {
                setMensaje("Contraseña actualizada. Entrando...");
                localStorage.setItem('debe_cambiar', 'false'); 
    
                setTimeout(() => {
                    window.location.href = '/docente-dashboard'; 
                }, 2000);
}
        } catch (err) {
            setError("Error al actualizar. Intente de nuevo.");
        }
    };

    const handleRegresar = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('debe_cambiar');
    localStorage.removeItem('user_role');

    navigate('/login');
};


    return (
        <div className="login-container">
            <div className="login-card">
                <header className="login-header">
                    <h2 className="login-title">NEXUS <span>ID</span></h2>
                    <p className="login-subtitle">Actualización de Seguridad</p>
                </header>

                <p style={{ color: '#ccc', textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem' }}>
                    Has ingresado con una clave temporal. Por favor, define una nueva contraseña para continuar.
                </p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <label className="login-label">Nueva Contraseña</label>
                        <input
                            type="password"
                            className="login-input"
                            value={nuevaPassword}
                            onChange={(e) => setNuevaPassword(e.target.value)}
                            required
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Confirmar Contraseña</label>
                        <input
                            type="password"
                            className="login-input"
                            value={confirmarPassword}
                            onChange={(e) => setConfirmarPassword(e.target.value)}
                            required
                            placeholder="Repite tu contraseña"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button type="submit" className="login-button">
                            Actualizar y Entrar
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={handleRegresar} 
                            className="login-button" 
                            style={{ backgroundColor: '#4b5563' }}
                        >
                            Regresar al Login
                        </button>
                    </div>
                </form>

                {error && <div className="login-error-box fade-in" style={{marginTop: '15px'}}>{error}</div>}
                {mensaje && <div className="login-error-box fade-in" style={{marginTop: '15px', backgroundColor: '#10b981'}}>{mensaje}</div>}
            </div>
        </div>
    );
};

export default CambiarPassword;