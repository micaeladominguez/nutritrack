# NutriTrack

App personal de nutrición — Next.js 14 (App Router) + Tailwind CSS + TypeScript.
Mobile-first PWA. Vista responsive: bottom nav en mobile, sidebar en desktop.

## Empezar

```bash
cd nutritrack-app
npm install
npm run dev
```

Abrí <http://localhost:3000>. La app entra directo al Dashboard con datos de ejemplo (sin login).
Si querés ver el flujo completo, ir a <http://localhost:3000/login>.

## Stack

- **Next.js 14** App Router con Server + Client Components
- **Tailwind CSS** + design tokens en CSS variables (`app/globals.css`)
- **TypeScript** estricto
- **lucide-react** para íconos
- **recharts** para gráficos (peso, semana)
- Estado local con **React Context** (`lib/store.tsx`). Sin librerías de estado.

## Estructura

```
app/
  layout.tsx              # Root: fuentes, providers, manifest
  globals.css             # Tokens (CSS vars) + Tailwind
  (auth)/login/page.tsx   # Login + Registro
  (app)/                  # Rutas autenticadas
    layout.tsx            # Sidebar/bottom nav + AddMealSheet global
    page.tsx              # Dashboard (Hoy)
    foods/page.tsx        # Base de alimentos compartida
    recipes/page.tsx      # Mis recetas
    week/page.tsx         # Registro semanal
    weight/page.tsx       # Peso y medidas
    more/page.tsx         # Menú "Más"
components/
  ui/                     # Button, Card, TextInput, Sheet, Stats (Ring/BigNum/Progress)
  brand/Wordmark.tsx      # Wordmark "N + utritrack"
  nav/AppShell.tsx        # Sidebar + BottomNav + FAB
  auth/LoginForm.tsx
  dashboard/              # DashboardView + MealSection + WaterCard + ...
  meals/AddMealSheet.tsx  # Sheet global de cargar comida
  foods/                  # Lista + FoodEditSheet
  recipes/                # Lista + RecipeEditor (con IngredientPicker)
  week/WeekView.tsx
  weight/WeightView.tsx
  more/MoreView.tsx
lib/
  types.ts                # Tipos del dominio
  macros.ts               # Cálculo de macros (food/recipe/entry)
  sample-data.ts          # Datos de ejemplo
  store.tsx               # AppProvider + useApp() (Context)
  clsx.ts                 # Helper conditional className
public/
  manifest.json           # PWA
```

## Design system

Los tokens viven en `app/globals.css` como CSS custom properties y se
exponen a Tailwind en `tailwind.config.ts`. Cambiar un color es **un
solo lugar**.

```css
:root {
  --bg: #faf8f3;        /* warm cream */
  --primary: #4f7464;   /* sage */
  --accent: #c4633a;    /* terracotta */
  --protein: #c4633a;
  --carbs: #c9a358;
  --fats: #a89478;
  --water: #7a9aa5;
  ...
}
```

Soporta modo oscuro automático vía `prefers-color-scheme`. Para forzar
un modo, agregar `data-theme="dark"` o `data-theme="light"` en `<html>`.

**Tipografía**: Manrope para todo (con peso 800 para los números
display). Instrument Serif solo para la **N** del wordmark — un único
toque de serif que define la marca.

## Backend

El frontend usa la API REST de `nutritrackbff`. Copiá la configuración local:

```bash
cp .env.local.example .env.local
```

Por defecto la app consulta `http://localhost:8080`. Para otro ambiente:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

La lógica HTTP vive en `lib/db.ts` y el estado de la aplicación en
`lib/store.tsx`. El JWT se guarda en `localStorage` después de login o registro.

### Auth

El `LoginForm` (`components/auth/LoginForm.tsx`) ya tiene la prop
interface que el prompt original pedía:

```ts
onLogin?: (email: string, password: string) => Promise<void> | void;
onRegister?: (name: string, email: string, password: string) => Promise<void> | void;
isLoading?: boolean;
error?: string | null;
```

`app/(auth)/login/page.tsx` usa `/api/auth/login` y `/api/auth/register`.
Las rutas de la aplicación redirigen a `/login` cuando no hay token o la API
rechaza la sesión.

## PWA

`public/manifest.json` está configurado. Faltan los íconos:

- `public/icon-192.png` (192×192)
- `public/icon-512.png` (512×512)

Pueden ser el monograma "N" en sage sobre cream. Cualquier generador
de PWA icons sirve.

Para que se instale como app standalone hay que servirla por HTTPS
(automático en Vercel/Netlify). En `localhost` Chrome lo permite igual.

## Notas

- **Backend separado**: `nutritrackbff` debe estar corriendo para iniciar
  sesión y usar las pantallas con datos.
- **Routes guarded**: el provider valida el JWT contra `/api/auth/me`.
- **Calculador de macros** (`lib/macros.ts`): trabaja siempre con
  valores por 100 g/ml. Para recetas, normaliza por `finalWeight`.
- Los íconos vienen de `lucide-react`. Si querés cambiar uno, importá
  otro de la misma librería.

## Próximos pasos sugeridos

1. Generar íconos PWA (192/512) y agregarlos a `public/`.
2. Configurar service worker para offline (Next.js 14 + `next-pwa` o
   manual). El manifest ya está listo.
