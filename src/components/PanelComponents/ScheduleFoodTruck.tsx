import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Calendar from "./Calendar";
import useAPI from "../../hooks/useAPI";
import Modal from "../Modal";
import ScheduleTruckForm from "./ScheduleTruckForm";
import "../../Styles/ScheduleFoodTruck.css";
import { useAuth } from "../../context/AuthContext";
import { ApiResponse, FoodTruck, ScheduleEntry, TruckEntry } from "../../types";

const ScheduleFoodTruck: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleMap, setScheduleMap] = useState<Record<string, TruckEntry[]>>({}); // ✅ Added useState

  // ✅ Use useAuth to get the current user and loading state
  const { user, loading: authLoading, role } = useAuth();

  // ✅ Use `useAPI` to fetch schedules & food trucks
  const { data, callApi: fetchSchedules } = useAPI<ApiResponse | null>();
  const { callApi: scheduleTruckApi } = useAPI();

  // ✅ Load schedules when the component mounts - NO AUTH REQUIRED
  useEffect(() => {
    const monthYear = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    fetchSchedules(`getScheduledFoodTrucks?month=${monthYear}`, "GET");
  }, [fetchSchedules]);

  const foodTrucks: FoodTruck[] = data?.foodTrucks || [];
  const schedules: ScheduleEntry[] = data?.schedules || [];

  // ✅ Update `scheduleMap` when `schedules` data changes
  useEffect(() => {
    const newScheduleMap = schedules.reduce(
      (acc, entry) => {
        acc[entry.id] = entry.trucks.map((truck) => ({
          ...truck,
          date: entry.id, // ✅ Ensure each truck object contains the date
        }));
        return acc;
      },
      {} as Record<string, TruckEntry[]>
    );
    setScheduleMap(newScheduleMap);
  }, [schedules]); // ✅ Runs when schedules change

  // ✅ Get the selected food truck details
  const selectedTruck = foodTrucks.find((truck) => truck.id === selectedTruckId) || null;

  // ✅ Handle clicking a date (Only opens if a truck is selected)
  const handleDateClick = (date: Date) => {
    if (!selectedTruckId) {
      toast.error("🚨 Please select a food truck before scheduling.");
      return;
    }

    setSelectedDate(date);
    setModalOpen(true);
  };

  // ✅ Handle clicking a scheduled truck (edit mode)
  const handleTruckClick = (truck: TruckEntry) => {
    if (truck.truckId !== selectedTruckId) {
      toast.warn("⚠️ You're viewing another truck's schedule. Select the correct truck first.");
      return;
    }

    setSelectedDate(new Date(truck.date));
    setModalOpen(true);
  };

  const handleScheduleTruck = async (scheduleData: ScheduleEntry) => {
      if (!user) {
          toast.error("❌ You must be logged in to schedule a truck.");
          return; 
      }
      if (role !== 'admin' && role !== 'food_truck_owner') {
          toast.error("❌ You do not have permission to schedule a truck.");
          return;
      }
  
      try {
          const formattedData = {
              truckId: selectedTruckId,
              truckName: selectedTruck?.truckName || "",
              cuisine: selectedTruck?.cuisine || "",
              logo: selectedTruck?.logo || "",
              social: selectedTruck?.social,
              website: selectedTruck?.website,
              date: scheduleData.date,
              startTime: scheduleData.startTime,
              endTime: scheduleData.endTime,
              location: scheduleData.location,
              latitude: scheduleData.latitude,
              longitude: scheduleData.longitude,
              foodIcon: selectedTruck?.foodIcon,
          };
  
          const response = await scheduleTruckApi("addScheduleEntry", "POST", formattedData, {}, true);
  
          if (response.success) {
              toast.success(`✅ ${selectedTruck?.truckName} scheduled successfully!`);

              // ✅ Update state directly without another API call
              setScheduleMap((prevMap) => {
                  const updatedMap = { ...prevMap };
                  
                  // ✅ Get the correct date in `YYYY-MM-DD` format
                  const dateKey = scheduleData.date;
  
                  // ✅ If the date already exists, append to it, otherwise create a new entry
                  if (!updatedMap[dateKey]) {
                      updatedMap[dateKey] = [];
                  }
                  updatedMap[dateKey].push(formattedData);
  
                  return updatedMap;
              });

          } else {
              toast.error(`❌ ${response.error || "Failed to schedule."}`);
          }
          setModalOpen(false);
      } catch (error: any) {
          toast.error(`❌ ${error.message || "An unexpected error occurred."}`);
          setModalOpen(false);
      }
  };

  // Show loading indicator while authentication is in progress
  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div className="schedule-container">
      <h3>📅 Food Truck Schedule</h3>

      {/* 🟢 Food Truck Selection (Must select before opening modal) */}
      <label htmlFor="food-truck-filter" className="filter-label">Select a Food Truck:</label>
      <select
        id="food-truck-filter"
        title="Choose a food truck before scheduling"
        onChange={(e) => setSelectedTruckId(e.target.value)}
        value={selectedTruckId}
        className="dropdown"
      >
        <option value="">Select a Food Truck</option>
        {foodTrucks.map((truck) => (
          <option key={truck.id} value={truck.id}>
            {truck.truckName}
          </option>
        ))}
      </select>

      {/* 🟢 Calendar */}
      <Calendar
        scheduleMap={scheduleMap} // ✅ Now coming from state
        selectedTruck={selectedTruckId}
        onDateClick={handleDateClick}
        onTruckClick={handleTruckClick}
      />

      {/* 🟢 Modal for Scheduling */}
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
