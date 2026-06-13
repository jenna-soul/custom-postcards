import React, { useState, useEffect } from 'react';
import ImageEditorKonva from './ImageEditorKonva';

const LOCATION_ZONES = [
  {
    name: 'zion',
    label: 'Zion National Park',
    bounds: { minLat: 37.1, maxLat: 37.5, minLon: -113.3, maxLon: -112.8 }
  },
  {
    name: 'ireland',
    label: 'Ireland',
    bounds: { minLat: 51.3, maxLat: 55.5, minLon: -10.7, maxLon: -5.9 }
  },
  {
    name: 'wisconsin',
    label: 'Wisconsin',
    bounds: { minLat: 42.5, maxLat: 47.1, minLon: -92.9, maxLon: -86.2 }
  }
];

function detectLocation(lat, lon) {
  for (const zone of LOCATION_ZONES) {
    const { minLat, maxLat, minLon, maxLon } = zone.bounds;
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
      return zone;
    }
  }
  return null;
}

function App() {
  const [detectedZone, setDetectedZone] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const zone = detectLocation(coords.latitude, coords.longitude);
        setDetectedZone(zone);
      },
      (err) => console.error('Geolocation error:', err)
    );
  }, []);

  return (
    <div className="App">
      <h2 style={{ textAlign: 'center' }}>Create Your Postcard</h2>
      <p style={{ textAlign: 'center', marginBottom: 10 }}>
        1. Take or upload a photo → 2. Choose a frame → 3. Print
      </p>
      {detectedZone && (
        <p style={{ textAlign: 'center', color: 'orchid', fontWeight: 'bold', margin: '4px 0 10px' }}>
          📍 Showing frames for {detectedZone.label}
        </p>
      )}
      <ImageEditorKonva location={detectedZone ? detectedZone.name : null} />
    </div>
  );
}

export default App;
