import { Link, useMatchRoute } from '@tanstack/react-router';
import { useAuth } from '../auth/use-auth-hook';

export const Navbar = () => {
  const matchRoute = useMatchRoute();
  const { isAuthenticated } = useAuth();

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
      {!isAuthenticated && (
        <Link
          to="/login"
          className={`btn btn-soft btn-accent mx-2 ${isLoginActive ? 'btn-active' : ''}`}
        >
          Login
        </Link>
      )}
      <Link
        to="/my-page"
        className={`btn btn-soft btn-accent mx-2 ${isMyPageActive ? 'btn-active' : ''}`}
      >
        My Page
      </Link>
    </div>
  );
};
