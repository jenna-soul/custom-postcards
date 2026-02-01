export default function Frames() {
    return
    <div>
        
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
                    ))
                  </Layer>
        
        
                </Stage>
    </div>
    
}

