import {Hono} from 'hono';
import {
  authConfigured,
  checkPassword,
  endSession,
  failedAuthDelay,
  isLoggedIn,
  startSession,
} from '../../lib/auth';
import type {AppEnv} from '../../lib/env';
import {Login} from '../../pages/admin/login';

export const authRoutes = new Hono<AppEnv>();

authRoutes.get('/login', async c => {
  if (await isLoggedIn(c)) {
    return c.redirect('/admin');
  }

  return c.html(<Login configured={authConfigured()} />);
});

authRoutes.post('/login', async c => {
  const body = await c.req.parseBody();
  const password = typeof body.password === 'string' ? body.password : '';
  const valid =
    authConfigured() && (await checkPassword(c.var.deploy.isProd, password));
  if (!valid) {
    await failedAuthDelay();
    return c.html(
      <Login configured={authConfigured()} error="Incorrect password" />,
      401,
    );
  }
  await startSession(c);

  return c.redirect('/admin');
});

authRoutes.post('/logout', c => {
  endSession(c);

  return c.redirect('/admin/login');
});
