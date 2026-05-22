# ============================================================
#  Dockerfile del FRONTEND (React)  ->  va en Nexus-main/
#  Build en 2 etapas: compila React y lo sirve con nginx
# ============================================================

# ---------- Etapa 1: build de React ----------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# La URL del backend se inyecta en build-time.
# En produccion apuntamos a /api (mismo dominio, nginx hace de proxy).
ENV REACT_APP_API_URL=/api
RUN npm run build

# ---------- Etapa 2: servir con nginx ----------
FROM nginx:1.27-alpine

# Copiamos el build de React al directorio que sirve nginx
COPY --from=build /app/build /usr/share/nginx/html

# Nuestra config de nginx (hace proxy de /api hacia el backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
