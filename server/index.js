const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const db = require('./db.js');
const { cifrarPassword, verificarLogin } = require('./auth.js');

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: '', //Tu correo electronico
        pass: '' //Poner contraseña de google
    },
    tls: {
        rejectUnauthorized: false 
    }
});

transporter.verify((error) => {
    if (error) console.log(" Error en correos:", error.message);
    else console.log(" Sistema de correos NEXUS listo.");
});


app.post('/api/login', async (req, res) => {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password;

    try {
        const usuario = await verificarLogin(email, password);
        if (usuario) {
            res.json({
                mensaje: "Login exitoso",
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,
                    requiereCambio: usuario.requiere_cambio_pass
                }
            });
        } else {
            res.status(401).json({ error: "Credenciales incorrectas" });
        }
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error en el servidor durante el login" });
    }
});

app.post('/api/registrar-estudiante', async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const existe = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (existe.rows.length > 0) return res.status(400).json({ error: "Este correo ya está registrado." });

        const passwordHash = await cifrarPassword(password);
        await db.query(
            'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)', 
            [nombre, email, passwordHash, 'estudiante']
        );
        res.status(201).json({ mensaje: "¡Usuario registrado exitosamente!" });
    } catch (err) {
        res.status(500).json({ error: "Error interno al procesar el registro." });
    }
});


app.post('/api/solicitud-docente', async (req, res) => {
    const { nombre_completo, email, especialidad, link_certificacion, mensaje_motivacion } = req.body;
    try {
        const previa = await db.query('SELECT * FROM solicitudes_profesores WHERE email = $1', [email]);
        if (previa.rows.length > 0) return res.status(400).json({ error: "Ya existe una solicitud pendiente." });

        await db.query(
            `INSERT INTO solicitudes_profesores (nombre_completo, email, especialidad, link_certificacion, mensaje_motivacion) VALUES ($1, $2, $3, $4, $5)`,
            [nombre_completo, email, especialidad, link_certificacion, mensaje_motivacion]
        );
        res.status(201).json({ mensaje: " Solicitud enviada con éxito." });
    } catch (err) {
        res.status(500).json({ error: "Error al procesar la solicitud." });
    }
});

app.get('/api/admin/solicitudes', async (req, res) => {
    try {
        const resultado = await db.query('SELECT * FROM solicitudes_profesores ORDER BY fecha_solicitud DESC');
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar solicitudes." });
    }
});

app.post('/api/admin/aprobar-docente/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const solicitudRes = await db.query('SELECT * FROM solicitudes_profesores WHERE id = $1', [id]);
        if (solicitudRes.rows.length === 0) return res.status(404).json({ error: "La solicitud no existe." });

        const sol = solicitudRes.rows[0];
        const passTemporal = 'NexusDocente2026!';
        
        const usuarioExistente = await db.query('SELECT * FROM usuarios WHERE email = $1', [sol.email]);

        if (usuarioExistente.rows.length > 0) {
    
            await db.query(
                'UPDATE usuarios SET rol = $1, requiere_cambio_pass = $2 WHERE email = $3',
                ['docente', true, sol.email]
            );
        } else {
            const passHash = await cifrarPassword(passTemporal);
            await db.query(
                'INSERT INTO usuarios (nombre, email, password_hash, rol, requiere_cambio_pass) VALUES ($1, $2, $3, $4, $5)',
                [sol.nombre_completo, sol.email, passHash, 'docente', true]
            );
        }


        const mailOptions = {
            from: '"NEXUS Learning" <linacastrillon05@gmail.com>',
            to: sol.email,
            subject: '¡Bienvenido a NEXUS! - Solicitud Aprobada',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #00e5ff;">
                    <h2>Hola ${sol.nombre_completo}, tu solicitud fue aprobada.</h2>
                    <p>Ahora tienes permisos de <b>Docente</b>.</p>
                    <p>Usa tu correo y la clave temporal: <b>${passTemporal}</b> (o tu clave actual si ya tenías cuenta).</p>
                </div>`
        };
        await transporter.sendMail(mailOptions);

        // 3. LIMPIAR SOLICITUD
        await db.query('DELETE FROM solicitudes_profesores WHERE id = $1', [id]);

        res.json({ mensaje: ` ${sol.nombre_completo} aprobado con éxito.` });

    } catch (err) {
        console.error("Error crítico:", err);
        res.status(500).json({ error: "Error en el servidor durante la aprobación." });
    }
});

app.listen(PORT, () => console.log(` Servidor NEXUS en puerto ${PORT}`));