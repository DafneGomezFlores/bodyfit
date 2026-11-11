# NODO GYM — Proyecto completo

Sistema de gestión de gimnasio: MySQL + NestJS (backend) + React/Vite (frontend),
basado en tus 5 tablas: `usuario`, `tarifa_dinamica`, `membresias`, `permiso`, `pase_diarios`.

## Estructura

```
database/schema.sql   → script de creación de la base de datos
backend/               → API en NestJS (TypeORM + MySQL)
frontend/              → interfaz en React (Vite)
```

## 1. Base de datos

1. Abre MySQL (Workbench, DBeaver, o consola).
2. Ejecuta el contenido de `database/schema.sql`. Esto crea la base `nodo_gym`,
   las 5 tablas con sus relaciones (foreign keys) y algunos datos de ejemplo.

## 2. Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` con tus datos reales de MySQL (usuario, contraseña, nombre de la base).

```bash
npm run start:dev
```

La API queda en `http://localhost:3000`. Endpoints principales:

- `GET/POST /usuarios`, `GET /usuarios?ci=...`
- `GET/POST /tarifas`
- `GET/POST /membresias`, `GET /membresias/resumen`, `GET /membresias/por-vencer`
- `GET/POST /permisos`
- `GET/POST /pases-diarios`

`synchronize: true` está activado en `app.module.ts` para que TypeORM ajuste las
tablas automáticamente mientras desarrollas. Si ya corriste `schema.sql` y no quieres
que TypeORM las toque, puedes poner `synchronize: false`.

## 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Se abre en `http://localhost:5173`. Por defecto apunta a `http://localhost:3000`
(configurable con una variable `VITE_API_URL` en un archivo `.env` dentro de `frontend/`).

## Notas

- El estilo visual (verde terminal + naranja quemado) está en `frontend/src/styles.css`,
  separado de la lógica — puedes ajustarlo sin tocar los componentes.
- El estado de una membresía (`activa` / `por_vencer` / `vencida`) se recalcula en el
  backend a partir de `fecha_fin` en cada consulta, en vez de depender solo del valor
  guardado en la columna `estado`.
- Al registrar un `permiso`, el backend actualiza automáticamente `fecha_fin` en la
  membresía correspondiente.
