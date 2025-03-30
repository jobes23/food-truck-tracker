import { useState, useEffect } from "react";
import { FoodTruck, ProcessedFoodTruck } from "../types";
import useAPI from "./useAPI";
import { getTruckStatus } from "../utils/FoodTruckUtils";
import { getStoredTruckData, storeTruckData } from "../utils/sessionUtils";


const useTruckData = (
  selectedDate: string,
  timeRange: number,
  timezone: string
) => {
  const [trucksData, setTrucksData] = useState<ProcessedFoodTruck[]>([]);
  const [cuisineList, setCuisineList] = useState<string[]>([]);
  const [lastApiDateRequested, setLastApiDateRequested] = useState<string | null>(null);

  const { data: rawFoodTrucks, callApi, loading } = useAPI<{ trucks: FoodTruck[] }>();

  // Load from session or fetch
  useEffect(() => {
    if (!selectedDate) return;

    const stored = getStoredTruckData(selectedDate);
    if (stored) {
      const cuisines = Array.from(
        new Set(
          rawFoodTrucks?.trucks
            .map((t) => t.cuisine)
            .filter((c): c is string => typeof c === "string")
        )
      );
      
      setCuisineList(cuisines);
      setTrucksData(stored);
    } else {
      setLastApiDateRequested(selectedDate);
      callApi(`getFoodTrucks?date=${encodeURIComponent(selectedDate)}`, "GET");
    }
  }, [selectedDate]);

  // Process and store fetched data
  useEffect(() => {
    if (
      !selectedDate ||
      !rawFoodTrucks?.trucks ||
      selectedDate !== lastApiDateRequested
    )
      return;

    const processed: ProcessedFoodTruck[] = rawFoodTrucks.trucks.map((truck) => {
      const status = getTruckStatus(
        truck.startTime,
        truck.endTime,
        selectedDate,
        timeRange,
        timezone || "UTC"
      );
      return {
        ...truck,
        status,
        isInRange: status !== "closed",
      };
    });

    const cuisines = Array.from(
      new Set(
        rawFoodTrucks.trucks
          .map((t) => t.cuisine)
          .filter((c): c is string => typeof c === "string")
      )
    );
    
    storeTruckData(selectedDate, processed);
    setCuisineList(cuisines);
    setTrucksData(processed);
  }, [rawFoodTrucks, selectedDate, timeRange, timezone, lastApiDateRequested]);

  return { trucksData, cuisineList, loading };
};

export default useTruckData;
