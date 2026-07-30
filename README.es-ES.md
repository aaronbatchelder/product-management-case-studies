

# Casos de Estudio de Producto

Una base de datos consultable de casos de estudio de gestión de producto que cubre crecimiento, lanzamientos, precios, pivots y más.

**Sitio en vivo**: [productcasestudies.com](https://productcasestudies.com)

## Características

- **Base de datos consultable** - Búsqueda de texto completo con Fuse.js
- **Filtrado por categoría** - Explora por tema (Crecimiento, Precios, Pivots, etc.)
- **Filtrado por formato** - Filtra por artículo, video, PDF, podcast o presentaciones
- **Optimizado para SEO** - Datos estructurados, mapa del sitio, etiquetas Open Graph
- **Amigable con IA** - llms.txt, API JSON, integración con servidor MCP
- **Rápido** - Generación de sitios estáticos con Next.js

## Stack Tecnológico

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Fuse.js (búsqueda)
- Vercel Analytics
- Protocolo de Contexto de Modelo (MCP)

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Importar casos de estudio desde CSV
npm run import-csv -- path/to/data.csv
```

## Esquema de Datos

Los casos de estudio se almacenan en `src/data/case-studies.json`:

```typescript
interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  description: string;
  datePublished: string;
  source: string;
  format: "article" | "video" | "pdf" | "podcast" | "slides";
  company: string;
  createdAt: string;
}
```

## Categorías

- Crecimiento y Adquisición
- Lanzamiento de Producto
- Precios y Monetización
- Estrategia de Plataforma
- Investigación de Usuarios
- Pivots
- Diseño y UX
- Cultura de Ingeniería
- Post-Mortems de Startups
- Escalabilidad

## Integración con MCP

Conéctate a Claude, Cursor u otras herramientas de IA a través del Protocolo de Contexto de Modelo:

```bash
npx productcasestudies-mcp
```

Consulta [/mcp](https://productcasestudies.com/mcp) para las instrucciones de configuración.

## Cómo Contribuir

1. Haz un fork del repositorio
2. Agrega casos de estudio a `src/data/case-studies.json` (o utiliza el script de importación CSV)
3. Envía una pull request

**Formato CSV:**
```
title,url,category,description,datePublished,source,format,company,tags
```

## API

- `/api/case-studies.json` - Todos los casos de estudio
- `/api/categories.json` - Categorías con conteos
- `/llms.txt` - Resumen del sitio amigable para IA

## Hoja de Ruta / Pendiente

- [ ] **Suscripciones por correo** - Suscríbete a nuevos casos de estudio por categoría
- [ ] **Boletín informativo** - Resumen semanal de nuevos casos de estudio
- [ ] **Panel de analítica** - Seguimiento de búsquedas populares, categorías y casos de estudio
- [ ] **Cuentas de usuario** - Guardar favoritos e historial de lectura
- [ ] **Comentarios/discusiones** - Perspectivas de la comunidad sobre los casos de estudio
- [ ] **Más resúmenes** - Resúmenes generados por IA para los casos de estudio restantes

## Licencia

MIT

## Contacto

- Twitter: [@aaronbatcheldr](https://twitter.com/aaronbatcheldr)
- Correo electrónico: aaronmb7@gmail.com
