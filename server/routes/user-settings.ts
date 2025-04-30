import { Hono } from 'hono';
import { updateUserFavorites, getUserFavorites } from '../db/queries';
import { dbConn } from '../db/db';
import { userSettingsValidator } from '../schemas/user-settings-schema';

export const userSettings = new Hono();

userSettings
  .get('/', (c) => {
    const db = dbConn();
    const payload = c.get('jwtPayload');

    if (!payload || !payload.sub) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }

    try {
      const user = getUserFavorites(db, payload.sub);

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json({
        id: payload.sub,
        favorite_color: user.favorite_color,
        favorite_animal: user.favorite_animal,
      });
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  })
  .put('/', userSettingsValidator, (c) => {
    const db = dbConn();
    const payload = c.get('jwtPayload');
    const { favorite_color, favorite_animal } = c.req.valid('json');

    if (!payload || !payload.sub) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }

    try {
      const user = updateUserFavorites(
        db,
        payload.sub,
        favorite_color,
        favorite_animal
      );

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json({
        id: payload.sub,
        favorite_color: user.favorite_color,
        favorite_animal: user.favorite_animal,
      });
    } catch (error) {
      console.error('Error updating user favorites:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  })