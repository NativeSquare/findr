import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { albums, albumPhotos } from "./albums";
import { conversations } from "./conversations";
import { events, eventAttendees } from "./events";
import { messages } from "./messages";
import { taps } from "./taps";
import { users } from "./users";
import { views } from "./views";

export default defineSchema({
  ...authTables,
  users,
  taps,
  views,
  conversations,
  messages,
  albums,
  albumPhotos,
  events,
  eventAttendees,
});
