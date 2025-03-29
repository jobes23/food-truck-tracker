import React from "react";
import "../../Styles/Calendar.css";

interface CalendarProps<T> {
  scheduleMap: Record<string, T[]>;
  selectedEntityId?: string;
  onDateClick: (date: Date) => void;
  onEntryClick: (entry: T) => void;
  CalendarGridComponent: React.FC<{
    day: Date;
    changeCurrentDay: (day: Date) => void;
    scheduleMap: Record<string, T[]>;
    selectedEntityId?: string;
    onDateClick: (date: Date) => void;
    onEntryClick: (entry: T) => void;
  }>;
}

function Calendar<T>({
  scheduleMap,
  selectedEntityId,
  onDateClick,
  onEntryClick,
  CalendarGridComponent,
}: CalendarProps<T>) {
  const [currentDay, setCurrentDay] = React.useState(new Date());

  const handleMonthChange = (offset: number) => {
    setCurrentDay((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
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
        <CalendarGridComponent
          day={currentDay}
          changeCurrentDay={setCurrentDay}
          scheduleMap={scheduleMap}
          selectedEntityId={selectedEntityId}
          onDateClick={onDateClick}
          onEntryClick={onEntryClick}
        />
      </div>
    </div>
  );
}

export default Calendar;
