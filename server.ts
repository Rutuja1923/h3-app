// Import h3 as npm dependency
import {
  createApp,
  createRouter,
  defineEventHandler,
  createError,
  getQuery,
  getRouterParam,
  defineLazyEventHandler,
  toNodeListener,
  fromWebHandler,
  getHeader,
  getRequestHeader,
  readBody,
} from "h3";
import type { IncomingMessage, ServerResponse } from "http";
import { createServer } from "node:http";

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

// Middleware that adds start time
app.use(
  "/timed",
  defineEventHandler((event) => {
    event.context.startTime = Date.now();
    console.log("Start time set:", event.context.startTime);
  })
);

// Main handler
app.use(
  "/timed",
  defineEventHandler((event) => {
    return {
      processingTime: Date.now() - event.context.startTime,
      message: "Timed response",
    };
  })
);

app.use(
  "/greet",
  defineEventHandler(() => {
    return "Welcome to h3 playground";
  })
);

//user middleware to set context
app.use(
  defineEventHandler((event) => {
    if (event.path.startsWith("/user")) {
      event.context.user = { id: 123, name: "John" };
    }
  })
);

// the node handler part doesn't work as exprected
// Convert Node.js style handler (with proper types)
const nodeStyleHandler = (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node.js handler");
};
// Create server (separate from H3 app)
const server = createServer(toNodeListener(app));
server.on("request", nodeStyleHandler);

// Convert Web/Fetch style handler
const webStyleHandler = async (request: globalThis.Request) => {
  return new Response("Hello from Fetch handler", {
    headers: { "Content-Type": "text/plain" },
    status: 200,
  });
};
app.use("/fetch-route", fromWebHandler(webStyleHandler));

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

router.get(
  "/object-handler",
  defineEventHandler({
    onRequest: [
      (event) => {
        console.log("Request started:", event.path);
      },
    ],
    onBeforeResponse: [
      (event) => {
        console.log("About to send response");
      },
    ],
    handler: (event) => {
      return {
        message: "Response from object syntax handler",
        timestamp: new Date(),
      };
    },
  })
);

router.get(
  "/html",
  defineEventHandler(() => "<h1>Hello HTML!</h1>")
);

router.get(
  "/json",
  defineEventHandler(() => ({
    status: "ok",
    data: [1, 2, 3],
  }))
);

router.get(
  "/stream",
  defineEventHandler(() => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue("Streaming ");
        controller.enqueue("data ");
        controller.close();
      },
    });
    return stream;
  })
);

router.get(
  "/error",
  defineEventHandler(() => {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Error",
      message: "Something went wrong on our end.",
      fatal: true,
    });
  })
);

router.get(
  "/lazy-heavy",
  defineLazyEventHandler(() => {
    console.log("Initializing heavy resource...");
    const heavyResource = initializeHeavyResource();
    return defineEventHandler(() => ({
      data: heavyResource.process(),
      loadedAt: new Date(),
    }));
  })
);

function initializeHeavyResource() {
  console.log("Heavy resource initialized");
  return {
    process: () => "This is heavy data from the resource",
  };
}

router.get(
  "/item/:id",
  defineEventHandler((event) => {
    const id = getRouterParam(event, "id");
    return {
      id,
      name: `Item ${id}`,
      details: `Details for item ${id}`,
    };
  })
);

//dummy authorization
//simulated client "session" token store
let clientAuthToken = "";

router.get(
  "/auth/set-token",
  defineEventHandler((event) => {
    clientAuthToken = "Bearer valid-token";
    return { message: "Auth token set!", token: clientAuthToken };
  })
);

router.get(
  "/auth/clear-token",
  defineEventHandler((event) => {
    clientAuthToken = "";
    return { message: "Auth token cleared." };
  })
);

router.get(
  "/secure",
  defineEventHandler(async (event) => {
    const authToken = getHeader(event, "Authorization");
    if (!authToken) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    try {
      event.context.user = await verifyToken(authToken); // Simulate this
    } catch (error) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "Invalid token",
      });
    }

    return { message: "Access granted", user: event.context.user };
  })
);

function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    if (token === "Bearer valid-token") {
      resolve({ userId: 123, name: "Alice" });
    } else {
      reject(new Error("Invalid token"));
    }
  });
}

router.get(
  "/auth/test-secure",
  defineEventHandler(async () => {
    const response = await fetch("http://localhost:3000/secure", {
      headers: {
        Authorization: clientAuthToken,
      },
    });

    const data = await response.json();
    return { status: response.status, data };
  })
);

router.get(
  "/request-info",
  defineEventHandler((event) => {
    //log event info
    console.log(`Request: ${event.toString()}`);

    //access event properties
    return {
      path: event.path,
      method: event.method,
      headers: Object.fromEntries(event.headers),
      query: getQuery(event),
    };
  })
);

router.get(
  "/node-native",
  defineEventHandler((event) => {
    //access node.js native request/response
    const nodeReq = event.node.req;
    const nodeRes = event.node.res;

    //example: Set custom header
    nodeRes.setHeader("X-Custom-Header", "Hello from Node");

    return {
      url: nodeReq.url,
      httpVersion: nodeReq.httpVersion,
    };
  })
);

router.get(
  "/user/profile",
  defineEventHandler((event) => {
    //access context set by middleware
    return `Hello ${event.context.user.name}! Your id is ${event.context.user.id}`;
  })
);

router.get(
  "/respond-with",
  defineEventHandler((event) => {
    //using respondWith
    event.respondWith(
      new Response("Early response", {
        status: 202,
        headers: { "X-Early-Response": "true" },
      })
    );

    //this won't be sent to client
    return "This will be ignored";
  })
);

router.get(
  "/normal-response",
  defineEventHandler((event) => {
    //normal return - it is recommended and preferred
    return {
      message: "This works normally",
      timestamp: new Date(),
    };
  })
);

router.post(
  "/echo",
  defineEventHandler(async (event) => {
    const body = await readBody(event);
    const contentType = getHeader(event, "content-type");

    return {
      receivedAt: new Date(),
      contentType,
      body,
      yourIp:
        getRequestHeader(event, "x-forwarded-for") ||
        event.node.req.socket.remoteAddress,
    };
  })
);

router.get(
  "/sub/*",
  defineEventHandler((event) => {
    return `From Sub: Hello ${
      (event.context.params && event.context.params._) || "guest"
    }!`;
  })
);

router.get(
  "/multi/**",
  defineEventHandler((event) => {
    return `From multi: Hello ${
      (event.context.params && event.context.params._) || "guest"
    }!`;
  })
);
