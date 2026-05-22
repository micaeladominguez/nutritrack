import { clsx } from "@/lib/clsx";

interface Props {
  size?: number;
  className?: string;
}

/**
 * Wordmark C — capital N in Instrument Serif paired with the rest of
 * the name in Manrope semibold tracked-out caps. The single piece of
 * the design system that uses the serif face.
 */
export function Wordmark({ size = 26, className }: Props) {
  return (
    <span
      className={clsx("inline-flex items-baseline text-ink leading-none", className)}
    >
      <span
        className="font-display"
        style={{ fontSize: size * 1.1, letterSpacing: "-0.02em", fontWeight: 400 }}
      >
        N
      </span>
      <span
        className="font-semibold"
        style={{
          fontSize: size * 0.62,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          marginLeft: 2,
          transform: "translateY(-2px)",
        }}
      >
        utritrack
      </span>
    </span>
  );
}
