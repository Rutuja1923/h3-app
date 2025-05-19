// Import h3 as npm dependency
import { createApp, createRouter, defineEventHandler } from "h3";

// Create an app instance
export const app = createApp({
  debug: true,
  onError: (error) => {
    console.error("Global error handler:", error);
  },
  onRequest: (event) => {
    console.log(`Request received: ${event.method} ${event.path}`);
  },
});

// Create a new router and register it in app
const router = createRouter();
app.use(router);

// Add a new route that matches GET requests to / path
router.get(
  "/",
  defineEventHandler((event) => {
    return { message: "⚡️ Tadaa!" };
  })
);

router.get(
  "/hello",
  defineEventHandler((event) => {
    return { message: "hello from h3-app.ts" };
  })
);

app.use(
  "/greet",
  defineEventHandler(() => {
    return "Welcome to h3 playground";
  })
);
