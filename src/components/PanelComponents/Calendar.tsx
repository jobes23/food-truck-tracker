import React from "react";
import CalendarDays from "./CalendarDays";
import "../../Styles/Calendar.css";
import { TruckEntry } from "../../types"; // ✅ Import `TruckEntry`

interface CalendarProps {
  scheduleMap: Record<string, TruckEntry[]>; // ✅ Ensure it's a map of `TruckEntry[]`
  selectedTruck: string;
  onDateClick: (date: Date) => void;
  onTruckClick: (truck: TruckEntry) => void; // ✅ Expect `TruckEntry` here
}

const Calendar: React.FC<CalendarProps> = ({
  scheduleMap,
  selectedTruck,
  onDateClick,
  onTruckClick,
}) => {
  const [currentDay, setCurrentDay] = React.useState(new Date());

  const handleMonthChange = (change: number) => {
    setCurrentDay((prev) => new Date(prev.getFullYear(), prev.getMonth() + change, 1));
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => handleMonthChange(-1)}>⬅</button>
        <div className="calendar-month">
          {currentDay.toLocaleString("default", { month: "long", year: "numeric" })}
        </div>
        <button onClick={() => handleMonthChange(1)}>➡</button>
      </div>

      <div className="calendar-body">
        <CalendarDays
          day={currentDay}
          changeCurrentDay={setCurrentDay}
          scheduleMap={scheduleMap}
          selectedTruck={selectedTruck}
          onDateClick={onDateClick}
          onTruckClick={onTruckClick} // ✅ Ensure it's correctly passed
        />
      </div>
    </div>
  );
};

export default Calendar;
