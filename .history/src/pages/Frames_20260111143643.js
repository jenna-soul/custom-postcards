import React from "react";

// Function to import all images from a folder
const importAll = (r) => r.keys().map(r);

// Import all images from ../assets folder (adjust path if needed)
const images = importAll(require.context("../assets", false, /\.(png|jpe?g|svg)$/));

export default function Frames() {
  return (
    <div>
      <h3>Frames from Component</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {images.map((img, index) => (
            <a href="https://google.com">
                <img
                    key={index}
                          src={img}
                          alt={`asset-${index}`}
                          className='thumbnails'
                            />
                  </a>
        ))}
      </div>
    </div>
  );
}
