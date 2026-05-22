# NutriTrack — Setup Guide

## 1. Instalar dependencias del sistema (si no las tenés)

```bash
# Node.js LTS → https://nodejs.org
# Git → https://git-scm.com
# VS Code → https://code.visualstudio.com

# Verificar
node -v   # debe ser v18+ o v20+
npm -v
git --version
```

## 2. Configurar Supabase

1. Entrá a https://supabase.com → tu proyecto
2. Ir a **SQL Editor** → pegá todo el contenido de `supabase/schema.sql` → Run
3. Ir a **Project Settings → API** → copiar:
   - `Project URL` 
   - `anon public` key

4. En la raíz del proyecto:
```bash
cp .env.local.example .env.local
# Editá .env.local con tus valores reales
```

5. (Opcional pero recomendado) Para no tener que confirmar email al registrarse:
   - Supabase Dashboard → **Authentication → Settings**
   - Desactivar "Enable email confirmations"

## 3. Instalar y correr localmente

```bash
npm install
npm run dev
# Abrí http://localhost:3000
```

## 4. Subir a GitHub y deployar en Vercel

```bash
# Crear repo en GitHub (sin README, vacío)
git init
git add .
git commit -m "feat: initial nutritrack with supabase backend"
git remote add origin https://github.com/TU_USUARIO/nutritrack.git
git push -u origin main
```

En Vercel:
1. https://vercel.com → New Project → importar el repo de GitHub
2. En **Environment Variables** agregar:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
3. Deploy → listo 🎉

## 5. Para updates futuros

```bash
git add .
git commit -m "feat: descripcion del cambio"
git push
# Vercel re-deploya automáticamente
```

## Archivos clave modificados vs el front original

| Archivo | Qué hace |
|---|---|
| `lib/supabase.ts` | Cliente Supabase para componentes cliente |
| `lib/supabase-server.ts` | Cliente para Server Components |
| `lib/db.ts` | Todas las queries a la DB |
| `lib/store.tsx` | Store igual que antes pero persistido en Supabase |
| `middleware.ts` | Protección de rutas — redirige a /login si no hay sesión |
| `app/(auth)/login/page.tsx` | Login/registro real con Supabase Auth |
| `components/meals/AddMealSheet.tsx` | Pasa macros calculados al guardar |
| `components/more/MoreView.tsx` | Cerrar sesión real |
| `supabase/schema.sql` | Schema completo de la DB |
