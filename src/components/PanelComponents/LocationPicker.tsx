import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { StandaloneSearchBox, useLoadScript } from "@react-google-maps/api";
import L from "leaflet";

// ✅ Fix Leaflet marker issue with missing icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  setCoords: (coords: [number, number]) => void;
  setAddress: (address: string) => void;
}

const libraries: ("places")[] = ["places"]; // ✅ Load only Places API

const LocationPicker: React.FC<LocationPickerProps> = ({ setCoords, setAddress }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // ✅ Use only Google Places API
    libraries,
  });

  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([34.2257, -77.9447]); // Default: Wilmington, NC
  const mapRef = useRef<any>(null); // ✅ Ref for Leaflet map instance

  // ✅ Function to update map center when marker changes
  const MapUpdater: React.FC<{ position: [number, number] }> = ({ position }) => {
    const map = useMap();
    map.setView(position, 13, { animate: true }); // ✅ Animate map recentering
    return null;
  };

  // ✅ When user selects a place from Autocomplete
  const onPlacesChanged = () => {
    if (!searchBox) return;
    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const formattedAddress = place.formatted_address || place.name || "";

      if (lat && lng) {
        setMarkerPosition([lat, lng]); // ✅ Update marker position
        setCoords([lat, lng]); // ✅ Update parent component state
        setAddress(formattedAddress); // ✅ Update address in parent component

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 13); // ✅ Recenter Leaflet map
        }
      }
    }
  };

  if (!isLoaded) return <p>Loading search box...</p>;

  return (
    <div>
      {/* ✅ Google Places Autocomplete Search Box */}
      <StandaloneSearchBox
        onLoad={(ref) => setSearchBox(ref)}
        onPlacesChanged={onPlacesChanged}
      >
        <input
          type="text"
          placeholder="Search for a business or address..."
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        />
      </StandaloneSearchBox>

      {/* ✅ Leaflet Map with OpenStreetMap tiles */}
      <MapContainer
        center={markerPosition}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
        ref={mapRef} // ✅ Store map instance
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={markerPosition} icon={defaultIcon} />
        <MapUpdater position={markerPosition} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
