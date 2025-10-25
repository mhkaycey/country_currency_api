import { config } from "dotenv";
import process from "process";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
config();

export const {
  PORT,
  SERVER_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_URL,
} = process.env;
