export const routeConfig = {
  public: [
    '/',
    '/login',
    '/register',
    '/forgot-password',
  ],
  protected: [] as string[],
};

export function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}
