import { AppShell } from "@/components/nav/AppShell";
import { AddMealSheet } from "@/components/meals/AddMealSheet";

/**
 * Authenticated app shell. Renders the responsive sidebar (md+) /
 * bottom nav (mobile) and mounts the global Add Meal sheet so any
 * page can open it via `useApp().openAddMeal(mealType)`.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <AddMealSheet />
    </AppShell>
  );
}
