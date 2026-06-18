"use client";

import { useRouter } from "next/navigation";
import { Scale, Flame, User as UserIcon, Bell, LogOut, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useApp } from "@/lib/store";

export function MoreView() {
  const router = useRouter();
  const { user, signOut } = useApp();

  const sections = [
    {
      title: "Tu cuerpo",
      items: [
        { icon: Scale, label: "Peso y medidas", onClick: () => router.push("/weight") },
        { icon: Flame, label: "Objetivos", onClick: () => {} },
      ],
    },
    {
      title: "Cuenta",
      items: [
        { icon: UserIcon, label: "Perfil", onClick: () => {} },
        { icon: Bell, label: "Recordatorios", onClick: () => {} },
        { icon: LogOut, label: "Cerrar sesión", danger: true, onClick: async () => { await signOut(); router.push("/login"); } },
      ],
    },
  ];

  return (
    <div>
      <div className="px-5 pt-4 pb-3">
        <h1 className="font-extrabold text-[34px] leading-none tracking-[-0.03em]">Configuración</h1>
      </div>

      <div className="px-5 pb-4">
        <Card padding={20} className="flex items-center gap-3.5">
          <div className="w-[52px] h-[52px] rounded-full bg-primary text-on-primary flex items-center justify-center font-extrabold text-[22px] font-display">
            {(user?.name || "M")[0]}
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-base">{user?.name || "Marcos"}</div>
            <div className="text-xs text-ink-3 mt-0.5">{user?.email || "hola@nutritrack.app"}</div>
          </div>
        </Card>
      </div>

      {sections.map((s) => (
        <div key={s.title} className="px-5 pb-4">
          <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider mb-2 px-1">{s.title}</div>
          <Card padding={0}>
            {s.items.map((it, idx) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.label}
                  type="button"
                  onClick={it.onClick}
                  className={
                    "w-full text-left flex items-center gap-3.5 px-4 py-3.5 " +
                    (idx > 0 ? "border-t border-border " : "") +
                    (it.danger ? "text-danger" : "text-ink")
                  }
                >
                  <div
                    className={
                      "w-9 h-9 rounded-sm flex items-center justify-center " +
                      (it.danger ? "bg-danger-soft text-danger" : "bg-surface-2 text-ink-2")
                    }
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 text-sm font-semibold">{it.label}</div>
                  {!it.danger && <ChevronRight size={16} className="text-ink-3" />}
                </button>
              );
            })}
          </Card>
        </div>
      ))}

      <div className="text-center text-xs text-ink-3 mt-4">NutriTrack · v0.1</div>
    </div>
  );
}
