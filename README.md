# DataForja

Plataforma web para aprender **Python, SQL, Power BI y estadística aplicada** con práctica real en el navegador, sin instalar nada.

**Ver en línea:** <https://anderx08.github.io/DataForja/>

## Qué incluye

- **49 lecciones en cuatro rutas.** Cada una tiene: por qué importa, una guía "Cómo se usa" (sintaxis desglosada, cuándo usarla, cómo se lee y un antes/después con datos reales), ejemplos ejecutables, práctica comprobada y un reto rápido. La lección se completa sola al superar su práctica y su reto.
- **225 ejercicios comprobados automáticamente**, de varios tipos: escribir código, encontrar el error, predecir el resultado sin ejecutar y transformar datos en Power Query.
- **Motores reales en el navegador:**
  - Python básico con [Skulpt](https://skulpt.org) y Python completo con pandas y matplotlib vía [Pyodide](https://pyodide.org), que se carga solo cuando hace falta.
  - SQLite real ([sql.js](https://sql.js.org)) con tres bases: una distribuidora (la principal), RRHH e inventario, estas dos con datos sucios a propósito.
  - Un motor DAX propio con modelo en estrella (Ventas, Calendario, Productos, Regiones, Vendedores), contexto de filtro y de fila, `CALCULATE`, `ALL`, `FILTER`, `RELATED`, iteradores, inteligencia de tiempo (`DATESYTD`, `SAMEPERIODLASTYEAR`, `DATEADD`, `TOTALYTD`) y `VAR`/`RETURN`.
  - Un simulador de Power Query con pasos aplicados y el código M que generan.
- **Base de datos siempre visible:** diagrama, qué guarda cada columna, filas de ejemplo y la forma del resultado esperado en cada ejercicio.
- **Repaso espaciado** con cajas de Leitner (1, 3, 7, 14, 30 y 60 días).
- **Exámenes finales** de Python, SQL y Power BI, con nota, errores explicados y lecciones recomendadas.
- **Cinco proyectos integradores**, entre ellos un caso final de portafolio: SQL, pandas y DAX sobre los mismos datos y un panel en Power BI Desktop.
- **Guía para Power BI Desktop** con archivos descargables y números de control.
- **Herramientas de estudio:** buscador global (tecla `/`), glosario, chuletas, laboratorios libres, plan de 13 semanas, reto diario, insignias, certificados por ruta y exportar e importar el progreso.

El progreso se guarda en el navegador; se puede exportar como archivo para llevarlo a otro equipo.

## Ejecutar en local

Cualquier servidor estático sirve (hace falta servidor por el archivo `.wasm` de SQLite):

```bash
python -m http.server 8765
```

y abre <http://localhost:8765>. Las lecciones de pandas necesitan internet la primera vez para descargar Python completo (unos 20 MB).

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Página, estilos y estructura |
| `app.js` | Enrutador, lecciones, verificador de ejercicios, repaso, exámenes, proyectos, laboratorios, buscador, glosario y certificados |
| `content.js` | Lecciones base, retos diarios, plan e insignias |
| `content-extra.js` | Ejercicios extra, lecciones avanzadas y chuletas |
| `content-learn.js` | Exámenes finales y los dos primeros proyectos |
| `content-sql.js` | Documentación de la base, lección inicial de SQL, guías, paso a paso y errores comunes |
| `content-guides.js` | Guías "Cómo se usa" de Python y Power BI |
| `content-stage1.js` | Lecciones de pandas y matplotlib, ejercicios de Power Query, modelo y tiempo en DAX, guía de Desktop |
| `content-stage2.js` | Limpieza de datos, otros negocios, ejercicios de predecir y depurar, tres proyectos más |
| `content-stage3.js` | Ruta de estadística, SQL en otros motores y glosario |
| `sqldb.js` / `sqldbs.js` | Bases de datos de práctica (deterministas) |
| `dax.js` | Motor DAX didáctico |
| `pq.js` | Simulador de Power Query |
| `sql-wasm.wasm` | SQLite compilado a WebAssembly (sql.js 1.10.3) |

`build.sh` genera `artifact.html` (la página sin el envoltorio HTML) para publicarla como artefacto de Claude. En esa vista, las lecciones de pandas no pueden descargar Python completo; funcionan en la versión de GitHub Pages.

## Licencia

MIT para el código de este repositorio. Skulpt, sql.js y Pyodide conservan sus propias licencias.
