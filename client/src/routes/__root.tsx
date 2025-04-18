import {
  createRootRoute,
  Link,
  Outlet,
  useMatchRoute,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

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

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="navbar bg-base-100 shadow-sm flex">
        <div className="flex-1"></div>
        <NavbarLink to="/login">Login</NavbarLink>
        <NavbarLink to="/about">About</NavbarLink>
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
