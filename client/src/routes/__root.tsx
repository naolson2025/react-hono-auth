import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="navbar bg-base-100 shadow-sm flex">
        <div className="flex-1"></div>
        <Link
          to="/"
          className="[&.active]:btn-active btn btn-soft btn-accent mx-2"
        >
          Login
        </Link>
        <Link
          to="/about"
          className="[&.active]:btn-active btn btn-soft btn-accent mx-2"
        >
          About
        </Link>
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
