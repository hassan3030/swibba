'use client';

import { useState } from 'react';
import MapPicker from '@/components/map/MapPicker';

export default function StoreForm() {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  const handleLocationChange = (lat, lng) => {
    setLocation({ lat, lng });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving store location:', location);
    // Send to backend or API
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Add Store Location</h2>
      <MapPicker onLocationChange={handleLocationChange} />
      <p>Latitude: {location.lat}</p>
      <p>Longitude: {location.lng}</p>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </form>
  );
}
