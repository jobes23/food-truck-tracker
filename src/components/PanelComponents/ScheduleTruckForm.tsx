import React, { useState, useEffect } from "react";
import LocationPicker from "./LocationPicker";
import { FoodTruck } from "../../types";

interface ScheduleTruckFormProps {
  selectedTruck: FoodTruck; // ✅ Passed from `ScheduleFoodTruck.tsx`
  selectedDate: Date;
  onSubmit: (data: any) => void;
}

const ScheduleTruckForm: React.FC<ScheduleTruckFormProps> = ({
  selectedTruck,
  selectedDate,
  onSubmit,
}) => {
  const [schedule, setSchedule] = useState({
    truckId: selectedTruck.id,
    date: selectedDate.toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    location: "",
    latitude: 0,
    longitude: 0,
  });

  // ✅ Update truckId & date if `selectedTruck` or `selectedDate` changes
  useEffect(() => {
    setSchedule((prev) => ({
      ...prev,
      truckId: selectedTruck.id,
      date: selectedDate.toISOString().split("T")[0],
    }));
  }, [selectedTruck, selectedDate]);

  // ✅ Function to update lat/lng
  const handleSetCoords = (coords: [number, number]) => {
    setSchedule((prev) => ({
      ...prev,
      latitude: coords[0],
      longitude: coords[1],
    }));
  };

  // ✅ Function to update the location name
  const handleSetAddress = (address: string) => {
    setSchedule((prev) => ({
      ...prev,
      location: address,
    }));
  };

  return (
    <div className="schedule-form">
      <h3>📆 Schedule Food Truck</h3>
      {/* 🚚 Truck Name (Pre-filled, not selectable) */}
      <input
        type="text"
        value={selectedTruck.truckName}
        disabled
        title="Food truck name"
        className="hidden"
      />

      {/* ⏰ Start Time */}
      <label>Start Time:</label>
      <input
        type="time"
        value={schedule.startTime}
        title="Set the starting time for the food truck."
        onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
        required
      />

      {/* ⏳ End Time */}
      <label>End Time:</label>
      <input
        type="time"
        value={schedule.endTime}
        title="Set the ending time for the food truck."
        onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
        required
      />

      {/* 🗺️ Location Picker */}
      <label>Pick a Location:</label>
      <LocationPicker setCoords={handleSetCoords} setAddress={handleSetAddress} />

      {/* 📍 Display Selected Location */}
      {schedule.location && (
        <div className="location-preview">
          <strong>📍 Selected Location:</strong> {schedule.location}
        </div>
      )}

      {/* ✅ Submit Button */}
      <button onClick={() => onSubmit(schedule)} title="Click to save this schedule.">
        Save Schedule
      </button>
    </div>
  );
};

export default ScheduleTruckForm;
