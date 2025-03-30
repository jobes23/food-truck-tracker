import React, { useState, useMemo, useEffect } from "react";
import useTimezone from "../hooks/useTimezone";
import useTruckData from "../hooks/useTruckData";
import { cleanOldTruckSessions } from "../utils/sessionUtils";
import MapComponent from "./MapComponents/MapComponent";
import TruckFilter from "./MapComponents/TruckFilter";
import LoadingOverlay from "./LoadingOverlay";
import "../Styles/Map.css";

const DEFAULT_CENTER: [number, number] = [34.2257, -77.9447];

const getDateInTimezone = (timezone: string) => {
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
};

const Map: React.FC = () => {
  const [mapCenter] = useState(DEFAULT_CENTER);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState(5);
  const [category, setCategory] = useState("All");
  const [favoriteTrucks, setFavoriteTrucks] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("favoriteTrucks") || "[]")
  );

  const { timezone, loading: loadingTimezone } = useTimezone(mapCenter[0], mapCenter[1]);
  const { trucksData, cuisineList, loading } = useTruckData(
    selectedDate,
    timeRange,
    timezone || "UTC"
  );

  useEffect(() => {
    if (cuisineList.length > 0 && selectedCuisines.length === 0) {
      setSelectedCuisines(cuisineList);
    }
  }, [cuisineList]);
  
  useEffect(() => {
    if (timezone) {
      setSelectedDate(getDateInTimezone(timezone));
    }
  }, [timezone]);

  useEffect(() => {
    cleanOldTruckSessions();
  }, []);

  const filteredTrucks = useMemo(() => {
    return trucksData.filter((truck) => {
      const matchesCuisine =
        selectedCuisines.length === 0
          ? false
          : truck.cuisine && selectedCuisines.includes(truck.cuisine);
  
      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(truck.status || "");
  
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
        truckCount={filteredTrucks.length}
        timezone={timezone || "UTC"}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        truckList={filteredTrucks}
        favoriteTrucks={favoriteTrucks}
        toggleFavorite={(truckName) =>
          setFavoriteTrucks((prev) =>
            prev.includes(truckName)
              ? prev.filter((t) => t !== truckName)
              : [...prev, truckName]
          )
        }
      />

      {selectedDate && (
        <MapComponent
          foodTrucks={filteredTrucks}
          favoriteTrucks={favoriteTrucks}
          toggleFavorite={(truck) =>
            setFavoriteTrucks((prev) =>
              prev.includes(truck) ? prev : [...prev, truck]
            )
          }
        />
      )}
    </div>
  );
};

export default Map;
