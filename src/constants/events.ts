export const EVENT_TYPES = [
  "Party",
  "Sports",
  "Music",
  "Gaming",
  "Networking",
  "Food & Drinks",
  "Outdoor",
  "Art & Culture",
  "Fitness",
  "Other",
] as const;

export const DATE_RANGES = [
  "Today",
  "Tomorrow",
  "This Week",
  "This Weekend",
  "This Month",
  "Any Time",
] as const;

export const IMPERIAL_DISTANCES = [
  "1 mile",
  "5 miles",
  "10 miles",
  "25 miles",
  "50 miles",
  "Any Distance",
] as const;

export const METRIC_DISTANCES = [
  "1 km",
  "5 km",
  "10 km",
  "25 km",
  "50 km",
  "Any Distance",
] as const;

export const EVENT_FILTERS_STORAGE_KEY = "event_filters";
export const EVENT_SEARCH_LOCATION_STORAGE_KEY = "event_search_location";
