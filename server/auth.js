const bcrypt = require('bcrypt');
const db = require('./db.js'); // Usamos tu conexión central

async function verificarLogin(email, passwordIngresada) {
    try {
        // Buscamos al usuario usando la conexión de db.js
        const res = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (res.rows.length > 0) {
            const usuario = res.rows[0];
            
            // Log para que veas en la terminal que sí lo encontró
            console.log("Usuario encontrado en DB:", usuario.email);
        
            // Comparamos la clave escrita con el hash de la base de datos
            const coinciden = await bcrypt.compare(passwordIngresada, usuario.password_hash);
            
            if (coinciden) {
                console.log(` Acceso concedido: ${usuario.nombre}`);
                return usuario;
            } else {
                console.log(" La contraseña no coincide con el hash.");
            }
        } else {
            console.log("No existe ningún usuario con ese email.");
        }
        
        return null;
    } catch (err) {
        console.error("Error en la autenticación:", err);
        throw err;
    }
}

async function cifrarPassword(passwordPlana) {
    const saltRounds = 10;
    return await bcrypt.hash(passwordPlana, saltRounds);
}

// Exportamos solo las funciones, ya que 'db' se maneja por separado
module.exports = { verificarLogin, cifrarPassword };