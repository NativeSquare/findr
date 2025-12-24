"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { APP_DOMAIN, APP_NAME } from "../constants";
import { sendEmail } from "../src/utils/sendEmail";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

export const sendFeedback = action({
  args: {
    type: v.optional(v.string()),
    feedbackText: v.optional(v.string()),
    feedbackImages: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get user email
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user || !user.email) {
      throw new Error("User email not found");
    }

    // Format feedback email
    const imagesHtml =
      args.feedbackImages && args.feedbackImages.length > 0
        ? `<div style="margin-top: 20px;">
          <h3>Attached Images:</h3>
          ${args.feedbackImages.map((url) => `<img src="${url}" style="max-width: 300px; margin: 10px 0;" />`).join("")}
        </div>`
        : "";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Feedback Submission</h2>
        <p><strong>From:</strong> ${user.email}${user.name ? ` (${user.name})` : ""}</p>
        <p><strong>Type:</strong> ${args.type || "Not specified"}</p>
        <div style="margin-top: 20px;">
          <h3>Feedback:</h3>
          <p style="white-space: pre-wrap;">${args.feedbackText || "No feedback text provided"}</p>
        </div>
        ${imagesHtml}
      </div>
    `;

    // Send email
    await sendEmail({
      from: `${APP_NAME} <no-reply@${APP_DOMAIN}>`,
      to: [`support@${APP_DOMAIN}`], // You may want to change this to your support email
      subject: `Feedback: ${args.type || "General Feedback"}`,
      html: html,
    });
  },
});
