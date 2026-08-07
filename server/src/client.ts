import { hc } from "hono/client";
import type { app } from "./index";
import type { ClientRequestOptions } from "hono/client";

export type AppType = typeof app;

export const hcWithType = <Prefix extends string>(
  baseUrl: Prefix,
  options?: ClientRequestOptions
) => hc<AppType>(baseUrl, options);

export type Client = ReturnType<typeof hcWithType>;

