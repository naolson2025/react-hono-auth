import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { CircleX } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  const handleClick = async () => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      setServerErrors([]);
      navigate({ to: '/my-page' });
    } else {
      const error = await response.json();
      setServerErrors(error.errors);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Sign Up</legend>

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

        <button className="btn btn-primary" onClick={handleClick}>
          Sign Up
        </button>
      </fieldset>
      <p className="p-6">
        Already have an account?{' '}
        <Link to="/login" className="link link-secondary">
          Login
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
  );
}
