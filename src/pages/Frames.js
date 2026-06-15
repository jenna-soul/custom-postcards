import React, { useState, useEffect } from "react";
import { LOCATION_ZONES } from "../locationZones";

const ctx = require.context("../assets", true, /\.(png|svg)$/);
const allImageEntries = ctx.keys()
  .filter(key => key.split('/').length > 2)
  .map(key => {
    const mod = ctx(key);
    return { key, src: typeof mod === 'string' ? mod : mod.default };
  });

function getZoneForKey(key) {
  const lowerKey = key.toLowerCase();
  return LOCATION_ZONES.find(z => lowerKey.includes(z.name.toLowerCase())) || null;
}

export default function Frames({ onSelectFrame, orientation, location }) {
  const [localFrames, setLocalFrames] = useState([]);
  const [otherByZone, setOtherByZone] = useState({});
  const [genericFrames, setGenericFrames] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

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
              const zone = getZoneForKey(key);
              const isLocal = location && zone && zone.name.toLowerCase() === location.toLowerCase();
              resolve({ src, zone, isLocal: !!isLocal });
            };
            img.onerror = () => resolve(null);
          })
        )
      );

      const valid = results.filter(Boolean);
      setLocalFrames(valid.filter(f => f.isLocal).map(f => f.src));

      const byZone = {};
      const generic = [];
      valid.filter(f => !f.isLocal).forEach(f => {
        if (f.zone) {
          if (!byZone[f.zone.name]) byZone[f.zone.name] = { label: f.zone.label, frames: [] };
          byZone[f.zone.name].frames.push(f.src);
        } else {
          generic.push(f.src);
        }
      });
      setOtherByZone(byZone);
      setGenericFrames(generic);
    };

    setActiveFilter(null);
    loadFrames();
  }, [orientation, location]);

  const locationLabel = location
    ? (LOCATION_ZONES.find(z => z.name === location)?.label || location.charAt(0).toUpperCase() + location.slice(1))
    : null;

  const otherZoneNames = Object.keys(otherByZone);
  const hasOther = otherZoneNames.length > 0 || genericFrames.length > 0;
  const hasAnyFrames = localFrames.length > 0 || hasOther;

  let filteredOther;
  if (!activeFilter) {
    filteredOther = [
      ...otherZoneNames.flatMap(zn => otherByZone[zn].frames),
      ...genericFrames,
    ];
  } else if (activeFilter === '__generic__') {
    filteredOther = genericFrames;
  } else {
    filteredOther = otherByZone[activeFilter]?.frames || [];
  }

  const toggleFilter = (key) => setActiveFilter(prev => prev === key ? null : key);

  return (
    <div>
      {!hasAnyFrames ? (
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

          {hasOther && (
            <>
              <h3>{localFrames.length > 0 ? 'Other Frames' : 'Select a Frame'}</h3>

              {otherZoneNames.length > 0 && (
                <div className="location-chips">
                  <button
                    className={`location-chip${!activeFilter ? ' active' : ''}`}
                    onClick={() => setActiveFilter(null)}
                  >
                    All
                  </button>
                  {otherZoneNames.map(zn => (
                    <button
                      key={zn}
                      className={`location-chip${activeFilter === zn ? ' active' : ''}`}
                      onClick={() => toggleFilter(zn)}
                    >
                      {otherByZone[zn].label}
                    </button>
                  ))}
                  {genericFrames.length > 0 && (
                    <button
                      className={`location-chip${activeFilter === '__generic__' ? ' active' : ''}`}
                      onClick={() => toggleFilter('__generic__')}
                    >
                      General
                    </button>
                  )}
                </div>
              )}

              <div className="thumbnails">
                {filteredOther.map((src, i) => (
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
