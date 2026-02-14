import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired stories every hour
crons.interval(
  "cleanup expired stories",
  { hours: 1 },
  internal.stories.cleanupExpiredStories
);

export default crons;
