import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBorderNone,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faUpload,
  faPrint,
  faRotate,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import Frames from "./pages/Frames";

const POSTCARD_SIZES = {
  portrait:  { width: 400, height: 600 },
  landscape: { width: 600, height: 400 }
};

const MAX_SCALE = 3;

const ImageEditorKonva = ({ location }) => {
  const [imageUrl,    setImageUrl]    = useState(null);
  const [imageScale,  setImageScale]  = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [frameUrl,    setFrameUrl]    = useState(null);
  const [orientation, setOrientation] = useState("landscape");
  // useImage handles all load-timing concerns for Konva
  const [imageObj]  = useImage(imageUrl  || '');
  const [frameObj]  = useImage(frameUrl  || '');

  const stageRef = useRef(null);

  const CANVAS_WIDTH  = POSTCARD_SIZES[orientation].width;
  const CANVAS_HEIGHT = POSTCARD_SIZES[orientation].height;

  // ── Scale helpers ──────────────────────────────────────────────────────────

  const fitImageToFrame = (img) => {
    if (!img) return;
    const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
    setImageScale(scale);
    setImagePosition({
      x: (CANVAS_WIDTH  - img.width  * scale) / 2,
      y: (CANVAS_HEIGHT - img.height * scale) / 2
    });
  };

  const getMinCoverScale = () => {
    if (!imageObj) return 1;
    return Math.max(CANVAS_WIDTH / imageObj.width, CANVAS_HEIGHT / imageObj.height);
  };

  const clampPosition = (x, y, scale = imageScale) => {
    if (!imageObj) return { x, y };
    const imgW = imageObj.width  * scale;
    const imgH = imageObj.height * scale;
    return {
      x: Math.max(Math.min(0, CANVAS_WIDTH  - imgW), Math.min(0, x)),
      y: Math.max(Math.min(0, CANVAS_HEIGHT - imgH), Math.min(0, y))
    };
  };

  // When a new image loads, auto-match canvas orientation to the photo,
  // then fit it. If orientation doesn't change the other effect won't fire,
  // so we call fitImageToFrame directly in that case.
  useEffect(() => {
    if (!imageObj) return;
    const autoOrientation = imageObj.width >= imageObj.height ? 'landscape' : 'portrait';
    if (autoOrientation === orientation) {
      fitImageToFrame(imageObj);
    } else {
      setOrientation(autoOrientation); // orientation effect will fit the image
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageObj]);

  // Re-fit image and clear mismatched frame whenever orientation changes
  useEffect(() => {
    if (frameObj) {
      const frameIs = frameObj.width > frameObj.height ? "landscape" : "portrait";
      if (frameIs !== orientation) setFrameUrl(null);
    }
    if (imageObj) fitImageToFrame(imageObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation]);

  // ── Frame ──────────────────────────────────────────────────────────────────

  const loadFrame = (src) => {
    setFrameUrl(src || null);
    if (src) {
      // Auto-switch orientation to match the frame
      const img = new window.Image();
      img.onload = () =>
        setOrientation(img.width > img.height ? "landscape" : "portrait");
      img.src = src;
    }
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  // createImageBitmap with imageOrientation:'from-image' bakes EXIF rotation
  // into the pixel data so portrait phone photos aren't displayed sideways.
  // The corrected bitmap is drawn to a canvas and exported as a data URL.

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const canvas = document.createElement('canvas');
      canvas.width  = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      bitmap.close();
      setImageUrl(canvas.toDataURL('image/jpeg', 0.92));
    } catch {
      // Fallback for browsers that don't support imageOrientation option
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Zoom ───────────────────────────────────────────────────────────────────

  const zoom = (direction) => {
    if (!imageObj) return;
    const minScale = getMinCoverScale();
    const factor   = direction === "in" ? 1.2 : 1 / 1.2;

    setImageScale(prevScale => {
      const nextScale  = Math.max(minScale, Math.min(prevScale * factor, MAX_SCALE));
      const centerX    = CANVAS_WIDTH  / 2;
      const centerY    = CANVAS_HEIGHT / 2;
      const imgCenterX = (centerX - imagePosition.x) / prevScale;
      const imgCenterY = (centerY - imagePosition.y) / prevScale;
      const clamped    = clampPosition(
        centerX - imgCenterX * nextScale,
        centerY - imgCenterY * nextScale,
        nextScale
      );
      setImagePosition(clamped);
      return nextScale;
    });
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  // Uses @media print on the main window — the only reliable approach on mobile
  // (iOS Safari ignores iframe print entirely).

  const handlePrint = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
    const size    = orientation === 'landscape' ? '6in 4in' : '4in 6in';

    const style = document.createElement('style');
    style.id = '__print-style';
    style.textContent = `
      @media print {
        @page { size: ${size}; margin: 0; }
        body > *:not(#__print-overlay) { display: none !important; visibility: hidden !important; }
        #__print-overlay {
          display: block !important; visibility: visible !important;
          position: fixed; inset: 0; width: 100%; height: 100%;
        }
        #__print-overlay img {
          display: block; width: 100%; height: 100%; object-fit: fill;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    const overlay = document.createElement('div');
    overlay.id = '__print-overlay';
    // Off-screen instead of display:none so the browser actually decodes the image
    overlay.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:600px;height:400px;overflow:hidden;';
    overlay.innerHTML = `<img src="${dataURL}" style="width:100%;height:100%;object-fit:fill;" />`;

    const cleanup = () => {
      document.getElementById('__print-style')?.remove();
      document.getElementById('__print-overlay')?.remove();
      window.onafterprint = null;
    };

    document.head.appendChild(style);
    document.body.appendChild(overlay);
    window.onafterprint = cleanup;

    const img = overlay.querySelector('img');
    if (img.complete) {
      window.print();
    } else {
      img.onload = () => window.print();
      img.onerror = () => window.print();
    }
  };

  // ── Orientation toggle ─────────────────────────────────────────────────────

  const toggleOrientation = () =>
    setOrientation(prev => prev === "landscape" ? "portrait" : "landscape");

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="editor-wrapper">

      <div className="sidebar">
        <p className="sidebar-label">Orientation</p>
        <button className="controls" onClick={() => setOrientation("portrait")}>Portrait</button>
        <button className="controls" onClick={() => setOrientation("landscape")}>Landscape</button>
        <button className="controls" onClick={toggleOrientation}>
          <FontAwesomeIcon icon={faRotate} /> Flip
        </button>

        <hr className="sidebar-divider" />

        <button className="controls" onClick={() => loadFrame(null)}>
          <FontAwesomeIcon icon={faBorderNone} /> Clear Frame
        </button>

        <hr className="sidebar-divider" />

        <p className="sidebar-label">Zoom</p>
        <div className="zoom-row">
          <button
            className="controls zoom-btn"
            onClick={() => zoom("in")}
            disabled={!imageObj || imageScale >= MAX_SCALE}
          >
            <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
          </button>
          <button
            className="controls zoom-btn"
            onClick={() => zoom("out")}
            disabled={!imageObj || imageScale <= getMinCoverScale()}
          >
            <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
          </button>
        </div>

        <hr className="sidebar-divider" />

        <p className="sidebar-label">Photo</p>
        {/* Opens rear camera directly on mobile */}
        <label htmlFor="camera-capture" className="controls">
          <FontAwesomeIcon icon={faCamera} /> Take Photo
        </label>
        <input
          id="camera-capture"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />

        {/* Choose from gallery / file system */}
        <label htmlFor="file-upload" className="controls">
          <FontAwesomeIcon icon={faUpload} /> Upload
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />

        <hr className="sidebar-divider" />

        <button className="controls print-btn" onClick={handlePrint}>
          <FontAwesomeIcon icon={faPrint} /> Print
        </button>
      </div>

      <div className="content">
        <div
          id="printableArea"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, position: 'relative' }}
        >
          <Stage ref={stageRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>

            {/* Layer 1 – user photo */}
            <Layer>
              {imageObj && (
                <KonvaImage
                  image={imageObj}
                  x={imagePosition.x}
                  y={imagePosition.y}
                  width={imageObj.width  * imageScale}
                  height={imageObj.height * imageScale}
                  draggable
                  dragBoundFunc={(pos) => clampPosition(pos.x, pos.y)}
                  onDragEnd={(e) =>
                    setImagePosition({ x: e.target.x(), y: e.target.y() })
                  }
                />
              )}
            </Layer>

            {/* Layer 2 – frame overlay (always on top, non-interactive) */}
            <Layer>
              {frameObj && (
                <KonvaImage
                  image={frameObj}
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  listening={false}
                />
              )}
            </Layer>

          </Stage>

          {/* Empty state — clicking opens the file picker */}
          {!imageObj && (
            <label htmlFor="file-upload" className="canvas-empty-state">
              <FontAwesomeIcon icon={faCamera} size="2x" />
              <span>Tap to add a photo</span>
            </label>
          )}
        </div>

        <Frames
          onSelectFrame={(src) => loadFrame(src)}
          orientation={orientation}
          location={location}
        />
      </div>


    </div>
  );
};

export default ImageEditorKonva;
