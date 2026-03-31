import { defineConfig } from '@prisma/config';
import "./src/loadEnv.js";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});