import { Hono } from "hono";
import { openAPISpec } from "../docs/openapi";

const docsRoutes = new Hono();

docsRoutes.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Benh-An-Blockchain API Docs</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css">
        <style>
          body { margin: 0; padding: 0; }
          .topbar { display: none; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            SwaggerUIBundle({
              url: "/docs/openapi.json",
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            })
          }
        </script>
      </body>
    </html>
  `);
});

docsRoutes.get("/openapi.json", (c) => {
  return c.json(openAPISpec);
});

export default docsRoutes;
