import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { users } from "./users";

export default defineSchema({
  ...authTables,
  users,
});
