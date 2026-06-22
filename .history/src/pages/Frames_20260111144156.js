import React from "react";

// Import all images from ../assets
const importAll = (r) => r.keys().map(r);
const images = importAll(require.context("../assets", false, /\.(png|jpe?g|svg)$/));

export default function Frames({ onSelectFrame }) {
  return (
    <div>
      <h3>Select a Frame</h3>
      <div
      className="thumbnails"
        style={{
          display: "flex",
          overflowX: "auto",
          padding: "10px 0",
          gap: "10px"
        }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`frame-${index}`}
            style={{
              width: 100,
              height: "auto",
              cursor: "pointer",
              border: "2px solid transparent",
            }}
            onClick={() => onSelectFrame(img)}
            onMouseEnter={(e) => (e.currentTarget.style.border = "2px solid #007bff")}
            onMouseLeave={(e) => (e.currentTarget.style.border = "2px solid transparent")}
          />
        ))}
      </div>
    </div>
  );
}
