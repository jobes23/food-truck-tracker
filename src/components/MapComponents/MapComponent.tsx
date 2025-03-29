import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { createFoodTruckIcon } from "../../utils/FoodTruckUtils";
import { FoodTruck } from "../../types";
import { getAuth } from "firebase/auth";

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

    // Global for inline HTML
    (window as any).toggleFavorite = (truckName: string) => {
      toggleFavorite(truckName);
    };

    (window as any).trackSponsorClick = async (truckName: string, region = "") => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid || null;

      await fetch("https://us-central1-food-truck-tracker-wm.cloudfunctions.net/trackSponsorClick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorId: "axes_and_allies", // Replace with real ID later
          truckName,
          region,
          timestamp: new Date().toISOString(),
          userId,
          source: "popup",
        }),
      });

      window.open("https://www.axesandalliesnc.com/", "_blank");
    };

    foodTrucks.forEach((truck) => {
      const isFavorite = favoriteTrucks.includes(truck.truckName);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${truck.latitude},${truck.longitude}`;
      const region = truck.region || ""; // Optional support

      const marker = L.marker([truck.latitude, truck.longitude], {
        icon: createFoodTruckIcon(truck.status || "closed", isFavorite),
      }).bindPopup(`
        <div style="text-align:center; max-width:250px;">
          ${truck.logo ? `<img src="${truck.logo}" width="100" style="border-radius:8px;" />` : ""}
          <div style="font-weight:bold; font-size:16px; margin-top:8px;">
            ${truck.truckName}
            <span style="cursor:pointer;" onclick="window.toggleFavorite('${truck.truckName}')">
              ${isFavorite ? "⭐" : "☆"}
            </span>
          </div>
          <div>📍 ${truck.location}</div>
          <div>🕒 ${truck.startTime} - ${truck.endTime}</div>
          <div>🍽️ ${truck.cuisine || "Various"}</div>
          <button onclick="window.open('${mapsUrl}', '_blank')" style="margin-top:6px;">📍 Get Directions</button>

          <!-- Sponsor Section -->
          <div style="margin-top:10px; font-size:13px;">
            <a
              href="https://www.axesandalliesnc.com/"
              target="_blank"
              rel="noopener noreferrer"
              onclick="window.trackSponsorClick('${truck.truckName}', '${region}')"
              style="text-decoration:none; color:#007bff;"
            >
              Sponsored by <b>Axes and Allies</b><br/>
              <span style="font-size:12px;">Click to learn more</span>
            </a>
          </div>
        </div>
      `);

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
    <MarkerClusters
      foodTrucks={foodTrucks}
      favoriteTrucks={favoriteTrucks}
      toggleFavorite={toggleFavorite}
    />
  </MapContainer>
);

export default MapComponent;
