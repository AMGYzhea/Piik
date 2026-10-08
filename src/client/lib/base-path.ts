// Deployment base path. Vite rewrites BASE_URL from the `base` build option:
// "/live/" for sub-path deployments behind a reverse proxy, "/" at a root.
export const APP_BASE: string = import.meta.env.BASE_URL;

function basePrefix(): string {
  return APP_BASE.endsWith("/") ? APP_BASE.slice(0, -1) : APP_BASE;
}

/** Prefix an app route such as "/r/1234" with the deployment base path. */
export function baseRoute(route: string): string {
  return `${basePrefix()}${route}`;
}

/** Strip the deployment base path from a pathname before route parsing. */
export function stripBasePath(pathname: string): string {
  const base = basePrefix();
  if (base !== "" && pathname.startsWith(base)) {
    return pathname.slice(base.length) || "/";
  }
  return pathname;
}
