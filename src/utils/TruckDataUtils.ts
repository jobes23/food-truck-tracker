import { FoodTruck } from "../types";
import { getTruckStatus } from "./FoodTruckUtils";

export const processTruckData = (
  trucks: FoodTruck[],
  selectedDate: string,
  timeRange: number,
  timezone: string
) => {
  return trucks.map((truck) => {
    const status = getTruckStatus(truck.startTime, truck.endTime, selectedDate, timeRange, timezone);
    return {
      ...truck,
      status,
      isInRange: status !== "closed",
    };
  });
};

export const getUniqueCuisines = (trucks: FoodTruck[]) => {
  return Array.from(
    new Set(trucks.map((t) => t.cuisine).filter((c): c is string => Boolean(c)))
  );
};
