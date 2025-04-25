import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';

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
  const [color, setColor] = useState('');
  const [animal, setAnimal] = useState('');

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold">Your own Page!</h1>

      <fieldset className="fieldset w-xs p-4 m-8">
        <legend className="fieldset-legend">Favorites</legend>

        <label className="label">Favorite Color</label>
        <input
          type="text"
          className="input"
          placeholder="dream in color..."
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <label className="label">Favorite Animal</label>
        <input
          type="text"
          className="input"
          placeholder="panda..."
          value={animal}
          onChange={(e) => setAnimal(e.target.value)}
        />

        <button className="btn btn-primary mt-4">Save</button>
      </fieldset>
    </div>
  );
}
