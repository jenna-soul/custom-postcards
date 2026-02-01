import React from 'react';
import ImageEditorKonva from './ImageEditorKonva'; // adjust path if needed
import Frames from './pages/Frames';
import Geolocation from './pages/Geolocation';


function App() {
  return (
    <div className="App">
      <h1>Custom Postcard Editor</h1>
      //<Geolocation/>
      <ImageEditorKonva />
    </div>
  );
}

export default App;
