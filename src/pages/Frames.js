import React, { useState, useEffect } from "react";

// Keep key (file path) alongside each resolved URL so we can filter by folder name.
// Only include files inside a subfolder (not root-level assets like logos).
const ctx = require.context("../assets", true, /\.(png|svg)$/);
const allImageEntries = ctx.keys()
  .filter(key => key.split('/').length > 2)
  .map(key => {
    const mod = ctx(key);
    return { key, src: typeof mod === 'string' ? mod : mod.default };
  });

export default function Frames({ onSelectFrame, orientation, location }) {
  const [localFrames, setLocalFrames] = useState([]);
  const [otherFrames, setOtherFrames] = useState([]);

  useEffect(() => {
    const loadFrames = async () => {
      const results = await Promise.all(
        allImageEntries.map(({ key, src }) =>
          new Promise((resolve) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
              const imgOrientation = img.width > img.height ? "landscape" : "portrait";
              if (imgOrientation !== orientation) { resolve(null); return; }
              const isLocal = location && key.toLowerCase().includes(location.toLowerCase());
              resolve({ src, isLocal: !!isLocal });
            };
            img.onerror = () => resolve(null);
          })
        )
      );

      const valid = results.filter(Boolean);
      setLocalFrames(valid.filter(f => f.isLocal).map(f => f.src));
      setOtherFrames(valid.filter(f => !f.isLocal).map(f => f.src));
    };

    loadFrames();
  }, [orientation, location]);

  const locationLabel = location
    ? location.charAt(0).toUpperCase() + location.slice(1)
    : null;

  const totalFrames = localFrames.length + otherFrames.length;

  return (
    <div>
      {totalFrames === 0 ? (
        <>
          <h3>Select a Frame</h3>
          <p style={{ color: '#999', textAlign: 'center', padding: '8px 0' }}>
            No frames available for this orientation.
          </p>
        </>
      ) : (
        <>
          {localFrames.length > 0 && (
            <>
              <h3>{locationLabel} Frames</h3>
              <div className="thumbnails">
                {localFrames.map((src, i) => (
                  <img key={i} src={src} alt={`local-frame-${i}`} onClick={() => onSelectFrame(src)} />
                ))}
              </div>
            </>
          )}

          {otherFrames.length > 0 && (
            <>
              <h3>{localFrames.length > 0 ? 'Other Frames' : 'Select a Frame'}</h3>
              <div className="thumbnails">
                {otherFrames.map((src, i) => (
                  <img key={i} src={src} alt={`frame-${i}`} onClick={() => onSelectFrame(src)} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
