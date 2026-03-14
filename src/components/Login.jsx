import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const navigate = useNavigate();

    const manejarLogin = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);
        
        // Limpiamos rastro antes de iniciar nueva sesión
        localStorage.clear();

        try {
            const res = await axios.post('http://localhost:5000/api/login', {
                email: email.trim().toLowerCase(),
                password
            });
            
            // Ajuste para capturar bien los datos del backend
            const userData = res.data.user || res.data;
            const nombre = userData.nombre || 'Usuario';
            const rolOriginal = userData.rol || '';
            const rolNormalizado = rolOriginal.toLowerCase().trim();

            // Guardamos datos de sesión
            localStorage.setItem('rol', rolNormalizado);
            localStorage.setItem('userName', nombre);

            // Disparamos evento para que el Navbar y App.js se actualicen
            window.dispatchEvent(new Event("authChange"));

            // Redirección lógica
            if (rolNormalizado.includes('admin')) {
                navigate('/admin-dashboard');
            } else {
                navigate('/');
            }

        } catch (err) {
            console.error("Error en login:", err);
            if (!err.response) {
                setError("Sin conexión con el servidor NEXUS.");
            } else if (err.response.status === 401) {
                setError("Credenciales incorrectas.");
            } else {
                setError("Error de acceso. Intente de nuevo.");
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <header className="login-header">
                    <h2 className="login-title">NEXUS <span>ID</span></h2>
                    <p className="login-subtitle">Panel de Acceso Centralizado</p>
                </header>

                <form onSubmit={manejarLogin} className="login-form">
                    <div className="login-input-group">
                        <label className="login-label">Correo Institucional</label>
                        <input
                            type="email"
                            placeholder="usuario@nexus.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="login-input"
                            autoComplete="email"
                        />
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="login-input"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="login-button"
                    >
                        {cargando ? 'Verificando...' : 'Entrar al Sistema'}
                    </button>
                </form>

                {error && (
                    <div className="login-error-box fade-in">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;