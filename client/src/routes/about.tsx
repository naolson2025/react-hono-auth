import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <div className="flex flex-col justify-center items-center my-8">
      Welcome to our website! We are glad to have you here.
    </div>
  );
}
