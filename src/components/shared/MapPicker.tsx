import React, { useCallback, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface MapPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  initialPosition?: { lat: number; lng: number };
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 36.7538, lng: 3.0588 }; // Example: Algiers

export default function MapPicker({
  open,
  onClose,
  onSelect,
  initialPosition,
}: MapPickerProps) {
  const [marker, setMarker] = useState(initialPosition || defaultCenter);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarker({ lat, lng });
        onSelect(lat, lng);
        onClose();
      }
    },
    [onSelect, onClose]
  );

  if (!open) return null;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-4 w-[90vw] max-w-xl">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker}
          zoom={12}
          onClick={onMapClick}
        >
          <Marker position={marker} />
        </GoogleMap>
        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
