import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function App() {
  const auth = useAuth(); // Get auth state and functions from context

  // Show loading indicator while checking auth status initially
  if (auth.isLoading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  return <RouterProvider router={router} context={{ auth }} />; // Provide context
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}
