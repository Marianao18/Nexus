

import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
/**
 * Cierra la sesión correctamente:
 * 1. Invalida el refresh token en el servidor (blacklist)
 * 2. Limpia el localStorage
 * 3. Dispara el evento authChange para que App.jsx actualice el estado
 * 4. Redirige al /login
 */
export const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const accessToken  = localStorage.getItem('access_token');

    // Intentar invalidar el token en el servidor
    if (refreshToken && accessToken) {
        try {
            await axios.post(
                `${API_URL}/logout/`,
                { refresh: refreshToken },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
        } catch (error) {
            // Si falla (token ya expirado, sin conexión, etc.)
            // igual procedemos a limpiar el cliente
            console.warn('Logout backend error (ignorado):', error?.response?.status);
        }
    }

    // Limpiar todo el localStorage
    localStorage.clear();

    // Notificar a App.jsx para que actualice userRole
    window.dispatchEvent(new Event('authChange'));

    // Redirigir al login
    window.location.href = '/login';
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const getUserRole     = () => localStorage.getItem('rol');
export const getUserName     = () => localStorage.getItem('userName');
export const isAuthenticated = () => !!localStorage.getItem('access_token');

// ─── INTERCEPTOR AXIOS ────────────────────────────────────────────────────────
/**
 * Configura un interceptor global en axios que:
 * - Agrega el token JWT a todas las peticiones automáticamente
 * - Si el servidor responde 401 (token expirado/inválido), cierra sesión y
 *   redirige al login automáticamente
 *
 * Llamar UNA VEZ en el punto de entrada de la app (index.js o App.jsx):
 *   setupAxiosInterceptors();
 */
export const setupAxiosInterceptors = () => {
    // Request: agrega el token a cada petición
    axios.interceptors.request.use(
        (config) => {
            const token = getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response: detecta 401 y cierra sesión automáticamente
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // Evitar loop infinito en el propio endpoint de logout o login
            const isAuthEndpoint =
                originalRequest?.url?.includes('/logout/') ||
                originalRequest?.url?.includes('/login/');

            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !isAuthEndpoint
            ) {
                originalRequest._retry = true;
                console.warn('Token expirado o inválido. Cerrando sesión...');
                await logout();
            }

            return Promise.reject(error);
        }
    );
};
