import type { Config, Context } from "@netlify/functions";
import { app } from "../../src/app";

export default (req: Request, context: Context) => app.fetch(req, { netlify: context });

export const config: Config = {
  path: "/*",
  // Files in /public (CSS, JS, favicon) are served directly by the CDN.
  preferStatic: true,
};
