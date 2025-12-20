import geospatial from "@convex-dev/geospatial/convex.config";
import migrations from "@convex-dev/migrations/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(migrations);
app.use(geospatial);

export default app;
