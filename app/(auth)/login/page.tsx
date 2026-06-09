"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import * as db from "@/lib/db";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await db.signIn(email, password);
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
      await db.signUp(name, email, password);
      router.push("/");
      router.refresh();
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
