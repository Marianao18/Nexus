# NEXUS — Beyond Control
 Plataforma educativa en TI para Medellín · Tecnológico de Antioquia

## Cómo ejecutar el proyecto

### Requisitos previos
- [Node.js](https://nodejs.org/) v16 o superior
- npm (viene incluido con Node.js)
- Visual Studio Code (recomendado)
- Nota: desarrollado con react.js

### Pasos para iniciar

```bash
# 1. Instala las dependencias
npm install

# 2. Inicia el servidor de desarrollo
npm start

# 3. Instalar librerías de servidor y base de datos
npm install express cors pg

# 4. Instalar librerías de seguridad y variables de entorno
npm install bcrypt dotenv

# 5. Instalar librería para envío de correos
npm install nodemailer

```

Para que el sistema envíe correos, Gmail requiere una "Contraseña de Aplicación", no tu clave normal:

1.Activar: Ve a tu cuenta de Google > Seguridad > Verificación en 2 pasos (debe estar activa).

2.Generar: Busca "Contraseñas de aplicaciones" en Google, crea una con el nombre "NEXUS" y copia el código de 16 letras.

Ruta server>Index.js>    user: '', //Tu correo electronico
                         pass: '' //Poner contraseña de google

3.Configurar: En tu archivo .env,cambiar nombre .env.example por .env añade los datos:

DB_USER=postgres
DB_PASS=tu_contraseña_de_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexus_db

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Estructura del proyecto

```
NEXUS-MAIN/
├── server/
│   ├── auth.js             # Lógica de cifrado (bcrypt) y validación de sesiones
│   ├── db.js               # Configuración de conexión a PostgreSQL
│   ├── index.js            # Servidor Express, rutas de API y puerto 5000
│   ├── .env                # Variables de entorno privadas (Base de datos y Gmail)
│   └── .env.example        # Plantilla de variables de entorno para colaboradores
├── src/
│   ├── components/
│   │   ├── Background.jsx  # Fondo con Grid + blobs decorativos animados
│   │   ├── Background.css  # Estilos y animaciones del fondo visual
│   │   ├── Navbar.jsx      # Barra de navegación superior con logo y accesos
│   │   ├── Navbar.css      # Diseño de la barra y efectos de vidrio (glassmorphism)
│   │   ├── Hero.jsx        # Sección de impacto con título y mensaje principal
│   │   ├── Hero.css        # Estilos de tipografía y espaciado de bienvenida
│   │   ├── Login.jsx       # Formulario de acceso con conexión al servidor
│   │   ├── Login.css       # Diseño del panel de inicio de sesión
│   │   ├── Registro.jsx    # Formulario de creación de cuenta con validaciones
│   │   ├── Registro.css    # Estilos de inputs y botones de registro
│   │   ├── Terminal.jsx    # Simulación de consola de comandos con mensajes de IA
│   │   ├── Terminal.css    # Estilo retro/futurista de la ventana de comandos
│   │   ├── Stats.jsx       # Fila con contadores y métricas del sistema
│   │   ├── Stats.css       # Diseño de las tarjetas de estadísticas
│   │   ├── Features.jsx    # Grid con las funcionalidades clave de la plataforma
│   │   ├── Features.css    # Estilos del tablero de funcionalidades
│   │   ├── Rutas.jsx       # Sección de rutas de aprendizaje (pills interactivas)
│   │   ├── Rutas.css       # Diseño de etiquetas y botones de navegación
│   │   ├── CtaBanner.jsx   # Banner inferior para invitaciones al registro
│   │   ├── CtaBanner.css   # Colores y efectos del llamado a la acción
│   │   ├── Footer.jsx      # Pie de página con créditos y enlaces sociales
│   │   └── Footer.css      # Estilos de la sección final de la página
│   ├── App.jsx             # Componente raíz y gestión de rutas (React Router)
│   ├── index.js            # Punto de entrada principal de React hacia el DOM
│   └── index.css           # Estilos globales, variables de color y fuentes base
├── public/
│   └── index.html          # Documento HTML base de la aplicación
├── package.json            # Registro de dependencias (Express, Axios, Bcrypt, etc.)
└── README.md               # Manual de instrucciones y documentación del proyecto
```

## Paleta de colores

| Variable            | Valor     | Uso                        |
|---------------------|-----------|----------------------------|
| `--accent-cyan`     | `#00E5FF` | Acento principal / tech    |
| `--accent-lime`     | `#A3FF4F` | Aprendizaje / acceso libre |
| `--accent-purple`   | `#7B5CFA` | IA / personalización       |
| `--accent-orange`   | `#FF6B35` | Datos / dinamismo          |
| `--bg-deep`         | `#060B14` | Fondo profundo             |

# Nexus
