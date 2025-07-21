'use client';

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useState, useCallback } from 'react';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 30.0444, // Cairo default
  lng: 31.2357,
};

export default function MapPicker({ onLocationChange }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [marker, setMarker] = useState(center);

  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={marker}
      zoom={12}
      onClick={handleMapClick}
    >
      <Marker position={marker} />
    </GoogleMap>
  );
}
