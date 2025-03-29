import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import Calendar from "./Calendar";
import CalendarGrid from "./CalendarGrid";
import Modal from "../Modal";
import ScheduleTruckForm from "./ScheduleTruckForm";
import useAPI from "../../hooks/useAPI";
import { useAuth } from "../../context/AuthContext";
import "../../Styles/ScheduleFoodTruck.css";
import { ApiResponse, FoodTruck, ScheduleEntry, TruckEntry } from "../../types";

// 🔧 Format helper to transform truck + schedule into backend-friendly payload
const formatTruckScheduleData = (
  truck: FoodTruck,
  truckId: string,
  data: ScheduleEntry
) => ({
  truckId,
  truckName: truck.truckName,
  cuisine: truck.cuisine,
  logo: truck.logo,
  social: truck.social,
  website: truck.website,
  foodIcon: truck.foodIcon,
  region: truck.region || "",
  franchiseId: truck.franchiseId || "",
  description: truck.description || "",
  date: data.date,
  startTime: data.startTime,
  endTime: data.endTime,
  location: data.location,
  latitude: data.latitude,
  longitude: data.longitude,
});

const ScheduleFoodTruck: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleMap, setScheduleMap] = useState<Record<string, TruckEntry[]>>({});
  const [currentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { user, loading: authLoading, role } = useAuth();
  const scheduleApi = useAPI<ApiResponse | null>();
  const submitApi = useAPI();

  const foodTrucks: FoodTruck[] = scheduleApi.data?.foodTrucks || [];

  // ✅ Stable API call with useCallback
  const fetchSchedule = useCallback(() => {
    scheduleApi.callApi(`getScheduledFoodTrucks?month=${currentMonth}`, "GET");
  }, [scheduleApi, currentMonth]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // ✅ Guard against infinite updates
  useEffect(() => {
    if (!scheduleApi.data || scheduleApi.loading) return;

    const newMap = scheduleApi.data.schedules.reduce((acc, entry) => {
      acc[entry.id] = entry.trucks.map((truck) => ({ ...truck, date: entry.id }));
      return acc;
    }, {} as Record<string, TruckEntry[]>);

    setScheduleMap(newMap);
  }, [scheduleApi.data, scheduleApi.loading]);

  const selectedTruck = useMemo(
    () => foodTrucks.find((truck) => truck.id === selectedTruckId) || null,
    [foodTrucks, selectedTruckId]
  );

  const handleDateClick = (date: Date) => {
    if (!selectedTruckId) {
      toast.error("🚨 Please select a food truck before scheduling.");
      return;
    }
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleTruckClick = (truck: TruckEntry) => {
    if (truck.truckId !== selectedTruckId) {
      toast.warn("⚠️ You're viewing another truck's schedule. Select the correct truck first.");
      return;
    }
    setSelectedDate(new Date(truck.date));
    setModalOpen(true);
  };

  const handleScheduleTruck = async (data: ScheduleEntry) => {
    if (!user) {
      toast.error("❌ You must be logged in to schedule a truck.");
      return;
    }
    if (role !== "admin" && role !== "food_truck_owner") {
      toast.error("❌ You do not have permission to schedule a truck.");
      return;
    }

    if (!selectedTruck) return;

    try {
      const payload = formatTruckScheduleData(selectedTruck, selectedTruckId, data);
      const response = await submitApi.callApi("addScheduleEntry", "POST", payload);

      if (response.success) {
        toast.success(`✅ ${selectedTruck.truckName} scheduled successfully!`);
        setScheduleMap((prev) => {
          const copy = { ...prev };
          const key = data.date;
          if (!copy[key]) copy[key] = [];
          copy[key].push(payload);
          return copy;
        });
      } else {
        toast.error(`❌ ${response.error || "Failed to schedule."}`);
      }
    } catch (error: any) {
      toast.error(`❌ ${error.message || "An unexpected error occurred."}`);
    } finally {
      setModalOpen(false);
    }
  };

  if (authLoading) return <div>Loading authentication...</div>;

  return (
    <div className="schedule-container">
      <h3>📅 Food Truck Schedule</h3>

      <label htmlFor="food-truck-filter" className="filter-label">
        Select a Food Truck:
      </label>
      <select
        id="food-truck-filter"
        title="Choose a food truck before scheduling"
        onChange={(e) => setSelectedTruckId(e.target.value)}
        value={selectedTruckId}
        className="dropdown"
      >
        <option value="">Select a Food Truck</option>
        {Object.entries(
          foodTrucks.reduce((acc, truck) => {
            const region = truck.region || "Unspecified Region";
            if (!acc[region]) acc[region] = [];
            acc[region].push(truck);
            return acc;
          }, {} as Record<string, FoodTruck[]>)
        )
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([region, trucks]) => (
            <optgroup key={region} label={region}>
              {trucks
                .sort((a, b) => a.truckName.localeCompare(b.truckName))
                .map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.truckName}
                  </option>
                ))}
            </optgroup>
          ))}
      </select>

      <Calendar
        scheduleMap={scheduleMap}
        selectedEntityId={selectedTruckId}
        onDateClick={handleDateClick}
        onEntryClick={handleTruckClick}
        CalendarGridComponent={(props) => (
          <CalendarGrid
            {...props}
            getEntityId={(entry) => entry.truckId}
            renderEntry={(entry) => (
              <>
                {entry.foodIcon || "🚚"} {entry.truckName}
                <br />
                ({entry.startTime} - {entry.endTime})
              </>
            )}
          />
        )}
      />

      {modalOpen && selectedTruck && selectedDate && (
        <Modal onClose={() => setModalOpen(false)}>
          <ScheduleTruckForm
            selectedDate={selectedDate}
            selectedTruck={selectedTruck}
            onSubmit={handleScheduleTruck}
          />
        </Modal>
      )}
    </div>
  );
};

export default ScheduleFoodTruck;
