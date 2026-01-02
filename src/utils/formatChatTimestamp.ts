/**
 * Format a timestamp for chat message display.
 * Returns time for today (e.g., "09:26 PM"), date for older messages (e.g., "07 Nov, 2025").
 */
export function formatChatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // If message is from today, show time
  if (messageDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Otherwise, show date
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a timestamp for chat list display (shorter format).
 * Returns relative time for recent messages, date for older ones.
 */
export function formatChatListTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  // Less than 1 minute ago
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Less than 1 hour ago
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Less than 24 hours ago
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Less than 7 days ago
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Older than a week, show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
