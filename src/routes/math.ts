import { Router, defineEventHandler, createError } from "h3";

const isEvenPath = (path: string): boolean => {
  const num = parseInt(path.substring(1));
  return !isNaN(num) && num % 2 === 0;
};

export default (router: Router) => {
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
};
