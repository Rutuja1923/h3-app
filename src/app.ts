import { createApp } from "h3";
import { createRouter } from "h3";
import routes from "./routes";
import logger from "./middleware/logger";

export const app = createApp({
  debug: true,
  onError: (error) => {
    console.error("Global error handler:", error);
  },
  onRequest: (event) => {
    console.log(`Request received`);
  },
});

// Register middleware
app.use(logger);

// Create and register main router
const router = createRouter();
app.use(router);

// Register all routes
routes(router);

export default app;
