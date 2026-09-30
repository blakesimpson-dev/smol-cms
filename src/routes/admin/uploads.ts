import {Hono} from 'hono';
import {uploadRequest} from '../../lib/cloudinary';
import type {AppEnv} from '../../lib/env';

export const uploadRoutes = new Hono<AppEnv>();

uploadRoutes.post('/upload-signature', c => {
  const request = uploadRequest(c.var.deploy.isProd);
  if (!request) {
    return c.json({error: "Image uploads aren't configured"}, 500);
  }

  return c.json(request);
});
