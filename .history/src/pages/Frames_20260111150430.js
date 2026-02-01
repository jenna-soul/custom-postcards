import React from "react";

/*
Flow Summary
User clicks thumbnail in Frames.
onClick calls the prop function onSelectFrame(img).
Parent (ImageEditorKonva) receives the image path via the prop callback.
Parent calls loadFrame(img).
loadFrame creates a new image and updates frameObj state.
React re-renders the canvas layer with the new frame. 
*/

// Import all PNG images from ../assets
const importAll = (r) => r.keys().map(r);
const images = importAll(require.context("../assets", false, /\.(png)$/));

export default function Frames({ onSelectFrame, orientation  }) {
  const [frames, setFrames] = useState([]);
  return (
    <div>
      <h3>Select a Frame</h3>
      <div
      className="thumbnails"
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`frame-${index}`}
            onClick={() => onSelectFrame(img)}
            onMouseEnter={(e) => (e.currentTarget.style.border = "2px solid orchid")}
            onMouseLeave={(e) => (e.currentTarget.style.border = "2px solid transparent")}
          />
        ))}
      </div>
    </div>
  );
}