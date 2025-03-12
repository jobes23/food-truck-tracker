import React, { useState, useMemo, useEffect } from "react";
import useAPI from "../hooks/useAPI";
import MapComponent from "./MapComponents/MapComponent";
import TruckFilter from "./MapComponents/TruckFilter";
import { getTruckStatus, FoodTruck } from "../utils/FoodTruckUtils";
import LoadingOverlay from "./LoadingOverlay";
import "../Styles/Map.css";

export interface ProcessedFoodTruck extends FoodTruck {
  isInRange: boolean;
  status: "open" | "opening_soon" | "inactive" | "closed" | "closing_soon" | "unknown" | "closed" | undefined;
}

const DEFAULT_CENTER: [number, number] = [34.2257, -77.9447]; // Wilmington, NC
const ONE_HOUR = 60 * 60 * 1000;

const TIMEZONE_API_URL = "http://api.timezonedb.com/v2.1/get-time-zone";
const TIMEZONE_API_KEY = import.meta.env.VITE_TIMEZONE_DB_API;

const getDateInTimezone = (timezone: string) => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Intl.DateTimeFormat("en-CA", options).format(now);
};

const Map: React.FC = () => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [loadingTimezone, setLoadingTimezone] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<number>(5);
  const [category, setCategory] = useState<string>("All");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [cuisineList, setCuisineList] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [trucksData, setTrucksData] = useState<ProcessedFoodTruck[]>([]);
  const { data: rawFoodTrucks, callApi, loading } = useAPI<{ trucks: FoodTruck[] }>();

  // Favorite Trucks (Stored in Local Storage)
  const [favoriteTrucks, setFavoriteTrucks] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("favoriteTrucks") || "[]");
  });

  // Fetch timezone based on map center
  useEffect(() => {
    const fetchTimezone = async () => {
      try {
        setLoadingTimezone(true);
        const response = await fetch(
          `${TIMEZONE_API_URL}?key=${TIMEZONE_API_KEY}&format=json&by=position&lat=${mapCenter[0]}&lng=${mapCenter[1]}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.zoneName) {
          console.log("[TIMEZONE] Timezone set to:", data.zoneName);
          setTimezone(data.zoneName);
        } else {
          console.error("[TIMEZONE ERROR] Failed to fetch timezone data:", data);
        }
      } catch (error) {
        console.error("[TIMEZONE ERROR] Exception while fetching timezone:", error);
      } finally {
        setLoadingTimezone(false);
      }
    };

    fetchTimezone();
  }, [mapCenter]);

  useEffect(() => {
    if (timezone) {
      const formattedDate = getDateInTimezone(timezone);
      console.log("[TIMEZONE] Converted date:", formattedDate);
      setSelectedDate(formattedDate);
    }
  }, [timezone]);

  // **API Call to Fetch Food Trucks (Handles Caching)**
  useEffect(() => {
    if (!selectedDate) return;
  
    console.log(`[API CALL] Checking cache for date: ${selectedDate}`);
  
    const storedData = sessionStorage.getItem(`trucks_${selectedDate}`);
    let processedData: ProcessedFoodTruck[] = [];
  
    if (storedData && Date.now() - JSON.parse(storedData).timestamp < ONE_HOUR) {
      console.log(`[CACHE] Using cached data for ${selectedDate}`);
      processedData = JSON.parse(storedData).trucks;
    } else {
      console.log(`[API CALL] Fetching trucks for date: ${selectedDate}`);
      callApi(`getFoodTrucks?date=${encodeURIComponent(selectedDate)}`, "GET");
      return; // 🚀 Exit early, data will be handled in next effect when API responds
    }
  
    // ✅ Extract unique cuisines while ensuring valid strings
    const uniqueCuisines = Array.from(
      new Set(
        processedData.map((truck) => truck.cuisine).filter((cuisine): cuisine is string => Boolean(cuisine))
      )
    );
  
    console.log("[PROCESSING] Unique cuisines:", uniqueCuisines);
    
    // ✅ Set cuisine list
    setCuisineList(uniqueCuisines);
  
    // ✅ Set selected cuisines only if empty (prevents overwriting user selections)
    setSelectedCuisines((prev) => (prev.length === 0 ? uniqueCuisines : prev));
  
    setTrucksData(processedData);
  }, [selectedDate, callApi]);  

  // **Process API Response & Extract Cuisines**
  useEffect(() => {
    if (!selectedDate || !rawFoodTrucks?.trucks || !Array.isArray(rawFoodTrucks.trucks)) return;

    console.log("[API RESPONSE] Trucks received:", rawFoodTrucks.trucks);

    const processedData: ProcessedFoodTruck[] = rawFoodTrucks.trucks.map((truck) => {
      const status = getTruckStatus(truck.startTime, truck.endTime, selectedDate, timeRange, timezone || "UTC");
      return {
        ...truck,
        status,
        isInRange: status !== "closed",
      };
    });

    console.log("[PROCESSING] Processed trucks with status:", processedData);

    // ✅ Extract cuisines while ensuring they are valid strings
    const uniqueCuisines = Array.from(
      new Set(
        rawFoodTrucks.trucks
          .map((truck) => truck.cuisine)
          .filter((cuisine): cuisine is string => Boolean(cuisine))
      )
    );

    console.log("[PROCESSING] Unique cuisines:", uniqueCuisines);
    setCuisineList(uniqueCuisines);
    sessionStorage.setItem(`trucks_${selectedDate}`, JSON.stringify({ trucks: processedData, timestamp: Date.now() }));
    setTrucksData(processedData);
  }, [rawFoodTrucks, selectedDate, timeRange, timezone]);

  // **Filter Trucks Based on Cuisine & Status**
  const processedTrucks: ProcessedFoodTruck[] = useMemo(() => {
    if (!trucksData || trucksData.length === 0) {
      return [];
    }
  
    return trucksData.filter((truck) => {
      const matchesCuisine =
        selectedCuisines.length === 0 || (truck.cuisine && selectedCuisines.includes(truck.cuisine));
  
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(truck.status || ""); // ✅ Keeps selected statuses in sync
  
      return truck.isInRange && matchesCuisine && matchesStatus;
    });
  }, [trucksData, selectedCuisines, selectedStatuses]);  

  return (
    <div className="map-container">
      {(loading || loadingTimezone || !selectedDate) && <LoadingOverlay />}

      <TruckFilter
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        category={category}
        setCategory={setCategory}
        cuisine={selectedCuisines}
        setCuisine={setSelectedCuisines}
        cuisineList={cuisineList}
        truckCount={processedTrucks.length}
        timezone={timezone || "UTC"}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
      />

      {selectedDate && <MapComponent
        foodTrucks={processedTrucks}
        favoriteTrucks={favoriteTrucks}
        toggleFavorite={(truck) =>
          setFavoriteTrucks((prev) => (prev.includes(truck) ? prev : [...prev, truck]))
        }
      />}
    </div>
  );
};

export default Map;
