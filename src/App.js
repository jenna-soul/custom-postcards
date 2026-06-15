import React, { useState, useEffect } from 'react';
import ImageEditorKonva from './ImageEditorKonva';
import { detectLocation } from './locationZones';

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
