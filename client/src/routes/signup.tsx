import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { CircleX } from 'lucide-react';
import { useAuth } from '../auth/use-auth-hook';
import { useEffect } from 'react';

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    setEmail,
    setPassword,
    email,
    password,
    signup,
    isAuthenticated,
    serverErrors,
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/my-page' });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
          <legend className="fieldset-legend">Sign Up</legend>

          <label className="fieldset-label">Email</label>
          <input
            type="email"
            className="input validator"
            placeholder="Email"
            required
            value={email}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="validator-hint mt-0">
            Password must be at least 10 characters
          </div>

          <button className="btn btn-primary">Sign Up</button>
        </fieldset>
      </form>
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
