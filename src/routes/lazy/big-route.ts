import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    message: "Lazy route loaded",
    timestamp: new Date().toISOString(),
  };
});
