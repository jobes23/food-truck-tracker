import L from "leaflet";
import { FoodTruck } from "../types";

// Used in Map.tsx – add to a shared types file if needed
export interface ProcessedFoodTruck extends FoodTruck {
  isInRange: boolean;
  status: "open" | "opening_soon" | "inactive" | "closed" | "closing_soon" | "unknown" | undefined;
}

// 🔧 Parses time and returns a local timestamp
export const parseTime = (timeStr: string, dateStr: string): number | null => {
  if (!timeStr || !dateStr) return null;

  const parsedDate = new Date(new Date(dateStr).toLocaleString("en-US", { timeZone: "America/New_York" }));
  if (isNaN(parsedDate.getTime())) return null;

  const formattedDate = parsedDate.toISOString().split("T")[0];
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    console.error(`[parseTime] Invalid time format: ${timeStr}`);
    return null;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const dateTime = new Date(`${formattedDate}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`);
  return dateTime.getTime();
};

// 🟢 Determines status like "open", "closing_soon", etc.
export const getTruckStatus = (
  startTime: string,
  endTime: string,
  selectedDate: string,
  timeRange: number,
  timezone: string
): FoodTruck["status"] => {
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

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value.padStart(2, "0");
  const day = parts.find((p) => p.type === "day")?.value.padStart(2, "0");
  const hour = parts.find((p) => p.type === "hour")?.value.padStart(2, "0");
  const minute = parts.find((p) => p.type === "minute")?.value.padStart(2, "0");
  const second = parts.find((p) => p.type === "second")?.value.padStart(2, "0");

  const nowTimeString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  const nowTime = new Date(nowTimeString);

  const start = new Date(`${selectedDate}T${startTime}`);
  const end = new Date(`${selectedDate}T${endTime}`);

  if (nowTime >= start && nowTime <= end) {
    const closingTimeThreshold = new Date(end.getTime() - timeRange * 60 * 1000);
    if (nowTime >= closingTimeThreshold) {
      return "closing_soon";
    }
    return "open";
  }

  if (nowTime > end) return "closed";
  if (nowTime < start) return "opening_soon";

  return "unknown";
};

// 🧠 Converts raw trucks into processed ones with status and isInRange
export const processTruckData = (
  trucks: FoodTruck[],
  selectedDate: string,
  timeRange: number,
  timezone: string
): ProcessedFoodTruck[] => {
  return trucks.map((truck) => {
    const status = getTruckStatus(truck.startTime, truck.endTime, selectedDate, timeRange, timezone);
    return {
      ...truck,
      status,
      isInRange: status !== "closed",
    };
  });
};

// 🍱 Extracts unique cuisines from a list of trucks
export const getUniqueCuisines = (trucks: FoodTruck[]): string[] => {
  return Array.from(
    new Set(
      trucks
        .map((truck) => truck.cuisine)
        .filter((c): c is string => Boolean(c))
    )
  );
};

// 🔄 Determines if the truck cache should be refreshed
export const shouldRefetchTrucks = (timestamp: number, expirationMs = 60 * 60 * 1000): boolean => {
  return Date.now() - timestamp > expirationMs;
};

// 🧼 Optional session cleaner
export const cleanupTruckCache = (maxAgeMs = 60 * 60 * 1000) => {
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("trucks_")) {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        try {
          const { timestamp } = JSON.parse(raw);
          if (shouldRefetchTrucks(timestamp, maxAgeMs)) {
            sessionStorage.removeItem(key);
          }
        } catch {
          sessionStorage.removeItem(key); // if corrupted, remove anyway
        }
      }
    }
  });
};

// 🗺️ Generates a Leaflet icon for the truck with color/status
export const createFoodTruckIcon = (status: FoodTruck["status"], isFavorite: boolean) => {
  const statusColors: Record<string, string> = {
    open: "#28a745",
    closing_soon: "#ffc107",
    opening_soon: "#007bff",
    inactive: "#6c757d",
    closed: "#dc3545",
    unknown: "#999999",
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
