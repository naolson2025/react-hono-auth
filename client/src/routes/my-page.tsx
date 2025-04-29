import { createFileRoute, redirect } from '@tanstack/react-router';
import { Check, CircleX } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await fetch('/api/auth/user-settings', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setColor(data.favorite_color || '');
          setAnimal(data.favorite_animal || '');
        } else {
          console.error('Failed to fetch user settings');
          const errorData = await response.json();
          setServerErrors(errorData.errors || ['An unknown error occurred']);
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
        setServerErrors(['An error occurred while fetching user settings']);
      }
    };

    fetchUserSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          favorite_color: color,
          favorite_animal: animal,
        }),
      });
  
      if (response.ok) {
        setSuccess(true);
        setServerErrors([]);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setServerErrors(errorData.errors || ['An unknown error occurred']);
        setSuccess(false);
        setTimeout(() => {
          setServerErrors([]);
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setServerErrors(['An error occurred while saving settings']);
      setSuccess(false);
      setTimeout(() => {
        setServerErrors([]);
      }, 3000);
    }
  };

  const handlePasswordUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await response.json();
      console.log('Response data:', data);
      if (response.ok) {
        setSuccess(true);
        setServerErrors([]);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setServerErrors(errorData.errors || ['An unknown error occurred']);
        setSuccess(false);
        setTimeout(() => {
          setServerErrors([]);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setServerErrors(['An error occurred while updating password']);
      setSuccess(false);
      setTimeout(() => {
        setServerErrors([]);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold">Your own Page!</h1>

      <form onSubmit={handleSubmit}>
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
      </form>

      <form onSubmit={handlePasswordUpdateSubmit}>
        <fieldset className="fieldset w-xs p-4">
          <legend className="fieldset-legend">Update Password</legend>

          <label className="label">Current Password</label>
          <input
            type="password"
            className="input"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <label className="label">New Password</label>
          <input
            type="password"
            className="input"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button className="btn btn-primary mt-4">Save</button>
        </fieldset>
      </form>

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

      {success && (
        <div role='alert' className="alert alert-success m-2">
          <Check className="h-6 w-6" />
          <div>
            Your settings have been saved successfully!
          </div>
        </div>
      )}
    </div>
  );
}
