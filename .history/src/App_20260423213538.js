import React from 'react';
import ImageEditorKonva from './ImageEditorKonva'; // adjust path if needed
import Frames from './pages/Frames';
import Geolocation from './pages/Geolocation';


function App() {
  return (
    <div className="App">
      <h2 style={{ textAlign: "center" }}>Create Your Postcard</h2>
      <p style={{ textAlign: "center", marginBottom: 10 }}>
        1. Upload an image → 2. Draw or decorate → 3. Prin
      </p>
      <h1>Custom Postcard Editor</h1>
      {/*<Geolocation/>*/}
      <ImageEditorKonva />
      <footer>Build: {new Date().toISOString()}</footer>
    </div>
  );
}

export default App;
