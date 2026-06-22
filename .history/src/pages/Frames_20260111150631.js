import React, { useState, useEffect } from "react";

// Import all PNG images from ../assets
const importAll = (r) => r.keys().map(r);
const allImages = importAll(require.context("../assets", false, /\.(png)$/));

export default function Frames({ onSelectFrame, orientation }) {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    // Load images and filter by orientation
    const loadFrames = async () => {
      const filteredFrames = await Promise.all(
        allImages.map(
          (src) =>
            new Promise((resolve) => {
              const img = new window.Image();
              img.src = src;
              img.onload = () => {
                const imgOrientation = img.width > img.height ? "landscape" : "portrait";
                if (imgOrientation === orientation) {
                  resolve(src); // Keep this image
                } else {
                  resolve(null); // Ignore
                }
              };
            })
        )
      );

      setFrames(filteredFrames.filter(Boolean)); // Remove nulls
    };

    loadFrames();
  }, [orientation]);

  return (
    <div>
      <h3>Select a Frame</h3>
      <div className="thumbnails">
        {frames.map((img, index) => (
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
