"use client";

import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useApp } from "@/lib/store";
import { OnboardingView } from "./OnboardingView";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { loading, measurements, goals } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const hasInitialMeasurement = measurements.length > 0;
  const hasCalorieBaseline = Boolean(goals.maintenanceKcal && goals.deficitKcal);
  const hasTargetWeight = goals.targetWeight != null && goals.targetWeight > 0;

  if (!hasInitialMeasurement || !hasCalorieBaseline || !hasTargetWeight) {
    return <OnboardingView />;
  }

  return <>{children}</>;
}
