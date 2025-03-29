// PlaceAutocompleteInput.tsx
import React, { useEffect, useRef } from "react";

interface Props {
  onSelect: (formattedAddress: string) => void;
}

const PlaceAutocompleteInput: React.FC<Props> = ({ onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps?.places?.PlaceAutocompleteElement) return;

    const autocomplete = new (window.google.maps.places as any).PlaceAutocompleteElement();

    // 🧼 Clear existing children to prevent duplicates
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(autocomplete);
    }

    autocomplete.addEventListener("gmp-placeselect", async (e: any) => {
      const place = e.place;
      await place.fetchFields({ fields: ["formattedAddress"] });

      if (place.formattedAddress) {
        onSelect(place.formattedAddress);
      }
    });
  }, []);

  return <div ref={containerRef}></div>;
};

export default PlaceAutocompleteInput;
