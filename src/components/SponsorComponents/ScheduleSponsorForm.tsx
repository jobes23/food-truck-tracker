import React, { useState } from "react";
import { Sponsor } from "../../types";

interface ScheduleSponsorFormProps {
  selectedDate: Date;
  sponsor: Sponsor;
  onSubmit: (data: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    location?: string;
    placement: "popup" | "footer";
  }) => void;
}

const ScheduleSponsorForm: React.FC<ScheduleSponsorFormProps> = ({
  selectedDate,
  sponsor,
  onSubmit,
}) => {
  const [startDate, setStartDate] = useState(selectedDate.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(startDate);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("16:00");
  const [location, setLocation] = useState("");
  const [placement, setPlacement] = useState<"popup" | "footer">("popup");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      placement,
    });
  };

  return (
    <form className="schedule-form" onSubmit={handleSubmit}>
      <h4>📅 Schedule Sponsorship for {sponsor.name}</h4>

      <div>
        <label htmlFor="startDate">Start Date</label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="endDate">End Date</label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="startTime">Start Time</label>
        <input
          id="startTime"
          name="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="endTime">End Time</label>
        <input
          id="endTime"
          name="endTime"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="location">Location (optional)</label>
        <input
          id="location"
          name="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Main Stage, Welcome Tent"
        />
      </div>

      <div>
        <label htmlFor="placement">Placement</label>
        <select
          id="placement"
          name="placement"
          value={placement}
          onChange={(e) => setPlacement(e.target.value as "popup" | "footer")}
        >
          <option value="popup">Popup</option>
          <option value="footer">Footer</option>
        </select>
      </div>

      <button type="submit">✅ Confirm Schedule</button>
    </form>
  );
};

export default ScheduleSponsorForm;
