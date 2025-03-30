import React, { useState, useEffect } from "react";
import TruckList from "./TruckList";
import { FoodTruck } from "../../types";
import "../../Styles/TruckFilter.css";

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
  truckList: FoodTruck[];
  favoriteTrucks: string[];
  toggleFavorite: (truckName: string) => void;
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
  setTimeRange,
  cuisine,
  setCuisine,
  cuisineList,
  truckCount,
  truckList,
  favoriteTrucks,
  toggleFavorite,
  timezone,
  selectedStatuses,
  setSelectedStatuses,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("Today");
  const [activeSection, setActiveSection] = useState<"date" | "cuisine" | "status" | "list" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (selectedStatuses.length === 0) {
      setSelectedStatuses(["open", "closing_soon", "opening_soon"]);
    }
  }, []);

  const handleDateSelection = (option: string) => {
    if (selectedFilter === option) return;
    const now = new Date();
    const newDate = new Date(now);
    if (option === "Tomorrow") newDate.setDate(newDate.getDate() + 1);
    const tzDate = getDateInTimezone(newDate, timezone);
    if (selectedDate !== tzDate) {
      setSelectedFilter(option);
      setSelectedDate(tzDate);
      setTimeRange(5);
    }
  };

  const toggleCuisine = (selected: string) => {
    setCuisine((prev) =>
      prev.includes(selected)
        ? prev.filter((c) => c !== selected)
        : [...prev, selected]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      const updated = prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status];
      return updated.length === 0 ? [] : updated;
    });
  };

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
    setActiveSection(null);
  };

  return (
    <div className="filter-container">
      <div className={`radial-menu `}>
        <button className="center-btn" onClick={handleMenuToggle}>
          {menuOpen ? "✕" : "☰"}
        </button>
        {menuOpen && (
          <>
            <button className="menu-btn" onClick={() => setActiveSection("date")}>📅</button>
            <button className="menu-btn" onClick={() => setActiveSection("cuisine")}>🍽️</button>
            <button className="menu-btn" onClick={() => setActiveSection("status")}>🚦</button>
            <button className="menu-btn" onClick={() => setActiveSection("list")}>📝</button>
          </>
        )}
      </div>

      <p className="truck-count">🚚 {truckCount} food trucks available</p>

      {activeSection === "date" && (
        <div className="date-picker fade-in">
          <label htmlFor="dateFilter">Select Date:</label>
          <select id="dateFilter" value={selectedFilter} onChange={(e) => handleDateSelection(e.target.value)}>
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
          </select>
        </div>
      )}

      {activeSection === "status" && (
        <div className="status-container fade-in">
          {["open", "closing_soon", "opening_soon"].map((status) => (
            <div
              key={status}
              className={`status ${status} ${selectedStatuses.includes(status) ? "selected" : ""}`}
              onClick={() => toggleStatus(status)}
            >
              {status.replace("_", " ")}
            </div>
          ))}
        </div>
      )}

      {activeSection === "cuisine" && (
        <div className="cuisine-options fade-in">
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

      {activeSection === "list" && (
        <div className="truck-list-scrollable fade-in">
          <h4>Available Trucks for {selectedDate}</h4>
          <TruckList
            trucks={truckList}
            favoriteTrucks={favoriteTrucks}
            toggleFavorite={toggleFavorite}
          />
        </div>
      )}
    </div>
  );
};

export default TruckFilter;
