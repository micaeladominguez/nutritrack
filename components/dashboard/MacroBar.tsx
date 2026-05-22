import { Progress } from "@/components/ui/Stats";

interface Props {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
}

export function MacroBar({ label, value, goal, unit, color }: Props) {
  return (
    <div>
      <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="tnum font-extrabold text-[22px] tracking-[-0.035em] text-ink">
          {Math.round(value)}
        </span>
        <span className="tnum text-[11px] text-ink-3 font-medium">/ {goal} {unit}</span>
      </div>
      <Progress value={value} max={goal} color={color} height={5} />
    </div>
  );
}
