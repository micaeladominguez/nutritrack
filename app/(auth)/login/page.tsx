"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase";
import * as db from "@/lib/db";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      await db.signIn(supabase, email, password);
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      await db.signUp(supabase, name, email, password);
      // Supabase sends a confirmation email by default.
      // To skip email confirmation: disable it in Auth → Settings in Supabase dashboard.
      setError("¡Cuenta creada! Revisá tu email para confirmar, o iniciá sesión si desactivaste la confirmación.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginForm
      isLoading={loading}
      error={error}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
}
