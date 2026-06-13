export function normalizePageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    parsed.pathname = normalizePathname(parsed.pathname);
    return parsed.toString().replace(/\/$/, parsed.pathname === "/" ? "/" : "");
  } catch {
    return "";
  }
}

export function getSiteTarget(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}
