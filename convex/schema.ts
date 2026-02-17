import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { albumPhotos, albums } from "./albums";
import { conversations } from "./conversations";
import { eventMessages } from "./eventMessages";
import { eventAttendees, events } from "./events";
import { messages } from "./messages";
import { stories } from "./stories";
import { storyLikes } from "./storyLikes";
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
  eventMessages,
  stories,
  storyLikes,
});
