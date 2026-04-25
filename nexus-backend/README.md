# NEXUS — Backend

Backend del aplicativo educativo NEXUS desarrollado con Django REST Framework.

## Stack tecnológico

- Python 3.13
- Django 4.2
- Django REST Framework
- PostgreSQL 15
- JWT Authentication (djangorestframework-simplejwt)
- django-cors-headers

## Requisitos previos

- Python 3.10 o superior
- PostgreSQL 15 instalado y corriendo
- Git

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Marianao18/Nexus-Backend.git
cd Nexus-Backend
```

### 2. Crear el entorno virtual
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Crear el archivo .env

Crea un archivo `.env` en la raíz del proyecto con estas variables:
```
SECRET_KEY=nexus-clave-super-secreta-cambia-esto
DEBUG=True
DB_NAME=nexus_db
DB_USER=nexus_user
DB_PASSWORD=tu_password_de_postgres
DB_HOST=localhost
DB_PORT=5432
```

### 5. Crear la base de datos en PostgreSQL

Abre pgAdmin o psql y ejecuta:
```sql
CREATE DATABASE nexus_db;
CREATE USER nexus_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE nexus_db TO nexus_user;
GRANT ALL ON SCHEMA public TO nexus_user;
```

### 6. Aplicar migraciones
```bash
python manage.py migrate
```

### 7. Crear superusuario administrador
```bash
python manage.py createsuperuser
```

### 8. Arrancar el servidor
```bash
python manage.py runserver
```

El backend corre en `http://localhost:8000`

## Endpoints disponibles

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | /api/registrar-estudiante/ | Público | Registro de estudiantes |
| POST | /api/login/ | Público | Inicio de sesión |
| GET | /api/perfil/ | JWT requerido | Datos del usuario autenticado |
| POST | /api/solicitud-docente/ | Público | Enviar solicitud para ser docente |
| GET | /api/admin/solicitudes/ | Solo admin | Ver solicitudes pendientes |
| POST | /api/admin/aprobar-docente/{id}/ | Solo admin | Aprobar solicitud de docente |
| POST | /api/admin/rechazar-docente/{id}/ | Solo admin | Rechazar solicitud de docente |
| POST |/api/password-reset/ | Público | Solicitar recuperación de clave (envía email) |
| POST |/api/confirmar-password/ | Público | Establecer nueva clave con UID y Token |

## Estructura del proyecto
```
nexus-backend/
├── apps/
│   ├── usuarios/       # Registro, login, JWT
│   └── solicitudes/    # Flujo de solicitudes de docentes
|   └── solicitudes/    # Flujo de docentes y Recuperación de Contraseña (NUEVO)
├── nexus/              # Configuración global Django
├── manage.py
├── requirements.txt
└── .env                # No incluido en el repositorio
```

## Roles de usuario

| Rol | Cómo se crea | Acceso |
|-----|-------------|--------|
| Estudiante | Formulario /registro | Landing Page |
| Docente | Solicitud aprobada por admin | Landing Page |
| Administrador | python manage.py createsuperuser | Panel Admin |

