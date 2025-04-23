import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useMatchRoute,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthContextType } from '../auth/AuthContext';

function NavbarLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({ to, fuzzy: false });

  return (
    <Link
      to={to}
      className={`btn btn-soft btn-accent mx-2 ${isActive ? 'btn-active' : ''}`}
    >
      {children}
    </Link>
  );
}

interface RootRouteContext {
  auth: AuthContextType | undefined;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: () => (
    <>
      <div className="navbar bg-base-100 shadow-sm flex">
        <div className="flex-1">
          <NavbarLink to="/">Home</NavbarLink>
        </div>
        <NavbarLink to="/login">Login</NavbarLink>
        <NavbarLink to="/my-page">My Page</NavbarLink>
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
