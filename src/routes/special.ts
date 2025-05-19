import { defineEventHandler, Router } from "h3";

export default (router: Router) => {
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
};
