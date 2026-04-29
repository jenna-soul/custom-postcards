import React, { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect } from "react-konva";
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBorderNone } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus, faUpload, faPrint, faRotate } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from "react";
import Frames from "./pages/Frames";

const ImageEditorKonva = () => {

  const [imageObj, setImageObj] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [lines, setLines] = useState([]);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const isDrawing = useRef(false);

  const MAX_SCALE = 3;

  const [frameObj, setFrameObj] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const loadFrame = (src) => {
    if (!src) {
      setFrameObj(null);
      return;
    }
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setFrameObj(img);
      if (img.width > img.height) {
        setOrientation("landscape");
      } else {
        setOrientation("portrait");
      }
    };
  };

  const POSTCARD_SIZES = {
    portrait: { width: 400, height: 600 },
    landscape: { width: 600, height: 400 }
  };

  const [orientation, setOrientation] = useState("landscape");

  const CANVAS_WIDTH = POSTCARD_SIZES[orientation].width;
  const CANVAS_HEIGHT = POSTCARD_SIZES[orientation].height;

  const fitImageToFrame = (img) => {
    const scaleX = CANVAS_WIDTH / img.width;
    const scaleY = CANVAS_HEIGHT / img.height;
    const scale = Math.max(scaleX, scaleY);
    const x = (CANVAS_WIDTH - img.width * scale) / 2;
    const y = (CANVAS_HEIGHT - img.height * scale) / 2;
    setImageScale(scale);
    setImagePosition({ x, y });
  };

  useEffect(() => {
    if (!frameObj) return;
    const frameOrientation = frameObj.width > frameObj.height ? "landscape" : "portrait";
    if (frameOrientation !== orientation) {
      setFrameObj(null);
      setSelectedFrame(null);
    }
  }, [orientation]);

  const getMinCoverScale = () => {
    if (!imageObj) return 1;
    return Math.max(CANVAS_WIDTH / imageObj.width, CANVAS_HEIGHT / imageObj.height);
  };

  const clampPosition = (x, y, scale = imageScale) => {
    if (!imageObj) return { x, y };
    const imgWidth = imageObj.width * scale;
    const imgHeight = imageObj.height * scale;
    const minX = Math.min(0, CANVAS_WIDTH - imgWidth);
    const minY = Math.min(0, CANVAS_HEIGHT - imgHeight);
    return {
      x: Math.max(minX, Math.min(0, x)),
      y: Math.max(minY, Math.min(0, y))
    };
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result;
      img.onload = () => {
        setImageObj(img);
        fitImageToFrame(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const zoom = (direction) => {
    if (!imageObj) return;
    const minScale = getMinCoverScale();
    const factor = direction === "in" ? 1.2 : 1 / 1.2;
    setImageScale(prevScale => {
      const nextScale = Math.max(minScale, Math.min(prevScale * factor, MAX_SCALE));
      const centerX = CANVAS_WIDTH / 2;
      const centerY = CANVAS_HEIGHT / 2;
      const imageCenterX = (centerX - imagePosition.x) / prevScale;
      const imageCenterY = (centerY - imagePosition.y) / prevScale;
      const newX = centerX - imageCenterX * nextScale;
      const newY = centerY - imageCenterY * nextScale;
      const clamped = clampPosition(newX, newY, nextScale);
      setImagePosition(clamped);
      return nextScale;
    });
  };

  return (
    <div style={{ display: "flex", gap: 16, padding: 16, alignItems: "flex-start" }}>

      {/* LEFT SIDEBAR — 3/12 */}
      <div style={{
        flex: "0 0 25%",
        maxWidth: "25%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>

        {/* Upload */}
        <label htmlFor="file-upload" className="custom-file-upload" style={{ width: "100%", boxSizing: "border-box" }}>
          <FontAwesomeIcon icon={faUpload} style={{ marginRight: 6 }} />
          Upload Image
        </label>
        <input
          id="file-upload"
          className="controls"
          type="file"
          accept="image/*"
          onChange={handleUpload}
        />

        {/* Print */}
        <button
          className="controls"
          onClick={() => window.print()}
          style={{ cursor: "pointer", width: "100%" }}
        >
          <FontAwesomeIcon icon={faPrint} style={{ marginRight: 6 }} />
          Print
        </button>

        <hr style={{ margin: "4px 0" }} />

        {/* Orientation */}
        <button
          className="controls"
          onClick={() => setOrientation("portrait")}
          style={{ width: "100%" }}
        >
          Portrait
        </button>

        <button
          className="controls"
          onClick={() => setOrientation("landscape")}
          style={{ width: "100%" }}
        >
          Landscape
        </button>

        <button
          className="controls"
          onClick={() => setOrientation(o => o === "portrait" ? "landscape" : "portrait")}
          style={{ width: "100%" }}
        >
          <FontAwesomeIcon icon={faRotate} style={{ marginRight: 6 }} />
          Rotate
        </button>

        <hr style={{ margin: "4px 0" }} />

        {/* Clear */}
        <button
          className="controls"
          onClick={() => {
            setLines([]);
            setSelectedFrame(null);
            loadFrame(null);
          }}
          style={{ width: "100%" }}
        >
          <FontAwesomeIcon icon={faBorderNone} style={{ marginRight: 6 }} />
          Clear
        </button>

        <hr style={{ margin: "4px 0" }} />

        {/* Zoom */}
        <button
          className="zoomControls"
          onClick={() => zoom("in")}
          disabled={!imageObj || imageScale >= MAX_SCALE}
          style={{ width: "100%" }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} style={{ marginRight: 6 }} />
          Zoom In
        </button>

        <button
          className="zoomControls"
          onClick={() => zoom("out")}
          disabled={!imageObj || imageScale <= getMinCoverScale()}
          style={{ width: "100%" }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} style={{ marginRight: 6 }} />
          Zoom Out
        </button>

      </div>

      {/* RIGHT CONTENT — 9/12 */}
      <div style={{ flex: "0 0 75%", maxWidth: "75%" }}>

        {/* Canvas */}
        <div
          id="printableArea"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #333",
            borderRadius: 8,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
            <Layer>
              {imageObj && (
                <KonvaImage
                  image={imageObj}
                  x={imagePosition.x}
                  y={imagePosition.y}
                  width={imageObj.width * imageScale}
                  height={imageObj.height * imageScale}
                  draggable
                  dragBoundFunc={(pos) => clampPosition(pos.x, pos.y)}
                  onDragEnd={(e) => {
                    setImagePosition({ x: e.target.x(), y: e.target.y() });
                  }}
                />
              )}
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
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points.map((p, idx) =>
                    idx % 2 === 0
                      ? p * imageScale + imagePosition.x
                      : p * imageScale + imagePosition.y
                  )}
                  stroke={line.stroke}
                  strokeWidth={3}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              ))}
            </Layer>
          </Stage>
        </div>

        {/* Frames */}
        <Frames onSelectFrame={(imgSrc) => loadFrame(imgSrc)} orientation={orientation} />

      </div>

    </div>
  );
};

export default ImageEditorKonva;