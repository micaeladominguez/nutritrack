"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/TextInput";
import { Wordmark } from "@/components/brand/Wordmark";
import { Spinner } from "@/components/ui/Spinner";
import { clsx } from "@/lib/clsx";

interface Props {
  /** Wire to Supabase: `await supabase.auth.signInWithPassword({ email, password })` */
  onLogin?: (email: string, password: string) => Promise<void> | void;
  /** Wire to Supabase: `await supabase.auth.signUp({ email, password, options: { data: { name } } })` */
  onRegister?: (name: string, email: string, password: string) => Promise<void> | void;
  isLoading?: boolean;
  error?: string | null;
}

type Mode = "login" | "register";

export function LoginForm({ onLogin, onRegister, isLoading = false, error = null }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (mode === "register") {
      if (!name || !email || !password) {
        setLocalError("Completá todos los campos.");
        return;
      }
      if (password !== confirm) {
        setLocalError("Las contraseñas no coinciden.");
        return;
      }
      await onRegister?.(name, email, password);
    } else {
      if (!email || !password) {
        setLocalError("Completá tu email y contraseña.");
        return;
      }
      await onLogin?.(email, password);
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex flex-col min-h-screen px-6 pt-16 pb-8 max-w-md mx-auto w-full">
      <div className="flex-1 flex flex-col justify-center">
        <Wordmark size={28} />
        <h1 className="font-extrabold leading-none mt-8 mb-2 text-[44px] tracking-[-0.03em]">
          {mode === "login" ? "Hola otra vez." : "Empezá tu registro."}
        </h1>
        <p className="text-[15px] text-ink-2 leading-relaxed mb-9">
          {mode === "login"
            ? "Hoy es un buen día para comer con intención."
            : "Tres datos, treinta segundos."}
        </p>

        {/* tab switcher */}
        <div className="flex bg-surface-2 rounded-pill p-1 mb-6">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setLocalError(null); }}
              className={clsx(
                "flex-1 h-10 rounded-pill text-sm font-semibold transition-all",
                mode === m ? "bg-surface text-ink shadow-1" : "text-ink-2",
              )}
            >
              {m === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          {mode === "register" && (
            <Field label="Nombre">
              <TextInput value={name} onChange={setName} placeholder="Marcos" icon={<UserIcon size={18} />} />
            </Field>
          )}
          <Field label="Email">
            <TextInput
              value={email} onChange={setEmail}
              type="email" autoComplete="email" placeholder="hola@nutritrack.app"
              icon={<Mail size={18} />}
            />
          </Field>
          <Field label="Contraseña">
            <TextInput
              value={password} onChange={setPassword}
              type={showPw ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              icon={<Lock size={18} />}
              suffix={
                <button type="button" onClick={() => setShowPw((s) => !s)} className="text-ink-3 flex">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </Field>
          {mode === "register" && (
            <Field label="Confirmar contraseña">
              <TextInput
                value={confirm} onChange={setConfirm}
                type="password" autoComplete="new-password"
                icon={<Lock size={18} />}
              />
            </Field>
          )}

          {displayError && (
            <div className="bg-danger-soft text-danger rounded-sm px-3.5 py-2.5 text-[13px]">
              {displayError}
            </div>
          )}

          <Button type="submit" size="lg" full disabled={isLoading} className="mt-2">
            {isLoading ? (
              <>
                <Spinner /> Procesando…
              </>
            ) : mode === "login" ? "Entrar" : "Crear cuenta"}
          </Button>

          {mode === "login" && (
            <button type="button" className="text-ink-2 text-[13px] font-medium mt-1 py-2">
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </form>
      </div>

      <div className="text-center text-xs text-ink-3 mt-8">
        Al continuar aceptás los términos y la política de privacidad.
      </div>
    </div>
  );
}
