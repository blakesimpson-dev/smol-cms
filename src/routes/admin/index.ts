import {Hono} from 'hono';
import {csrf} from 'hono/csrf';
import {requireAuth} from '../../lib/auth';
import type {AppEnv} from '../../lib/env';
import {accountRoutes} from './account';
import {authRoutes} from './auth';
import {sectionRoutes} from './sections';
import {uploadRoutes} from './uploads';

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use(csrf());
adminRoutes.use(async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
  c.header('X-Robots-Tag', 'noindex, nofollow');
});

// Login and logout are registered before the auth check
adminRoutes.route('/', authRoutes);
adminRoutes.use('*', requireAuth);
adminRoutes.route('/', sectionRoutes);
adminRoutes.route('/', uploadRoutes);
adminRoutes.route('/account', accountRoutes);
