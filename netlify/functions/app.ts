import type {Config, Context} from '@netlify/functions';
import {app} from '../../src/app';

export default async function handler(req: Request, context: Context) {
  return app.fetch(req, {netlify: context});
}

export const config: Config = {
  path: '/*',
  preferStatic: true,
};
