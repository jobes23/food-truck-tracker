import L from "leaflet";

// Define FoodTruck Interface
export interface FoodTruck {
  latitude: number;
  longitude: number;
  logo?: string;
  truckName: string;
  location: string;
  startTime: string;
  endTime: string;
  cuisine?: string;
  social?: {
    Instagram?: string;
    Facebook?: string;
  };
  status?: "open" | "opening_soon" | "inactive" | "closing_soon" | "unknown" | "closed";
}

export const parseTime = (timeStr: string, dateStr: string): number | null => {
  if (!timeStr || !dateStr) return null;

  // Convert `dateStr` to proper format (`YYYY-MM-DD`)
  const parsedDate = new Date(new Date(dateStr).toLocaleString("en-US", { timeZone: "America/New_York" }));

  if (isNaN(parsedDate.getTime())) return null; // Ensure valid date
  const formattedDate = parsedDate.toISOString().split("T")[0]; // Get YYYY-MM-DD

  // Handle 24-hour time format (e.g., "14:30")
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    console.error(`[parseTime] Invalid time format: ${timeStr}`);
    return null;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  // Construct a Date object in local time
  const dateTime = new Date(`${formattedDate}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`);
  return dateTime.getTime();
};

export const getTruckStatus = (
  startTime: string,
  endTime: string,
  selectedDate: string,
  timeRange: number,
  timezone: string
): FoodTruck["status"] => { // ✅ Explicitly returning the correct type

  console.log(`[DEBUG] Input - Start: ${startTime}, End: ${endTime}, Date: ${selectedDate}, TimeRange: ${timeRange}, Timezone: ${timezone}`);

  // Get current time in the truck's timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Format `now` to match the truck's timezone
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value.padStart(2, "0");
  const day = parts.find((p) => p.type === "day")?.value.padStart(2, "0");
  const hour = parts.find((p) => p.type === "hour")?.value.padStart(2, "0");
  const minute = parts.find((p) => p.type === "minute")?.value.padStart(2, "0");
  const second = parts.find((p) => p.type === "second")?.value.padStart(2, "0");

  const nowTimeString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  const nowTime = new Date(nowTimeString);

  // Convert truck start and end times to Date objects
  const start = new Date(`${selectedDate}T${startTime}`);
  const end = new Date(`${selectedDate}T${endTime}`);

  if (nowTime >= start && nowTime <= end) {
    // Check if closing soon
    const closingTimeThreshold = new Date(end.getTime() - timeRange * 60 * 1000); // subtract timeRange minutes
    if (nowTime >= closingTimeThreshold) {
      return "closing_soon";
    }
    return "open";
  }

  if (nowTime > end) return "closed";
  if (nowTime < start) return "opening_soon";

  return "unknown"; // Added for safety.
};

export const createFoodTruckIcon = (status: FoodTruck["status"], isFavorite: boolean) => {
  const statusColors: Record<string, string> = {
    open: "#28a745", // Brighter, more accessible green
    closing_soon: "#ffc107", // Yellow/amber for warning
    opening_soon: "#007bff", // Blue for anticipation/upcoming
    inactive: "#6c757d", // Gray for neutral/off state
    closed: "#dc3545", // Red for definitively closed
  };

  const backgroundColor = statusColors[status || "inactive"];
  const favoriteGlow = isFavorite ? "box-shadow: 0px 0px 8px 4px gold;" : "";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${backgroundColor}; 
      border-radius: 50%; width: 40px; height: 40px; 
      display: flex; align-items: center; justify-content: center; 
      color: white; font-size: 20px; ${favoriteGlow}">🚚</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};
