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

        // Limpiar sesión anterior
        localStorage.clear();

        try {
            const res = await axios.post('/api/login/', {
                email: email.trim().toLowerCase(),
                password
            });

            console.log("RESPUESTA LOGIN:", res.data);

            // Datos del usuario
            const userData = res.data.user || res.data;

            const nombre = userData.nombre || 'Usuario';
            const rolOriginal = userData.rol || '';
            const rolNormalizado = rolOriginal.toLowerCase().trim();

            // Guardar tokens
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);

            // Guardar datos usuario
            localStorage.setItem('rol', rolNormalizado);
            localStorage.setItem('userName', nombre);

            // IMPORTANTE:
            // convertir a string para evitar errores
            const debeCambiar = String(userData.debe_cambiar_password);
            localStorage.setItem('debe_cambiar', debeCambiar);

            // Notificar cambio auth
            window.dispatchEvent(new Event("authChange"));

            // VALIDACIÓN OBLIGATORIA
            if (userData.debe_cambiar_password === true) {

                console.log("Debe cambiar contraseña");

                navigate('/cambiar-password-obligatorio');
                return;
            }

            // Redirección por rol
            if (rolNormalizado.includes('admin')) {
                navigate('/admin-dashboard');

            } else if (rolNormalizado.includes('docente')) {
                navigate('/docente-dashboard');

            } else {
                navigate('/estudiante-dashboard');
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
                    <h2 className="login-title">
                        NEXUS <span>ID</span>
                    </h2>

                    <p className="login-subtitle">
                        Iniciar sesión
                    </p>
                </header>

                <form onSubmit={manejarLogin} className="login-form">

                    {/* EMAIL */}
                    <div className="login-input-group">
                        <label className="login-label">
                            Correo Institucional
                        </label>

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

                    {/* PASSWORD */}
                    <div className="login-input-group">
                        <label className="login-label">
                            Contraseña
                        </label>

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

                    {/* BOTÓN */}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="login-button"
                    >
                        {cargando
                            ? 'Verificando...'
                            : 'Entrar al Sistema'}
                    </button>

                </form>

                {/* RECUPERAR */}
                <div className="login-footer">

                    <button
                        type="button"
                        className="forgot-password-link"
                        onClick={() => navigate('/recuperar-contrasena')}
                    >
                        ¿Olvidaste tu contraseña?
                        <span> Recupérala aquí</span>
                    </button>

                </div>

                {/* ERROR */}
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