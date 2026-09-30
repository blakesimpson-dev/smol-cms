import {Hono} from 'hono';
import {
  MIN_PASSWORD_LENGTH,
  changePassword,
  checkPassword,
  failedAuthDelay,
  startSession,
} from '../../lib/auth';
import type {AppEnv} from '../../lib/env';
import {Account, type AccountErrors} from '../../pages/admin/account';

export const accountRoutes = new Hono<AppEnv>();

accountRoutes.get('/', c => c.html(<Account />));

accountRoutes.post('/', async c => {
  const {isProd} = c.var.deploy;
  const body = await c.req.parseBody();
  function field(name: string): string {
    const v = body[name];
    return typeof v === 'string' ? v : '';
  }

  const errors: AccountErrors = {};
  if (!(await checkPassword(isProd, field('current')))) {
    await failedAuthDelay();
    errors.current = 'Incorrect password';
  }
  if (field('password').length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${String(MIN_PASSWORD_LENGTH)} characters`;
  } else if (field('password') !== field('confirm')) {
    errors.confirm = "The passwords don't match";
  }
  if (Object.keys(errors).length > 0) {
    return c.html(<Account errors={errors} />, 400);
  }

  const version = await changePassword(isProd, field('password'));
  await startSession(c, version);

  return c.html(<Account saved />);
});
