# NEXUS — Beyond Control
### Plataforma Educativa en TI · Medellín, Colombia · 2026 - prueba aws

![NEXUS](https://img.shields.io/badge/NEXUS-Beyond%20Control-00E5FF?style=for-the-badge&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 📌 Descripción

NEXUS es una plataforma educativa que centraliza el conocimiento en desarrollo de software para estudiantes técnicos, tecnológicos y profesionales de Medellín. Ofrece rutas de aprendizaje, microlearning e IA que se adapta al estudiante.

---

## 🗂️ Estructura del Proyecto

```
Nexus-integrado/
├── nexus-backend/          # API REST con Django
└── Nexus-main/             # Frontend con React
```

---

## ⚙️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + React Router v6 |
| Backend | Django 4.2 + Django REST Framework |
| Base de datos | PostgreSQL 15 |
| Autenticación | JWT (SimpleJWT) |
| Estilos | CSS Modules + CSS Variables |
| HTTP Client | Axios |

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 15
- Git

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/nexus-integrado.git
cd nexus-integrado
```

---

### 2. Backend — Django

#### Crear y activar entorno virtual

```bash
cd nexus-backend

# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

#### Instalar dependencias

```bash
pip install -r requirements.txt
```

#### Configurar variables de entorno

Crea un archivo `.env` en `nexus-backend/` basándote en `.envejemplo`:

```env
SECRET_KEY=django-secret-key-nexus-2026
DEBUG=True

DB_NAME=nexus_db
DB_USER=nexus_user
DB_PASSWORD=nexus_pass
DB_HOST=localhost
DB_PORT=5432

EMAIL_HOST_USER=tu_correo@gmail.com
EMAIL_HOST_PASSWORD=tu_app_password
```

#### Crear la base de datos en PostgreSQL

```sql
CREATE DATABASE nexus_db;
CREATE USER nexus_user WITH PASSWORD 'nexus_pass';
GRANT ALL PRIVILEGES ON DATABASE nexus_db TO nexus_user;
```

#### Aplicar migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

#### Crear superusuario administrador

```bash
python manage.py createsuperuser
```

#### Correr el servidor

```bash
python manage.py runserver
```

El backend queda disponible en `http://localhost:8000`

---

### 3. Frontend — React

Abre una **nueva terminal**:

```bash
cd Nexus-main

# Instalar dependencias
npm install

# Correr la app
npm start
```

El frontend queda disponible en `http://localhost:3000`

> El `package.json` incluye `"proxy": "http://localhost:8000"` para redirigir las llamadas `/api/` al backend automáticamente.

---

## 👥 Roles y Flujos

### 🔐 Admin
- Inicia sesión con las credenciales del superusuario
- Aprueba o rechaza solicitudes de docentes
- Crea cursos y los asigna a docentes registrados
- Gestiona usuarios (estudiantes y docentes)

### 👨‍🏫 Docente
- Se registra desde la landing page (`/ser-docente`)
- Tras ser aprobado por el admin puede iniciar sesión
- Ve los cursos que le fueron asignados
- Sube recursos (PDF, DOCX, XLSX, CSV) a sus cursos
- Ve el progreso de sus estudiantes por curso

### 🎓 Estudiante
- Se registra desde la landing page (`/registro`)
- Explora el catálogo de cursos disponibles
- Se inscribe en los cursos de su interés
- Hace seguimiento a su progreso y rutas de aprendizaje
- Interactúa con NEXIA, el asistente virtual de IA

---

## 🗺️ Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/login/` | Iniciar sesión |
| POST | `/api/logout/` | Cerrar sesión |
| POST | `/api/registrar-estudiante/` | Registro de estudiante |
| POST | `/api/solicitud-docente/` | Solicitud de registro docente |

### Admin
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/admin/solicitudes/` | Listar solicitudes de docentes |
| POST | `/api/admin/aprobar-docente/<id>/` | Aprobar docente |
| POST | `/api/admin/rechazar-docente/<id>/` | Rechazar docente |
| GET | `/api/admin/usuarios/` | Listar estudiantes y docentes |
| GET | `/api/admin/cursos/` | Listar todos los cursos |
| POST | `/api/admin/cursos/` | Crear un curso |
| PATCH | `/api/admin/cursos/<id>/` | Activar/desactivar curso |
| DELETE | `/api/admin/cursos/<id>/` | Eliminar curso |
| GET | `/api/admin/docentes/` | Listar docentes aprobados |

### Estudiante
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/estudiante/resumen/` | Métricas del dashboard |
| GET | `/api/estudiante/cursos/` | Mis cursos inscritos |
| GET | `/api/estudiante/rutas/` | Mis rutas activas |
| GET | `/api/estudiante/progreso/` | Progreso por curso |
| POST | `/api/cursos/catalogo/` | Catálogo de cursos disponibles |
| POST | `/api/cursos/inscribirse/` | Inscribirse en un curso |

### Docente
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/docente/resumen/` | Métricas del docente |
| GET | `/api/docente/cursos/` | Cursos asignados |
| GET | `/api/docente/cursos/<id>/estudiantes/` | Estudiantes por curso |
| GET | `/api/docente/cursos/<id>/recursos/` | Recursos del curso |
| POST | `/api/docente/cursos/<id>/recursos/` | Subir recurso |
| DELETE | `/api/docente/recursos/<id>/` | Eliminar recurso |

---

## 🗄️ Modelos de Base de Datos

```
Usuario          → Rol: admin / docente / estudiante
├── Solicitud    → Solicitudes de registro de docentes
├── Curso        → Cursos creados por el admin, asignados a docente
│   ├── Modulo       → Módulos del curso
│   └── Recurso      → Archivos subidos por el docente (PDF, DOCX, XLSX, CSV)
├── Inscripcion  → Relación estudiante ↔ curso
├── InscripcionRuta → Relación estudiante ↔ ruta
├── RutaAprendizaje → Agrupación de cursos
└── ModuloCompletado → Progreso del estudiante
```

---

## 📁 Estructura de Carpetas

### Backend
```
nexus-backend/
├── apps/
│   ├── usuarios/        # Registro, login, JWT, perfiles
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── serializers.py
│   ├── solicitudes/     # Solicitudes de docentes
│   │   ├── models.py
│   │   ├── views.py
│   │   └── urls.py
│   └── cursos/          # Cursos, módulos, inscripciones, recursos
│       ├── models.py
│       ├── views.py
│       ├── urls.py
│       └── serializers.py
├── nexus/
│   ├── settings.py
│   └── urls.py
├── media/               # Archivos subidos por docentes
├── requirements.txt
├── manage.py
└── .env
```

### Frontend
```
Nexus-main/
├── public/
└── src/
    ├── components/
    │   ├── HomeAdm.jsx          # Dashboard administrador
    │   ├── HomeDocente.jsx      # Dashboard docente
    │   ├── HomeEstudiante.jsx   # Dashboard estudiante
    │   ├── NexIA.jsx            # Asistente virtual IA
    │   ├── RutasPage.jsx        # Catálogo de rutas públicas
    │   ├── Login.jsx
    │   ├── Registro.jsx
    │   ├── SolicitudDocente.jsx
    │   ├── AdminSolicitudes.jsx
    │   ├── AdminUsuarios.jsx
    │   ├── Navbar.jsx
    │   ├── Hero.jsx
    │   └── ...
    ├── App.jsx
    └── index.js
```

---

## 🤖 NEXIA — Asistente Virtual

NEXIA es el asistente de IA integrado en el dashboard del estudiante. Actualmente responde con lógica basada en palabras clave sobre los cursos, progreso y recomendaciones de estudio.

**Próxima versión:** Integración con API de IA (Groq/Claude/OpenAI) para respuestas naturales con contexto real del estudiante.

---

## 🎨 Cursos Disponibles en NEXUS

| Curso | Tecnología | Nivel |
|---|---|---|
| Análisis de Datos con Power BI | Power BI | Básico → Avanzado |
| Análisis de Datos con Python | Python | Intermedio |
| Excel en Todos sus Niveles | Excel | Básico → Avanzado |
| Desarrollo con Java Spring Boot | Java | Intermedio → Avanzado |
| Desarrollo Backend con Django | Django | Básico → Avanzado |
| Bases de Datos con PostgreSQL | PostgreSQL | Básico → Avanzado |
| Bases de Datos con MongoDB | MongoDB | Básico → Intermedio |

---

## 🔒 Variables de Entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SECRET_KEY` | Clave secreta Django | `django-secret-key-...` |
| `DEBUG` | Modo debug | `True` |
| `DB_NAME` | Nombre de la BD | `nexus_db` |
| `DB_USER` | Usuario de la BD | `nexus_user` |
| `DB_PASSWORD` | Contraseña de la BD | `nexus_pass` |
| `DB_HOST` | Host de la BD | `localhost` |
| `DB_PORT` | Puerto de la BD | `5432` |
| `EMAIL_HOST_USER` | Correo para envíos | `tu@gmail.com` |
| `EMAIL_HOST_PASSWORD` | App password Gmail | `xxxx xxxx xxxx` |

---

## 🤝 Contribución

1. Haz fork del repositorio
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Desarrollado con 💙 por Mariana Y Lina · Tecnológico de Antioquia · Medellín, Colombia

---

<div align="center">
  <strong>NEX<span style="color:#00E5FF">US</span></strong> · Beyond Control · Medellín 2026
</div>
