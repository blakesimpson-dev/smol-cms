import { createHash } from "node:crypto";
import type { ImageValue } from "./schema";
import { env } from "./env";

export const cloudName = () => env("CLOUDINARY_CLOUD_NAME");

export const uploadFolder = (isProd: boolean) =>
  `${env("CLOUDINARY_FOLDER") ?? "cms-lite"}/${isProd ? "production" : "preview"}`;

/** Signs upload parameters as described in https://cloudinary.com/documentation/authentication_signatures */
export function signParams(params: Record<string, unknown>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort()
    .map((k) => `${k}=${Array.isArray(params[k]) ? (params[k] as unknown[]).join(",") : String(params[k])}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

type UrlOpts = { width?: number; height?: number };

export function imgUrl(id: string, { width, height }: UrlOpts = {}): string {
  const t = ["f_auto", "q_auto"];
  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`, "c_fill", "g_auto");
  return `https://res.cloudinary.com/${cloudName()}/image/upload/${t.join(",")}/${id}`;
}

const WIDTHS = [480, 800, 1200, 1600, 2400];

/** Responsive srcset, never upscaling beyond the original width. */
export function srcset(img: ImageValue, maxWidth = 2400): string {
  const limit = Math.min(maxWidth, img.width || maxWidth);
  const widths = WIDTHS.filter((w) => w < limit).concat(limit);
  return widths.map((w) => `${imgUrl(img.id, { width: w })} ${w}w`).join(", ");
}
