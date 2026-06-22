import React from 'react';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';


const URLImage = ({ src, ...rest }) => {
  const [image] = useImage(src, 'anonymous');
  return <Image image={image} {...rest} />;
};


export default function Zion() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <URLImage src="https://konvajs.org/assets/yoda.jpg" x={150} />
      </Layer>
    </Stage>
  );
}
