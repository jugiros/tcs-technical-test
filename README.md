# TCS Technical Test — Productos Financieros

Aplicación frontend en Angular para la gestión de productos financieros de un banco (listado, búsqueda, paginación, creación, edición y eliminación), desarrollada como prueba técnica para el perfil **Senior** (funcionalidades F1 a F6 completas).

## Descripción

La aplicación consume una API REST local (`http://localhost:3002`) para:

- Listar y buscar productos financieros.
- Controlar la cantidad de registros mostrados (5 / 10 / 20).
- Crear un nuevo producto financiero, con validación de campos y verificación asíncrona de unicidad del `id` contra el backend.
- Editar un producto existente (con el campo `id` deshabilitado).
- Eliminar un producto mediante un modal de confirmación.

Toda la maquetación es a medida (sin frameworks de UI ni librerías de estilos), siguiendo los diseños provistos en el ejercicio (D1–D4).

## Tecnologías

- **Angular 22** — Componentes 100% *standalone* (sin `NgModule`), *zoneless*, `Signals`/`computed`, control de flujo nativo (`@if`/`@for`), `ChangeDetectionStrategy.OnPush`.
- **TypeScript 6**
- **RxJS** (interoperabilidad con Signals vía `@angular/core/rxjs-interop`)
- **Reactive Forms** (`NonNullableFormBuilder`) con validadores síncronos y asíncronos.
- **SCSS** puro (sin Bootstrap, Angular Material, Tailwind, etc.), con variables globales y convención BEM.
- **Jest** + `jest-preset-angular` para pruebas unitarias (`TestBed`).

## Requisitos previos

- [Node.js](https://nodejs.org/) 20.11+ o 22.x (recomendado: 22 LTS).
- [Angular CLI](https://angular.dev/tools/cli) 22.x (`npm install -g @angular/cli`).
- El backend local del ejercicio (`repo-interview-main`), ejecutándose en `http://localhost:3002`.

## Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd tcs-technical-test
```

## Levantar el backend local

Este frontend depende del backend Node.js provisto para el ejercicio técnico:

1. Descomprimir `repo-interview-main.zip` en una carpeta de tu elección.
2. Abrir una terminal en esa carpeta.
3. Instalar las dependencias:
   ```bash
   npm install
   ```
4. Levantar el servicio:
   ```bash
   npm run start:dev
   ```
5. El backend quedará disponible en `http://localhost:3002`.

> **Nota:** El frontend asume que el backend está corriendo en el puerto `3002`. Durante el desarrollo (`ng serve`), las peticiones a `/bp/*` se redirigen automáticamente a `http://localhost:3002` mediante el proxy configurado en `proxy.conf.json`, evitando problemas de CORS.

## Instalar dependencias del frontend

```bash
npm install
```

## Ejecutar la aplicación

Con el backend ya corriendo en el puerto `3002`:

```bash
npm start
```

La aplicación quedará disponible en `http://localhost:4200`.

## Ejecutar las pruebas unitarias

```bash
npm test
```

Para ejecutar las pruebas con reporte de cobertura (mínimo exigido: 70%):

```bash
npm run test:coverage
```

Para ejecutar las pruebas en modo observación (*watch*):

```bash
npm run test:watch
```

## Compilar para producción

```bash
npm run build
```

Los artefactos de compilación se generan en `dist/tcs-technical-test`.

## Estructura del proyecto

```
src/
├── app/
│   ├── core/                     # Infraestructura transversal
│   │   ├── constants/            # Endpoints de la API (fuente única de verdad)
│   │   ├── models/                # Modelos de dominio (Product)
│   │   ├── services/              # ProductService (HTTP)
│   │   └── validators/            # Validadores reutilizables (fechas, verificación de ID)
│   ├── features/
│   │   └── products/
│   │       ├── product-list/      # Listado, búsqueda, paginación, menú contextual, eliminación
│   │       └── product-form/      # Formulario de creación/edición
│   ├── app.component.*            # Shell de la aplicación (encabezado + router-outlet)
│   ├── app.config.ts               # Configuración de la aplicación (providers)
│   └── app.routes.ts               # Enrutamiento
├── environments/                  # Configuración por entorno (apiUrl)
└── styles.scss                     # Estilos globales, variables de diseño y utilidades compartidas
```

## Documentación técnica adicional

Las decisiones de arquitectura, los principios de ingeniería aplicados (SOLID, DRY, KISS, YAGNI) y la justificación teórica de cada fase del desarrollo están documentados en `TECHNICAL_DECISIONS_LOG.md`, entregado junto con este repositorio (fuera del control de versiones, a petición explícita del equipo).
