"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Soup, BookOpen, CalendarDays, Plus, Settings, Scale, LogOut } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { useApp } from "@/lib/store";
import { clsx } from "@/lib/clsx";

interface NavItem { id: string; label: string; href: string; icon: typeof Home }

const NAV: NavItem[] = [
  { id: "today",   label: "Hoy",       href: "/",         icon: Home },
  { id: "foods",   label: "Alimentos", href: "/foods",    icon: Soup },
  { id: "recipes", label: "Recetas",   href: "/recipes",  icon: BookOpen },
  { id: "week",    label: "Semanal",   href: "/week",     icon: CalendarDays },
];

const SIDEBAR_EXTRA: NavItem[] = [
  { id: "weight", label: "Peso y medidas", href: "/weight", icon: Scale },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}

function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useApp();

  const items = [...NAV, ...SIDEBAR_EXTRA];

  return (
    <aside className="hidden md:flex md:flex-col w-[232px] shrink-0 bg-surface border-r border-border px-4 py-6 sticky top-0 h-screen">
      <div className="px-2 pb-6">
        <Wordmark size={22} />
      </div>
      <nav className="flex flex-col gap-0.5">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => router.push(it.href)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-left text-sm",
                active ? "bg-surface-2 text-ink font-bold" : "text-ink-2 font-medium hover:bg-surface-2/60",
              )}
            >
              <Icon size={18} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="border-t border-border pt-4 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-extrabold text-base tracking-tight">
          {(user?.name || "M")[0]}
        </div>
        <div className="text-[13px] font-bold">
          {user?.name || user?.email?.split("@")[0] || "Usuario"}
        </div>
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="text-ink-3 hover:text-danger p-1"
          aria-label="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { openAddMeal } = useApp();

  const items: NavItem[] = [
    ...NAV,
    { id: "more", label: "Config.", href: "/more", icon: Settings },
  ];

  return (
    <>
      <button
        onClick={() => openAddMeal("snack")}
        className="md:hidden fixed right-5 top-5 z-40 w-12 h-12 rounded-full bg-ink text-on-primary border-[3px] border-surface flex items-center justify-center shadow-3"
        aria-label="Agregar comida"
      >
        <Plus size={22} />
      </button>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border pt-2 px-2"
        style={{ paddingBottom: "max(1.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex justify-around items-center relative">
          {items.map((it) => {
            const active = pathname === it.href || (it.href === "/" && pathname === "/");
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => router.push(it.href)}
                className={clsx(
                  "flex flex-col items-center gap-0.5 px-2.5 py-1.5",
                  active ? "text-ink" : "text-ink-3",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                <span className={clsx("text-[10px] tracking-tight", active ? "font-bold" : "font-semibold")}>{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
