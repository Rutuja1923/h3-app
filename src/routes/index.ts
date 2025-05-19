import greetingRoutes from "./greeting";
import mathRoutes from "./math";
import specialRoutes from "./special";
import { Router, defineLazyEventHandler } from "h3";

export default (router: Router) => {
  // Register all route groups
  greetingRoutes(router);
  mathRoutes(router);
  specialRoutes(router);

  // Lazy route is registered directly
  router.get(
    "/big-route",
    defineLazyEventHandler(() =>
      import("./lazy/big-route").then((m) => m.default)
    )
  );
};
