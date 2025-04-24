import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold">Welcome to my super cool website!</h1>
    </div>
  );
}
