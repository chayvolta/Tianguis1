# Geoportal Acapulco Histórico - React + Tailwind

Aplicación web moderna para explorar sitios históricos de Acapulco mediante un mapa interactivo 3D con timeline y fichas detalladas.

## 🏗️ Arquitectura

Este proyecto ha sido construido siguiendo las mejores prácticas de ingeniería de software:

### Principios Aplicados

- **Separación de Responsabilidades**: Componentes, hooks, utilidades y contexto en carpetas separadas
- **DRY (Don't Repeat Yourself)**: Lógica reutilizable en funciones y hooks personalizados
- **Composición sobre Herencia**: Componentes componibles y reutilizables
- **Single Source of Truth**: Constantes centralizadas y Context API para estado global
- **Fail Fast**: Error Boundary para manejo robusto de errores
- **Performance Optimization**: React.memo, useMemo, useCallback

### Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ErrorBoundary.jsx
│   ├── Header.jsx
│   ├── Timeline.jsx
│   ├── TimelineItem.jsx
│   ├── DetailCard.jsx
│   ├── Map.jsx
│   ├── MapControls.jsx
│   └── BasemapControls.jsx
├── hooks/              # Custom hooks
│   ├── useGeoJSON.js
│   └── useHashState.js
├── utils/              # Funciones utilitarias
│   └── index.js
├── constants/          # Constantes de configuración
│   └── index.js
├── context/            # Context API
│   └── AppContext.jsx
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos Tailwind
```

## 🎨 Tecnologías

- **React 18** - Librería UI con hooks modernos
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework CSS utility-first
- **MapLibre GL JS** - Mapas 3D de alto rendimiento
- **PropTypes** - Validación de props

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## ✨ Características

### Funcionalidades

- ✅ **Mapa 3D interactivo** con terreno real (pitch/bearing)
- ✅ **Timeline** de sitios históricos agrupados por categoría
- ✅ **Fichas detalladas** con imágenes y enlaces
- ✅ **Cambio de mapas base** (satélite vs. calles)
- ✅ **Navegación animada** (flyTo) al seleccionar sitios
- ✅ **Deep linking** (#site=ID) para compartir ubicaciones
- ✅ **Responsive** - funciona en móvil, tablet y desktop

### Accesibilidad

- ARIA labels en todos los componentes interactivos
- Navegación por teclado (Enter, Escape)
- Soporte para prefers-reduced-motion
- Contraste y tamaños de fuente optimizados

### Performance

- React.memo en componentes de lista
- useMemo para cálculos costosos
- useCallback para funciones estables
- Lazy loading de imágenes

## 📊 Datos

Los datos de sitios históricos se cargan desde `/public/data/sitios.geojson` (formato GeoJSON).

Estructura de propiedades:

- `name` / `Nombre` - Nombre del sitio
- `folders` - Categoría/carpeta del sitio
- `description` - Descripción (opcional)
- `altitude` - Elevación (opcional)

## 🎨 Personalización

### Colores FONATUR

Los colores del tema están definidos en `tailwind.config.js`:

```javascript
colors: {
  primary: '#118C8C',
  'primary-light': '#14a8a8',
  accent: '#00cfcf',
  fonatur: {
    beige: '#F2E9D8',
    red: '#e6281aff',
  }
}
```

### Configuración del Mapa

Edita `/src/constants/index.js` para ajustar:

- Centro inicial del mapa
- Zoom, pitch, bearing predeterminados
- Exageración del terreno
- Duración de animaciones

## 📝 Mejores Prácticas Implementadas

1. **Error Boundary**: Captura errores de React y muestra UI de fallback
2. **Context API**: Estado global sin prop drilling
3. **Custom Hooks**: Lógica reutilizable (useGeoJSON, useHashState)
4. **PropTypes**: Validación de tipos en desarrollo
5. **Constants**: Configuración centralizada
6. **Utils**: Funciones puras y reutilizables
7. **Separation of Concerns**: Cada módulo tiene una responsabilidad única
8. **Accessibility**: Siguiendo WCAG guidelines

## 🔄 Comparación con Versión Vanilla

| Aspecto        | Vanilla JS              | React + Tailwind          |
| -------------- | ----------------------- | ------------------------- |
| Archivos       | 3 (HTML, CSS, JS)       | 15+ componentes modulares |
| Estado         | Variables globales      | Context API + hooks       |
| Estilos        | CSS manual (400 líneas) | Tailwind utilities        |
| Reusabilidad   | Baja                    | Alta (componentes)        |
| Testing        | Difícil                 | Fácil (unit tests)        |
| Mantenibilidad | Media                   | Alta                      |
| Performance    | Buena                   | Optimizada (memo)         |
| Type Safety    | No                      | PropTypes                 |
| Escalabilidad  | Limitada                | Excelente                 |

## 📦 Dependencias Principales

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "maplibre-gl": "^5.0.1",
  "prop-types": "^15.8.1",
  "tailwindcss": "^4.1.18"
}
```

## 🧪 Próximos Pasos Sugeridos

- [ ] Agregar tests unitarios (Vitest + React Testing Library)
- [ ] Implementar TypeScript para mayor seguridad de tipos
- [ ] Agregar internacionalización (i18n)
- [ ] Optimizar bundle size con code splitting
- [ ] Agregar PWA support para offline
- [ ] Implementar búsqueda/filtrado de sitios
- [ ] Agregar más datos a las fichas (fechas, fuentes históricas)

## 📄 Licencia

Proyecto desarrollado para FONATUR - Fomento Nacional de Turismo

---

**Nota**: Esta aplicación mantiene la misma apariencia visual que la versión vanilla pero con una arquitectura moderna y escalable.
