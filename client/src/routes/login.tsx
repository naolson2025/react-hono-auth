import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { CircleX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const searchParams = useSearch({ from: '/login' }) as { message: string };
  const message = searchParams.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const toastShownRef = useRef(false); // Track if the toast has been shown

  useEffect(() => {
    if (message && !toastShownRef.current) {
      toast.error(message, { duration: 3000 });
      toastShownRef.current = true; // Mark the toast as shown
    }
  }, [message]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      setServerErrors([]);
      const user = await response.json();
      console.log('Login successful:', user);
      // Handle successful login (e.g., redirect or update state)
    } else {
      const error = await response.json();
      setServerErrors(error.errors);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-12">
        <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
          <legend className="fieldset-legend">Login</legend>

          <label className="fieldset-label">Email</label>
          <input
            type="email"
            className="input validator"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="validator-hint mt-0">Enter valid email address</div>

          <label className="fieldset-label">Password</label>
          <input
            type="password"
            className="input validator"
            required
            minLength={10}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="validator-hint mt-0">
            Password must be at least 10 characters
          </div>

          <button className="btn btn-neutral" onClick={handleClick}>
            Login
          </button>
        </fieldset>
        <p className="p-6">
          Don't have an account?{' '}
          <Link to="/signup" className="link link-secondary">
            Sign Up
          </Link>
        </p>

        {serverErrors.length > 0 && (
          <div role="alert" className="alert alert-error m-2">
            <CircleX className="h-6 w-6" />
            <div>
              {serverErrors.map((error, index) => (
                <span key={index}>
                  {error}
                  <br />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-center" />
    </>
  );
}
