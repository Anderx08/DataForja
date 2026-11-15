# DataForja

Plataforma web para aprender **Python, SQL y Power BI** con práctica real en el navegador, sin instalar nada.

- **36 lecciones** en tres rutas, cada una con: por qué importa, concepto, ejemplo de oficina, práctica comprobada automáticamente y reto rápido. Una lección se completa sola al superar su práctica y su reto.
- **77 ejercicios verificados**: Python se ejecuta con [Skulpt](https://skulpt.org), SQL sobre una base SQLite real ([sql.js](https://sql.js.org)) con cinco tablas, y DAX con un motor propio que implementa contexto de filtro, `CALCULATE`, `ALL`, `FILTER`, iteradores y más.
- **Repaso espaciado**: cada pregunta respondida entra en cajas de Leitner y vuelve a los 1, 3, 7, 14, 30 y 60 días. Las fallidas se repiten al final de la sesión.
- **Exámenes finales** por ruta: 15 preguntas nuevas y 2 tareas prácticas sin pistas, nota con aprobado al 70% y recomendación de lecciones según los errores.
- **Proyectos integradores**: dos casos de negocio que recorren SQL, Python y DAX sobre los mismos datos y terminan con el CSV y la lista de pasos para armar el panel en Power BI Desktop.
- **Tres laboratorios libres**: intérprete de Python, consola SQL con explorador de esquema y un Estudio DAX con segmentadores, medidas editables y constructor de visuales.
- **Chuletas de referencia** por ruta, plan de 10 semanas, reto diario, puntos de experiencia, rachas e insignias. El progreso se guarda en el navegador.

## Ver en línea

La página se publica con GitHub Pages desde la rama `main`: **<https://anderx08.github.io/DataForja/>**

## Ejecutar en local

Cualquier servidor estático sirve (hace falta servidor por el archivo `.wasm` de SQLite):

```bash
python -m http.server 8765
```

y abre <http://localhost:8765>.

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Página, estilos y estructura |
| `app.js` | Enrutador, lecciones, verificador de prácticas, repaso, exámenes, proyectos, laboratorios y gráficos |
| `content.js` | Lecciones base de las tres rutas, retos diarios, plan e insignias |
| `content-extra.js` | Ejercicios extra, lecciones avanzadas y chuletas |
| `content-learn.js` | Exámenes finales, proyectos integradores e insignias de evaluación |
| `sqldb.js` | Base de datos de práctica (esquema y datos deterministas) |
| `dax.js` | Motor DAX didáctico |
| `sql-wasm.wasm` | SQLite compilado a WebAssembly (sql.js 1.10.3) |

`build.sh` genera `artifact.html` (la página sin el envoltorio HTML) para publicarla como artefacto de Claude.

## Licencia

MIT para el código de este repositorio. Skulpt y sql.js conservan sus propias licencias.
