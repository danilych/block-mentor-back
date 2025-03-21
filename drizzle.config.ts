import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export default {
  schema: "./src/apps/api/modules/drizzle/schema.ts",
  out: "./src/apps/api/modules/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
};
