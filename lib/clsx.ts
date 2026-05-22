/**
 * Tiny conditional-className helper. Same idea as `classnames`/`clsx` —
 * keeps us free of an extra dep.
 */
export function clsx(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(" ");
}
