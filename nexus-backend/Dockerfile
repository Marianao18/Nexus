# ============================================================
#  Dockerfile del BACKEND (Django)  ->  va en nexus-backend/
# ============================================================
FROM python:3.11-slim

# Evita prompts y archivos .pyc, fuerza logs sin buffer
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Dependencias del sistema para psycopg2 y Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalamos dependencias primero (mejor cache de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Servidor de produccion (no usamos runserver en prod)
RUN pip install --no-cache-dir gunicorn

# Copiamos el codigo del backend
COPY . .

# Recolecta los archivos estaticos de Django (admin, etc.)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Arranca migraciones y luego gunicorn.
# 'nexus.wsgi' viene de tu carpeta nexus/wsgi.py
CMD python manage.py migrate --noinput && \
    gunicorn nexus.wsgi:application --bind 0.0.0.0:8000 --workers 3
