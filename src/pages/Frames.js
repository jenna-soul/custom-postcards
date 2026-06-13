import React, { useState, useEffect } from "react";

// Keep key (file path) alongside each resolved URL so we can filter by folder name
const ctx = require.context("../assets", true, /\.(png)$/);
const allImageEntries = ctx.keys().map(key => {
  const mod = ctx(key);
  return { key, src: typeof mod === 'string' ? mod : mod.default };
});

export default function Frames({ onSelectFrame, orientation, location }) {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    // When a location is detected, only show frames from that folder
    const entries = location
      ? allImageEntries.filter(({ key }) =>
          key.toLowerCase().includes(location.toLowerCase())
        )
      : allImageEntries;

    const loadFrames = async () => {
      const results = await Promise.all(
        entries.map(({ src }) =>
          new Promise((resolve) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
              const imgOrientation = img.width > img.height ? "landscape" : "portrait";
              resolve(imgOrientation === orientation ? src : null);
            };
            img.onerror = () => resolve(null);
          })
        )
      );
      setFrames(results.filter(Boolean));
    };

    loadFrames();
  }, [orientation, location]);

  const heading = location
    ? `${location.charAt(0).toUpperCase() + location.slice(1)} Frames`
    : "Select a Frame";

  return (
    <div>
      <h3>{heading}</h3>
      {frames.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '8px 0' }}>
          No frames available for this orientation.
        </p>
      ) : (
        <div className="thumbnails">
          {frames.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`frame-${i}`}
              onClick={() => onSelectFrame(src)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
