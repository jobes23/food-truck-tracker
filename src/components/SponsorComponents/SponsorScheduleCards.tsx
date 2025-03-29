import React from "react";
import { SponsorScheduleEntry } from "./ScheduleSponsor";
import "../../Styles/SponsorScheduleCards.css";


interface SponsorScheduleCardsProps {
  entries: SponsorScheduleEntry[];
}

const SponsorScheduleCards: React.FC<SponsorScheduleCardsProps> = ({ entries }) => {
  if (entries.length === 0) {
    return <p>No scheduled sponsors this month.</p>;
  }

  return (
    <div className="sponsor-card-container">
      {entries.map((entry) => (
        <div className="sponsor-card" key={`${entry.sponsorId}-${entry.startDate}`}>
          <div className="sponsor-card-header">
            {entry.logo && <img src={entry.logo} alt={entry.sponsorName} />}
            <div>
              <div><strong>{entry.sponsorName}</strong></div>
              <div className="sponsor-card-region">{entry.region}</div>
            </div>
          </div>
          <div className="sponsor-card-body">
            <div className="sponsor-card-dates">
              {entry.startDate} – {entry.endDate}
            </div>
            <div>{entry.startTime} - {entry.endTime}</div>
            {entry.location && <div><strong>Location:</strong> {entry.location}</div>}
            <div><strong>Placement:</strong> {entry.placement}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SponsorScheduleCards;
