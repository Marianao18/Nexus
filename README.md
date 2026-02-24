# NEXUS — Beyond Control
> Plataforma educativa en TI para Medellín · Tecnológico de Antioquia

## 🚀 Cómo ejecutar el proyecto

### Requisitos previos
- [Node.js](https://nodejs.org/) v16 o superior
- npm (viene incluido con Node.js)
- Visual Studio Code (recomendado)

### Pasos para iniciar

```bash
# 1. Instala las dependencias
npm install

# 2. Inicia el servidor de desarrollo
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del proyecto

```
nexus-app/
├── public/
│   └── index.html          # HTML base
├── src/
│   ├── components/
│   │   ├── Background.jsx  # Grid + blobs decorativos
│   │   ├── Navbar.jsx      # Barra de navegación
│   │   ├── Hero.jsx        # Sección principal
│   │   ├── Terminal.jsx    # Terminal flotante del asistente IA
│   │   ├── Stats.jsx       # Fila de estadísticas
│   │   ├── Features.jsx    # Grid de funcionalidades
│   │   ├── Rutas.jsx       # Pills de rutas de aprendizaje
│   │   ├── CtaBanner.jsx   # Banner de llamada a la acción
│   │   └── Footer.jsx      # Pie de página
│   ├── App.jsx             # Componente raíz
│   ├── index.js            # Punto de entrada React
│   └── index.css           # Variables CSS + estilos globales
└── package.json
```

## 🎨 Paleta de colores

| Variable            | Valor     | Uso                        |
|---------------------|-----------|----------------------------|
| `--accent-cyan`     | `#00E5FF` | Acento principal / tech    |
| `--accent-lime`     | `#A3FF4F` | Aprendizaje / acceso libre |
| `--accent-purple`   | `#7B5CFA` | IA / personalización       |
| `--accent-orange`   | `#FF6B35` | Datos / dinamismo          |
| `--bg-deep`         | `#060B14` | Fondo profundo             |

## 🔧 Extensiones VSCode recomendadas

- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **CSS Modules**
- **Auto Rename Tag**
# Nexus
