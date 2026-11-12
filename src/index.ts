import { Hono } from "hono";
import * as Sentry from "@sentry/cloudflare";
import { cors } from "hono/cors";
import { registerDriveRoutes } from "./drive";
import type { Env } from "./env";
import { getTrustedOrigins, isAllowedClientOrigin } from "./env";
import { getSentryOptions } from "./sentry";

type AppType = { Bindings: Env };

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const app = new Hono<AppType>();

// BladeVault calls the token routes from its own server, so CORS only matters
// for browsers. No cookies are used, so credentials stay off.
app.use("*", async (c, next) => {
  const allowedOrigins = getTrustedOrigins(c.env);
  return cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0] ?? "";
      return isAllowedClientOrigin(origin, c.env) ? origin : "";
    },
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    maxAge: 86400,
  })(c, next);
});

app.get("/", (c) =>
  c.json({
    name: "BladeVault Auth",
    ok: true,
    now: new Date().toISOString(),
  }),
);

app.get("/api/health", (c) =>
  c.json({
    ok: true,
    now: new Date().toISOString(),
  }),
);

registerDriveRoutes(app);

app.notFound(() => jsonError("Not found", 404));
app.onError((error, c) => {
  Sentry.withScope((scope) => {
    scope.setTag("route", c.req.routePath);
    Sentry.captureException(error);
  });
  return jsonError("Internal server error", 500);
});

export default Sentry.withSentry((env: Env) => getSentryOptions(env), app);
