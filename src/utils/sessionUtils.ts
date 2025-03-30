import { ProcessedFoodTruck } from "../types";

const ONE_HOUR = 60 * 60 * 1000;

export const getStoredTruckData = (selectedDate: string): ProcessedFoodTruck[] | null => {
  try {
    const stored = sessionStorage.getItem(`trucks_${selectedDate}`);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (Date.now() - parsed.timestamp > ONE_HOUR) return null;

    return parsed.trucks || null;
  } catch (err) {
    console.warn("[sessionUtils] Failed to parse stored data:", err);
    return null;
  }
};

export const storeTruckData = (selectedDate: string, trucks: ProcessedFoodTruck[]) => {
  sessionStorage.setItem(
    `trucks_${selectedDate}`,
    JSON.stringify({ trucks, timestamp: Date.now() })
  );
};

export const cleanOldTruckSessions = () => {
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (const key in sessionStorage) {
    if (key.startsWith("trucks_")) {
      try {
        const item = sessionStorage.getItem(key);
        if (!item) continue;

        const parsed = JSON.parse(item);
        if (!parsed.timestamp || now - parsed.timestamp > ONE_HOUR) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
};
