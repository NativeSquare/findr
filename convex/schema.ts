import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { taps } from "./taps";
import { users } from "./users";
import { views } from "./views";

export default defineSchema({
  ...authTables,
  users,
  taps,
  views,
});
