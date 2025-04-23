import { createFileRoute, redirect } from '@tanstack/react-router'

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
        replace: true // Optional: replace history entry instead of pushing
      });
    }
    // If authenticated, proceed to load the route component/children
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/my-page"!</div>
}
