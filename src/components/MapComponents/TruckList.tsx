import React from "react";
import { FoodTruck } from "../../types";
import "../../Styles/TruckList.css";

interface Props {
  trucks: FoodTruck[];
  favoriteTrucks: string[];
  toggleFavorite: (truckName: string) => void;
}

const TruckList: React.FC<Props> = ({ trucks, favoriteTrucks, toggleFavorite }) => {
  return (
    <div className="truck-list-container">
      {trucks.map((truck) => {
        const isFavorite = favoriteTrucks.includes(truck.truckName);
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${truck.latitude},${truck.longitude}`;

        return (
          <div key={`${truck.truckName}-${truck.startTime}`} className="truck-card">
            {truck.logo && (
              <img src={truck.logo} alt={`${truck.truckName} logo`} className="truck-logo" />
            )}

            <div className="truck-card-header">
              <h4 className="truck-name">{truck.truckName}</h4>
              <span
                className="favorite-icon"
                onClick={() => toggleFavorite(truck.truckName)}
              >
                {isFavorite ? "⭐" : "☆"}
              </span>
            </div>

            <div className="truck-detail-row">📍 {truck.location || "Unknown location"}</div>
            <div className="truck-detail-row">🕒 {truck.startTime} - {truck.endTime}</div>
            <div className="truck-detail-row">🍽️ {truck.cuisine || "Various"}</div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-button"
            >
              📍 Get Directions
            </a>

            <div className="sponsor-block">
              Sponsored by{" "}
              <a
                href="https://www.axesandalliesnc.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Axes and Allies
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TruckList;
