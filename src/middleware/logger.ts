import { defineEventHandler } from "h3";

export default defineEventHandler((event) => {
  console.log(`[${new Date().toISOString()}] ${event.method} ${event.path}`);
});
