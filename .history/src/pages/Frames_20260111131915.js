export default function Frames() {
    return
    <div>
        
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
        
    </div>
    
}

