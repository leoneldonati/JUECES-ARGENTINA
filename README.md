# Tracker de Jueces y Magistrados de Argentina

Un sitio web moderno y transparente para consultar información pública de jueces y magistrados en Argentina.

Explora el listado completo, busca por nombre, provincia, cargo o juzgado y accede al detalle de cada magistrado con sus fallos más relevantes.

## ✨ Características

- **Búsqueda y filtrado en tiempo real** por nombre, provincia, cargo y juzgado
- **Paginación** eficiente en el listado principal
- **Página de detalle** por magistrado (identificado por DNI)
- Información clave: cargo, órgano, jurisdicción, provincia, fecha de jura, género, estado, etc.
- **Sección de fallos relevantes**: liberaciones, sobreseimientos, absoluciones, declaraciones de inconstitucionalidad y oposiciones a reformas
- Diseño moderno, totalmente responsive y accesible
- Generación estática (SSG) con excelente rendimiento
- HTML semántico y buenas prácticas de accesibilidad

## 🛠 Tecnologías

- **[Astro](https://astro.build)** — Framework principal
- **Tailwind CSS** — Estilos
- **TypeScript** — Tipado
- **React + TanStack Table** — Tabla avanzada (opcional)
- Datos en **JSON** (generados en build)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/JUECES-ARGENTINA.git
cd tracker-jueces-argentina

# 2. Instalar dependencias
npm install
# o
pnpm install
# o
yarn install

# 3. Ejecutar en desarrollo
npm run dev

# 4. Construir para producción
npm run build
```

> La versión estática se generará en la carpeta dist/.

## 📊 Datos

> magistrados.json — Información básica de cada juez/magistrado
> fallos.json — Fallos relevantes organizados por DNI:

```JSON
{
  "byDni": {
    "12345678": [
      {
        "fecha": "2024-03-15",
        "titulo": "Título del fallo",
        "resumen": "Resumen objetivo y neutral...",
        "tipo": "liberacion | sobreseimiento | inconstitucionalidad | oposicion_reforma | absolucion",
        "link": "https://...",
        "fuente": "SAIJ | CSJN | ..."
      }
    ]
  }
}
```

Los datos provienen exclusivamente de fuentes públicas del Poder Judicial de la Nación y el Consejo de la Magistratura.
