import {Hono} from 'hono';
import {secureHeaders} from 'hono/secure-headers';
import {trimTrailingSlash} from 'hono/trailing-slash';
import {SITE} from './content';
import {deployInfo, type AppEnv} from './lib/env';
import {adminRoutes} from './routes/admin';
import {notFound, publicRoutes} from './routes/public';
import {seoRoutes} from './routes/seo';

// Everything is self-hosted except Cloudinary images and direct uploads
const CSP = {
  defaultSrc: ["'self'"],
  imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
  connectSrc: ["'self'", 'https://api.cloudinary.com'],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'self'"],
};

export const app = new Hono<AppEnv>();

app.use(secureHeaders({contentSecurityPolicy: CSP}));
app.use(deployInfo);
app.use(trimTrailingSlash());
app.use(async (c, next) => {
  const to = SITE.redirects[c.req.path];
  if (to) {
    return c.redirect(to, 301);
  }
  await next();
});

app.route('/', publicRoutes);
app.route('/', seoRoutes);
app.route('/admin', adminRoutes);
app.notFound(notFound);
