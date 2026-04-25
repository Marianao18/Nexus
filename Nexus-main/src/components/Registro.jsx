import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Registro.css';

const Registro = () => {
    // 1. Estados para capturar los datos
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const navigate = useNavigate();

    // 2. Lógica de Validaciones
    const validarFormulario = () => {
        // Nombre: Solo letras y espacios
        const regexNombre = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
        if (!regexNombre.test(nombre.trim())) {
            return "El nombre no puede contener números ni símbolos.";
        }

        // Correo: Formato estándar
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            return "Ingresa un correo válido (ejemplo@correo.com).";
        }

        // Contraseña: Min 10, Mayúscula, minúscula y número
        const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;
        if (!regexPass.test(password)) {
            return "Contraseña débil: requiere 10+ caracteres, una Mayúscula y un número.";
        }

        // Coincidencia de contraseñas
        if (password !== confirmPassword) {
            return "Las contraseñas no coinciden.";
        }

        return null;
    };

    // 3. Función para enviar a la Base de Datos
    const manejarRegistro = async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        setError('');

        const errorValidacion = validarFormulario();
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        setCargando(true);

        try {
            const respuesta = await axios.post('http://localhost:8000/api/usuarios/registrar-estudiante/', {
                nombre: nombre.trim(),
                email: email.trim().toLowerCase(),
                password: password
            });

            if (respuesta.status === 201 || respuesta.status === 200) {
                alert("¡Cuenta creada con éxito!");
                navigate('/login');
            }
        } catch (err) {
    console.error("Error completo:", err.response?.data);

    // Si el backend responde con datos de error
    if (err.response && err.response.data) {
        const data = err.response.data;

        if (data.email) {
            setError("Este correo electrónico ya está registrado. Intenta con otro o inicia sesión.");
        } else if (data.password) {
            setError("La contraseña no cumple con los requisitos del servidor.");
        } else {
            setError("Hubo un problema con los datos ingresados.");
        }
    } else {
        setError("No se pudo conectar con el servidor. Revisa tu conexión.");
    }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="registro-container">
            <div className="registro-card">
                <header className="registro-header">
                    <h2 className="registro-title">NEXUS <span>ID</span></h2>
                    <p className="registro-subtitle">Crea tu cuenta para comenzar</p>
                </header>

                <form onSubmit={manejarRegistro} className="registro-form">
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input 
                            type="text" 
                            placeholder="Tu nombre" 
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            placeholder="correo@ejemplo.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Mínimo 10 caracteres" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Repite tu contraseña" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-registro" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'UNIRSE A NEXUS'}
                    </button>
                </form>

                {/* 4. Mostrar el mensaje de error si existe */}
                {error && (
                    <div className="error-box-nexus">
                        {error}
                    </div>
                )}

                <div className="registro-footer">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default Registro;