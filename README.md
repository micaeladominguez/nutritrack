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
    foods/page.tsx        # Mis alimentos
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
  --primary: #2d4a3e;   /* deep sage */
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

## Conectar Supabase

Toda la lógica de datos vive en `lib/store.tsx` (`AppProvider`). Para
conectar un backend real, reemplazá cada `setter` por una mutación:

```ts
// lib/store.tsx
import { supabase } from "@/lib/supabase";

const addEntry = useCallback(async (entry) => {
  // optimistic
  setEntries((xs) => [...xs, { ...entry, id: tempId() }]);
  // persist
  const { data, error } = await supabase
    .from("meal_entries")
    .insert(entry)
    .select()
    .single();
  if (error) {
    // rollback / toast
  } else {
    setEntries((xs) => xs.map((x) => (x.id === tempId() ? data : x)));
  }
}, []);
```

### Auth

El `LoginForm` (`components/auth/LoginForm.tsx`) ya tiene la prop
interface que el prompt original pedía:

```ts
onLogin?: (email: string, password: string) => Promise<void> | void;
onRegister?: (name: string, email: string, password: string) => Promise<void> | void;
isLoading?: boolean;
error?: string | null;
```

En `app/(auth)/login/page.tsx` está la implementación mock — reemplazá
`fakeAuth` por:

```ts
const handleLogin = async (email: string, password: string) => {
  setLoading(true); setError(null);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) setError(error.message);
  else router.push("/");
  setLoading(false);
};
```

## PWA

`public/manifest.json` está configurado. Faltan los íconos:

- `public/icon-192.png` (192×192)
- `public/icon-512.png` (512×512)

Pueden ser el monograma "N" en sage sobre cream. Cualquier generador
de PWA icons sirve.

Para que se instale como app standalone hay que servirla por HTTPS
(automático en Vercel/Netlify). En `localhost` Chrome lo permite igual.

## Notas

- **No hay backend incluido**. Los datos de ejemplo (`lib/sample-data.ts`)
  se cargan en memoria al iniciar la sesión. Refrescá la página y volvés
  al estado inicial.
- **Routes guarded**: el login es opcional en este scaffold (vas directo
  al Dashboard si visitás `/`). Para forzarlo, agregar un `middleware.ts`
  que chequee la sesión de Supabase y redirija a `/login`.
- **Calculador de macros** (`lib/macros.ts`): trabaja siempre con
  valores por 100 g/ml. Para recetas, normaliza por `finalWeight`.
- Los íconos vienen de `lucide-react`. Si querés cambiar uno, importá
  otro de la misma librería.

## Próximos pasos sugeridos

1. Generar íconos PWA (192/512) y agregarlos a `public/`.
2. Crear esquema en Supabase: `foods`, `recipes`, `recipe_ingredients`,
   `meal_entries`, `measurements`, `daily_notes`, `goals`.
3. Reemplazar `AppProvider` por queries/mutations contra Supabase.
4. Agregar `middleware.ts` para proteger las rutas `(app)/*`.
5. Configurar service worker para offline (Next.js 14 + `next-pwa` o
   manual). El manifest ya está listo.
