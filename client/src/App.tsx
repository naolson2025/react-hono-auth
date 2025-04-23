import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useAuth } from "./auth/use-auth-hook";
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined,
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const App = () => {
  const auth = useAuth(); // Get auth state and functions from context

  // Show loading indicator while checking auth status initially
  if (auth.isLoading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  return <RouterProvider router={router} context={{ auth }} />; // Provide context
}