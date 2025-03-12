import React, { useState, useEffect } from "react";

interface TruckFilterProps {
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  timeRange: number;
  setTimeRange: React.Dispatch<React.SetStateAction<number>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  cuisine: string[];
  setCuisine: React.Dispatch<React.SetStateAction<string[]>>;
  cuisineList: string[];
  truckCount: number;
  timezone: string;
  selectedStatuses: string[];
  setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
}

const getDateInTimezone = (date: Date, timezone: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Intl.DateTimeFormat("en-CA", options).format(date);
};

const TruckFilter: React.FC<TruckFilterProps> = ({
  selectedDate,
  setSelectedDate,
  timeRange,
  setTimeRange,
  category,
  setCategory,
  cuisine,
  setCuisine,
  cuisineList,
  truckCount,
  timezone,
  selectedStatuses,
  setSelectedStatuses,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("Today");
  const [showCuisinePicker, setShowCuisinePicker] = useState<boolean>(false);

  useEffect(() => {
    console.log(cuisineList)
    if (selectedStatuses.length === 0) {
      setSelectedStatuses(["open", "closing_soon", "opening_soon"]); // ✅ Start with all selected
    }
  }, []);  

  const handleDateSelection = (option: string) => {
    if (selectedFilter === option) return;

    const now = new Date();
    let newDate = new Date(now);
    let newTimeRange = 5;

    switch (option) {
      case "Today":
        break;
      case "Tomorrow":
        newDate.setDate(newDate.getDate() + 1);
        break;
      default:
        return;
    }

    const timezoneCorrectedDate = getDateInTimezone(newDate, timezone);
    if (selectedDate === timezoneCorrectedDate) return;

    setSelectedFilter(option);
    setSelectedDate(timezoneCorrectedDate);
    setTimeRange(newTimeRange);
  };

  // ✅ Toggle Cuisine Selection
  const toggleCuisine = (selectedCuisine: string) => {
    setCuisine((prev) =>
      prev.includes(selectedCuisine)
        ? prev.filter((c) => c !== selectedCuisine)
        : [...prev, selectedCuisine]
    );
  };

  // ✅ Toggle Status Selection
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      const updatedStatuses = prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status];
  
      return updatedStatuses.length === 0 ? ["open", "closing_soon", "opening_soon"] : updatedStatuses;
    });
  };  

  return (
    <div className="filter-popup">
      <label htmlFor="dateFilter">📅 Select Date:</label>
      <select id="dateFilter" value={selectedFilter} onChange={(e) => handleDateSelection(e.target.value)}>
        <option value="Today">Today</option>
        <option value="Tomorrow">Tomorrow</option>
      </select>

      <p>🚚 {truckCount} food trucks available</p>

      {/* ✅ Status Filter */}
      <div className="status-container">
        {["open", "closing_soon", "opening_soon"].map((status) => (
          <div
            key={status}
            className={`status ${status} ${selectedStatuses.includes(status) ? "selected" : ""}`} // ✅ Keeps it visually indicated
            onClick={() => toggleStatus(status)}
          >
            {status.replace("_", " ")}
          </div>
        ))}
      </div>

      {/* ✅ Cuisine Filter - Accordion Picker */}
      <div className="cuisine-picker">
        <button className="cuisine-button" onClick={() => setShowCuisinePicker(!showCuisinePicker)}>
          🍽️ Select Cuisines {cuisine.length > 0 ? `(${cuisine.length})` : ""}
        </button>

        {showCuisinePicker && (
          <div className="cuisine-options">
            {cuisineList.map((c) => (
              <div
                key={c}
                className={`cuisine-item ${cuisine.includes(c) ? "selected" : ""}`}
                onClick={() => toggleCuisine(c)}
              >
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckFilter;
