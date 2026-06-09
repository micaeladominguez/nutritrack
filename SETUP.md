# NutriTrack - Setup Guide

## Requisitos

- Node.js 18 o superior
- El backend `nutritrackbff` configurado y corriendo en Java 17

## Configuracion

```bash
npm install
cp .env.local.example .env.local
```

La configuracion local predeterminada es:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Ejecucion

Primero inicia el backend en el puerto 8080. Luego:

```bash
npm run dev
```

Abri `http://localhost:3000/login`. El registro y el login usan el JWT del
backend; alimentos, recetas, comidas, medidas, objetivos y semana se persisten
por la misma API.

## Verificacion

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

## Deploy

Configura `NEXT_PUBLIC_API_URL` con la URL publica del backend. El backend debe
incluir el origen del frontend en `CORS_ORIGINS`.
