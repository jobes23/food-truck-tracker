import React from "react";
import { TruckEntry } from "../../types"; // ✅ Ensure we are using the correct type

interface CalendarDaysProps {
  day: Date;
  changeCurrentDay: (day: Date) => void;
  scheduleMap: Record<string, TruckEntry[]>; // ✅ Only `TruckEntry[]` per date
  selectedTruck: string;
  onDateClick: (date: Date) => void;
  onTruckClick: (truck: TruckEntry) => void;
}

const CalendarDays: React.FC<CalendarDaysProps> = ({
  day,
  scheduleMap,
  selectedTruck,
  onDateClick,
  onTruckClick,
}) => {
  const year = day.getFullYear();
  const month = day.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // ✅ Get first day of the month
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // ✅ Get total days in the month

  const days: JSX.Element[] = [];

  // ✅ Fill empty slots before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
  }

  // ✅ Loop through all days of the month
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${dayNum
      .toString()
      .padStart(2, "0")}`;

    // ✅ Get trucks scheduled for this date
    const trucksScheduled = scheduleMap[dateStr] || [];

    // ✅ Filter by selected truck (if applicable)
    const filteredTrucks =
      selectedTruck.length > 0
        ? trucksScheduled.filter((truck) => truck.truckId === selectedTruck)
        : trucksScheduled;

    // ✅ Ensure every day renders inside the grid
    days.push(
      <div
        key={dateStr}
        className={`calendar-cell ${filteredTrucks.length > 0 ? "scheduled" : ""}`}
        onClick={() => onDateClick(new Date(year, month, dayNum))}
      >
        <div className="date-label">{dayNum}</div>

        {/* ✅ Iterate through scheduled trucks */}
        {filteredTrucks.map((truck, index) => (
          <div
            key={`${dateStr}-${index}`}
            className="truck-entry"
            onClick={(e) => {
              e.stopPropagation(); // ✅ Prevent accidental date click
              onTruckClick(truck);
            }}
          >
            {truck.foodIcon || "🚚"} {truck.truckName} <br/>({truck.startTime}-{truck.endTime})
          </div>
        ))}
      </div>
    );
  }

  return <div className="calendar-grid">{days}</div>; // ✅ Ensure the grid structure remains
};

export default CalendarDays;
