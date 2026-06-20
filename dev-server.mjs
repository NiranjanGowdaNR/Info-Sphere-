import http from "http";
import { createServer as createViteServer } from "vite";
import { URL, fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFile } from "fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "5173", 10);

async function loadEnvFile(filePath, override = false) {
  try {
    const contents = await readFile(filePath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (override || process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    // ignore missing env files
  }
}

await loadEnvFile(resolve(__dirname, ".env"));
await loadEnvFile(resolve(__dirname, ".env.local"), true);

let viteServer;

const loadRouteModule = async (modulePath) => {
  if (!viteServer) {
    throw new Error("Vite server is not initialized yet");
  }
  return viteServer.ssrLoadModule(modulePath);
};

const getRouteHandler = (mod, method) => {
  return mod?.Route?.options?.server?.handlers?.[method];
};

const requestHandler = async (req, res) => {
  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? `${host}:${port}`}`,
  );

  // Handle API routes
  if (url.pathname.startsWith("/api/")) {
    try {
      const routePath = url.pathname.slice(5); // Remove /api/
      const baseRoute = routePath.split("?")[0].split("/")[0]; // Get first segment

      let handler;
      let params;

      if (baseRoute === "all-news") {
        const mod = await loadRouteModule("/src/routes/api/all-news.ts");
        handler = getRouteHandler(mod, req.method);
      } else if (baseRoute === "top-headlines") {
        const mod = await loadRouteModule("/src/routes/api/top-headlines.ts");
        handler = getRouteHandler(mod, req.method);
      } else if (baseRoute === "country") {
        const mod = await loadRouteModule("/src/routes/api/country.$iso.ts");
        handler = getRouteHandler(mod, req.method);
        const iso = routePath.split("/")[1] ?? "";
        params = { iso };
      } else if (baseRoute === "search") {
        const mod = await loadRouteModule("/src/routes/api/search.msg.ts");
        handler = getRouteHandler(mod, req.method);
      } else if (baseRoute === "weather") {
        const mod = await loadRouteModule("/src/routes/api/weather.ts");
        handler = getRouteHandler(mod, req.method);
      }

      if (!handler) {
        console.error("API route handler missing", {
          path: url.pathname,
          baseRoute,
          method: req.method,
        });
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
        return;
      }

      const request = new Request(url.toString(), {
        method: req.method,
        headers: req.headers,
      });

      const response = await handler({ request, params });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
      return;
    } catch (error) {
      console.error("API Error:", error);
      const message = error instanceof Error ? error.message : String(error);
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error", message }));
      return;
    }
  }

  // Serve through Vite
  if (viteServer) {
    try {
      // Handle middleware
      let template;
      if (url.pathname === "/" || url.pathname.endsWith(".html")) {
        template = await readFile("./index.html", "utf-8");
      } else {
        try {
          return viteServer.middlewares(req, res, () => {});
        } catch {
          template = await readFile("./index.html", "utf-8");
        }
      }

      template = await viteServer.transformIndexHtml(url.pathname, template);
      res.writeHead(200, { "content-type": "text/html" });
      res.end(template);
    } catch (e) {
      viteServer.ssrFixStacktrace(e);
      res.writeHead(500, { "content-type": "text/plain" });
      res.end(String(e));
    }
  }
};

const server = http.createServer(requestHandler);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try PORT=5174 npm run dev.`);
  } else if (error.code === "EPERM") {
    console.error(
      `Cannot listen on ${host}:${port}. Check your terminal permissions.`,
    );
  } else {
    console.error("Dev server failed to start:", error);
  }
  process.exit(1);
});

createViteServer({
  server: { middlewareMode: true, host, hmr: { server } },
  appType: "spa",
}).then((vs) => {
  viteServer = vs;
  server.listen(port, host, () => {
    console.log(`\n⚡ Dev server running at http://${host}:${port}/\n`);
  });
});
