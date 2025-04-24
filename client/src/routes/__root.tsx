import {
  createRootRouteWithContext,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthContextType } from '../auth/AuthContext';
import { Navbar } from '../components/navbar';

interface RootRouteContext {
  auth: AuthContextType | undefined;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: () => (
    <>
      <Navbar />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
