import React from "react";
import { FoodTruck } from "../../types";

interface Props {
  trucks: FoodTruck[];
  favoriteTrucks: string[];
  toggleFavorite: (truckName: string) => void;
}

const TruckList: React.FC<Props> = ({ trucks, favoriteTrucks, toggleFavorite }) => (
  <div className="truck-list">
    {trucks.map((truck) => (
      <div key={`${truck.truckName}-${truck.startTime}`} className="truck-item">
        {truck.truckName} - {truck.status} 
        <button onClick={() => toggleFavorite(truck.truckName)}>
          {favoriteTrucks.includes(truck.truckName) ? "⭐ Unfavorite" : "☆ Favorite"}
        </button>
      </div>
    ))}
  </div>
);

export default TruckList;
