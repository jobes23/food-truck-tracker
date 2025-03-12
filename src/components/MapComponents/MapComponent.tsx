import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { FoodTruck, createFoodTruckIcon } from "../../utils/FoodTruckUtils";

interface Props {
  foodTrucks: FoodTruck[];
  favoriteTrucks: string[];
  toggleFavorite: (truckName: string) => void;
}

const MarkerClusters: React.FC<Props> = ({ foodTrucks, favoriteTrucks, toggleFavorite }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const markers = L.markerClusterGroup({
      maxClusterRadius: 80,
      disableClusteringAtZoom: 10,
    });

    foodTrucks.forEach((truck) => {
      const isFavorite = favoriteTrucks.includes(truck.truckName);

      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${truck.latitude},${truck.longitude}`;

      const marker = L.marker([truck.latitude, truck.longitude], {
        icon: createFoodTruckIcon(truck.status || "closed", isFavorite),
      }).bindPopup(
        `<div style="text-align: center;">
          ${truck.logo ? `<img src="${truck.logo}" width="100" />` : ""}
          <br />
          <b>${truck.truckName}</b>
          <br />
          📍 ${truck.location}
          <br />
          🕒 ${truck.startTime} - ${truck.endTime}
          <br />
          🍽️ ${truck.cuisine || "Various"}
          <br />
          <button onclick="window.toggleFavorite('${truck.truckName}')">
            ${isFavorite ? "⭐ Unfavorite" : "☆ Favorite"}
          </button>
          <br />
          <button onclick="window.open('${mapsUrl}', '_blank')">📍 Get Directions</button>
        </div>`
      );
      markers.addLayer(marker);
    });

    map.addLayer(markers);
    return () => {
      map.removeLayer(markers);
    };
  }, [map, foodTrucks, favoriteTrucks]);

  return null;
};

const MapComponent: React.FC<Props> = ({ foodTrucks, favoriteTrucks, toggleFavorite }) => (
  <MapContainer center={[34.2257, -77.9447]} zoom={11} style={{ height: "100vh", width: "100%" }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <MarkerClusters foodTrucks={foodTrucks} favoriteTrucks={favoriteTrucks} toggleFavorite={toggleFavorite} />
  </MapContainer>
);

export default MapComponent;
