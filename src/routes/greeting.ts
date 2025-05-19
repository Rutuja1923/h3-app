import { defineEventHandler, Router, getQuery } from "h3";

export default (router: Router) => {
  router.get(
    "/hello",
    defineEventHandler(() => {
      return "Hello world!";
    })
  );

  router.get(
    "/welcome",
    defineEventHandler(() => {
      return "Welcome to our service!";
    })
  );

  router.get(
    "/greeting",
    defineEventHandler(async (event) => {
      const name = getQuery(event).name || "stranger";
      return `Greetings, ${name}!`;
    })
  );
};
