import { AppShell } from "@/components/nav/AppShell";
import { AddMealSheet } from "@/components/meals/AddMealSheet";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

/**
 * Authenticated app shell. Renders the responsive sidebar (md+) /
 * bottom nav (mobile) and mounts the global Add Meal sheet so any
 * page can open it via `useApp().openAddMeal(mealType)`.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGate>
      <AppShell>
        {children}
        <AddMealSheet />
      </AppShell>
    </OnboardingGate>
  );
}
