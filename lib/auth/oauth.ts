const appOrigin = "https://nexo.invalid";

export function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";

  const target = new URL(next, appOrigin);
  if (target.origin !== appOrigin) return "/app";

  return `${target.pathname}${target.search}${target.hash}`;
}
