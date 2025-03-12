import React, { useState, useCallback } from "react";
import { GoogleMap, Marker, useLoadScript, StandaloneSearchBox } from "@react-google-maps/api";

interface LocationPickerProps {
  setCoords: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
}

const libraries: ("places")[] = ["places"]; // ✅ Load Google Places API

const LocationPicker: React.FC<LocationPickerProps> = ({ setCoords, setAddress }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([34.2257, -77.9447]); // Default: Wilmington, NC

  // ✅ When user selects a place from Autocomplete
  const onPlacesChanged = useCallback(() => {
    if (!searchBox) return;
    const places = searchBox.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const formattedAddress = place.formatted_address || place.name || "";

      if (lat && lng) {
        setMarkerPosition([lat, lng]);
        setCoords([lat, lng]);
        setAddress(formattedAddress);
      }
    }
  }, [searchBox, setCoords, setAddress]);

  if (!isLoaded) return <p>Loading map...</p>;

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

      {/* ✅ Google Map */}
      <GoogleMap
        center={{ lat: markerPosition[0], lng: markerPosition[1] }}
        zoom={13}
        mapContainerStyle={{ width: "100%", height: "300px" }}
        onLoad={(map) => setMap(map)}
        onClick={(event) => {
          const lat = event.latLng?.lat();
          const lng = event.latLng?.lng();
          if (lat && lng) {
            setMarkerPosition([lat, lng]);
            setCoords([lat, lng]);

            // ✅ Reverse Geocode to get address from coordinates
            fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`
            )
              .then((res) => res.json())
              .then((data) => {
                if (data.results.length > 0) {
                  setAddress(data.results[0].formatted_address);
                }
              })
              .catch((err) => console.error("Reverse geocoding error:", err));
          }
        }}
      >
        {/* ✅ Draggable Marker for fine-tuning */}
        <Marker
          position={{ lat: markerPosition[0], lng: markerPosition[1] }}
          draggable
          onDragEnd={(event) => {
            const lat = event.latLng?.lat();
            const lng = event.latLng?.lng();
            if (lat && lng) {
              setMarkerPosition([lat, lng]);
              setCoords([lat, lng]);
            }
          }}
        />
      </GoogleMap>
    </div>
  );
};

export default LocationPicker;
