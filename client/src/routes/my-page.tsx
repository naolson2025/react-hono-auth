import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/my-page')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Pass the current location to redirect back after login
          redirect: location.href,
          message: 'Must be logged in to access this page',
        },
        replace: true, // Optional: replace history entry instead of pushing
      });
    }
    // If authenticated, proceed to load the route component/children
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold">Your own Page!</h1>
    </div>
  );
}
