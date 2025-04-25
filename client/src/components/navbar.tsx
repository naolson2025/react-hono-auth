import { Link, useMatchRoute } from '@tanstack/react-router';
import { useAuth } from '../auth/use-auth-hook';
import { Lock } from 'lucide-react';

export const Navbar = () => {
  const matchRoute = useMatchRoute();
  const { isAuthenticated, user, logout } = useAuth();

  const isHomeActive = matchRoute({ to: '/', fuzzy: false });
  const isLoginActive = matchRoute({ to: '/login', fuzzy: false });
  const isMyPageActive = matchRoute({ to: '/my-page', fuzzy: false });

  return (
    <div className="navbar bg-base-100 shadow-sm flex">
      <div className="flex-1">
        <Link
          to="/"
          className={`btn btn-soft btn-accent mx-2 ${isHomeActive ? 'btn-active' : ''}`}
        >
          Home
        </Link>
      </div>
      {isAuthenticated ? (
        <>
          <div className="mx-1">{user?.email}</div>
          <button className="btn btn-warning mx-1" onClick={logout}>
            Logout
          </button>
        </>
      ) : (
        <Link
          to="/login"
          className={`btn btn-soft btn-accent mx-1 ${isLoginActive ? 'btn-active' : ''}`}
        >
          Login
        </Link>
      )}
      <div
        className={isAuthenticated ? '' : 'tooltip tooltip-bottom'}
        data-tip={isAuthenticated ? '' : 'login required'}
      >
        <Link
          to="/my-page"
          className={`btn btn-soft btn-accent mx-1 ${isMyPageActive ? 'btn-active' : ''}`}
          disabled={!isAuthenticated}
        >
          {!isAuthenticated && <Lock className="size-4" />}
          My Page
        </Link>
      </div>
    </div>
  );
};
