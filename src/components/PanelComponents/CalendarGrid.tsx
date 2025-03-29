import React from "react";

interface CalendarGridProps<T> {
  day: Date;
  changeCurrentDay: (day: Date) => void;
  scheduleMap: Record<string, T[]>;
  selectedEntityId?: string;
  onDateClick: (date: Date) => void;
  onEntryClick: (entry: T) => void;
  getEntityId: (entry: T) => string;
  renderEntry: (entry: T) => React.ReactNode;
}

function CalendarGrid<T>({
  day,
  scheduleMap,
  selectedEntityId,
  onDateClick,
  onEntryClick,
  getEntityId,
  renderEntry,
}: CalendarGridProps<T>) {
  const year = day.getFullYear();
  const month = day.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: JSX.Element[] = [];

  // Weekday headers
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fill initial empty cells
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
  }

  // Fill day cells
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const entriesForDay = scheduleMap[dateStr] || [];

    const filteredEntries =
      selectedEntityId && selectedEntityId.length > 0
        ? entriesForDay.filter((entry) => getEntityId(entry) === selectedEntityId)
        : entriesForDay;

    days.push(
      <div
        key={dateStr}
        className={`calendar-cell ${filteredEntries.length > 0 ? "scheduled" : ""}`}
        onClick={() => onDateClick(new Date(year, month, dayNum))}
      >
        <div className="date-label">{dayNum}</div>

        {filteredEntries.map((entry, index) => (
          <div
            key={`${dateStr}-${index}`}
            className="data-entry"
            onClick={(e) => {
              e.stopPropagation();
              onEntryClick(entry);
            }}
          >
            {renderEntry(entry)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="table-header">
        {weekdays.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid">{days}</div>
    </>
  );
}

export default CalendarGrid;
