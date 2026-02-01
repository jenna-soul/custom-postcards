import React, { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Rect } from "react-konva";
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from "react";

const ImageEditorKonva = () => {

  const [imageObj, setImageObj] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [lines, setLines] = useState([]);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const isDrawing = useRef(false);

  // For zoom limits
  const MAX_SCALE = 3;

  //Frame Logic
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

  //End Frame Logic

  //Scale Logic

  const POSTCARD_SIZES = {
  portrait: { width: 400, height: 600 },  // 4x6
  landscape: { width: 600, height: 400 }  // 6x4
};

const [orientation, setOrientation] = useState("landscape");

const CANVAS_WIDTH = POSTCARD_SIZES[orientation].width;
  const CANVAS_HEIGHT = POSTCARD_SIZES[orientation].height;
  
const fitImageToFrame = (img) => {
  const scaleX = CANVAS_WIDTH / img.width;
  const scaleY = CANVAS_HEIGHT / img.height;

  // IMPORTANT: use MAX here (cover behavior)
  const scale = Math.max(scaleX, scaleY);

  const x = (CANVAS_WIDTH - img.width * scale) / 2;
  const y = (CANVAS_HEIGHT - img.height * scale) / 2;

  setImageScale(scale);
  setImagePosition({ x, y });
  };
  useEffect(() => {
  if (imageObj) {
    fitImageToFrame(imageObj);
  }
  }, [orientation]);
  

  const getMinCoverScale = () => {
  if (!imageObj) return 1;
  return Math.max(
    CANVAS_WIDTH / imageObj.width,
    CANVAS_HEIGHT / imageObj.height
  );
  };
  
  //End Scale Logic


  //Start Image Movement logic
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
  //End image movement logic

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

  // Zoom handlers

  const zoom = (direction) => {
  if (!imageObj) return;

  const minScale = getMinCoverScale();
  const factor = direction === "in" ? 1.2 : 1 / 1.2;

  setImageScale(prev => {
    const next = Math.max(
      minScale,
      Math.min(prev * factor, MAX_SCALE)
    );

    const x = (CANVAS_WIDTH - imageObj.width * next) / 2;
    const y = (CANVAS_HEIGHT - imageObj.height * next) / 2;

    setImagePosition({ x, y });
    return next;
  });
};
  //End zoom handler
  
  // Adjust position to keep image centered on zoom
  const updatePosition = (newScale) => {
    if (!imageObj) return;
    const x = (CANVAS_WIDTH - imageObj.width * newScale) / 2;
    const y = (CANVAS_HEIGHT - imageObj.height * newScale) / 2;
    setImagePosition({ x, y });
  };

  // Draw handlers: store/unstore points in unscaled coordinates to keep lines consistent with zoom
  const handleMouseDown = (e) => {
    if (e.target.className === "Image") return;
    if (!imageObj) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const unscaledX = (pos.x - imagePosition.x) / imageScale;
    const unscaledY = (pos.y - imagePosition.y) / imageScale;
    setLines([...lines, { points: [unscaledX, unscaledY], stroke: strokeColor }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !imageObj) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const unscaledX = (pos.x - imagePosition.x) / imageScale;
    const unscaledY = (pos.y - imagePosition.y) / imageScale;

    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([unscaledX, unscaledY]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    
    <div style={{ margin: "auto" }}>
      <label htmlFor="file-upload" className="custom-file-upload">
        Upload Image
      </label>
      <input
        id="file-upload"
        className="controls"
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />

      <div style={{ marginTop: 10 }}>
        
      <button
        className="controls"
        onClick={() => {
          setSelectedFrame("white");
          loadFrame(require("./assets/zion_postcard_png.png"));
        }}
      >
        Zion Vertical
      </button>
      <button
        className="controls"
        onClick={() => {
          setSelectedFrame("white");
          loadFrame(require("./assets/zion_postcard_png_h.png"));
        }}
      >
        Zion Horizontal
      </button>
        <label>
          Select color:
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>
        <button
          className="controls"
          onClick={() => {
            setLines([]);
          setSelectedFrame(null);
          loadFrame(null);
        }}
          style={{ cursor: "pointer", marginLeft: 12 }}
        >
          Clear 
        </button>

        <button
          className="controls"
          onClick={() => setLines(lines.slice(0, -1))}
          style={{ cursor: "pointer", marginLeft: 12 }}
          disabled={lines.length === 0}
        >
          Undo Last
        </button>

        {/* Zoom controls */}

        <button className="zoomControls"
        onClick={() => zoom("in")}
        style={{ cursor: "pointer", marginLeft: 12 }}
        disabled={!imageObj || imageScale >= MAX_SCALE}
      >
        <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
      </button>

      <button
          className="zoomControls"
        onClick={() => zoom("out")}
          style={{ cursor: "pointer", marginLeft: 12 }}
          disabled={!imageObj || imageScale <= getMinCoverScale()}
      >
        <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
              </button>
              

        <button
          className="controls"
          onClick={() => window.print()}
          style={{ cursor: "pointer", marginLeft: 12 }}
        >
          Print Postcard
        </button>

      </div>

      <div
        id="printableArea"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
          border: "1px solid black",
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "white",
        }}
      >
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ backgroundColor: "#fff" }}
        >
          <Layer>
            {imageObj && ( //Uploaded image
              <KonvaImage
                image={imageObj}
                x={imagePosition.x}
                y={imagePosition.y}
                width={imageObj.width * imageScale}
                height={imageObj.height * imageScale}
                draggable
                dragBoundFunc={(pos) => clampPosition(pos.x, pos.y)}
                onDragEnd={(e) => {
                  setImagePosition({
                    x: e.target.x(),
                    y: e.target.y()
                  });
                }}
              />
            )}
            
            {frameObj && ( //Frame layer Logic
              <KonvaImage
                image={frameObj}
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                listening={false} // prevents blocking drawing
              />
            )}

            {lines.map((line, i) => ( //User Drawings
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

      <div style={{ marginTop: 10 }}>
      <strong strong>Select Frame:</strong>

      <button
        className="controls"
        onClick={() => {
          setSelectedFrame(null);
          loadFrame(null);
        }}
      >
        None
      </button>

      <button
        className="controls"
        onClick={() => {
          setSelectedFrame("white");
          loadFrame(require("./assets/zion_postcard_png.png"));
        }}
      >
        Zion Vertical
      </button>
      <button
        className="controls"
        onClick={() => {
          setSelectedFrame("white");
          loadFrame(require("./assets/zion_postcard_png_h.png"));
        }}
      >
        Zion Horizontal
      </button>

      </div>
    </div>
  );
};

export default ImageEditorKonva;
