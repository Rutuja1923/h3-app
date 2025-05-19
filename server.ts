// Import h3 as npm dependency
import {
  createApp,
  createRouter,
  defineEventHandler,
  createError,
  getQuery,
  getRouterParam,
  defineLazyEventHandler,
} from "h3";

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

//add middleware -1 and 2
//will always be executed on each request
//if used return behaves like nomral event handlers
//if not used return statement, acts as middleware
app.use(
  defineEventHandler((event) => {
    console.log("Middleware 1");
  })
);

app.use(
  defineEventHandler((event) => {
    console.log("Middleware 2");
  })
);

app.use(
  "/greet",
  defineEventHandler(() => {
    return "Welcome to h3 playground";
  })
);

// Create a new router and register it in app
const router = createRouter();
app.use(router);

// Add a new route that matches GET requests and other paths
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

router.get(
  "/null",
  defineEventHandler(() => null) // 204 No Content
);

router.get(
  "/empty",
  defineEventHandler(() => {}) // 404 Not Found
);

router.get(
  "/data",
  defineEventHandler(() => ({ key: "value" })) // 200 OK with JSON
);

const isEvenPath = (path: string): boolean => {
  const num = parseInt(path.substring(1));
  return !isNaN(num) && num % 2 === 0;
};

//the even numbered paths
router.add(
  "/:number",
  defineEventHandler((event) => {
    if (!isEvenPath(event.path)) {
      throw createError({
        statusCode: 404,
        statusMessage: "Path not found",
      });
    }
    return `This is an even-numbered path! (${event.path.substring(1)})`;
  }),
  "get"
);

router.get(
  "/welcome",
  defineEventHandler(() => {
    return "Welcome to our service!";
  })
);

router.get(
  "/message",
  defineEventHandler(async (event) => {
    const name = getQuery(event).name || "stranger";
    return `Greetings, ${name}!`;
  })
);

router.get(
  "/bonjour/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name") || "stranger";
    return `Bonjour, ${name}!`;
  })
);

router.get(
  "/delayed",
  defineEventHandler(async (event) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          url: event.node.req.url,
          message: "Response after 1 second",
        });
      }, 1000);
    });
  })
);

router.get(
  "/big-route",
  defineLazyEventHandler(() =>
    import("./src/routes/lazy/big-route").then((m) => m.default)
  )
);

router.get(
  "/validate",
  defineEventHandler((event) => {
    throw createError({
      status: 400,
      statusMessage: "Bad Request",
      message: "Invalid user input",
      data: { field: "email" },
    });
  })
);
