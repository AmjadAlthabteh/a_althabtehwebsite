import { useEffect, useState } from 'react';
import './FloatingShapes.css';

interface Shape {
  id: number;
  type: 'square' | 'circle' | 'line';
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const FloatingShapes = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    const generatedShapes: Shape[] = [];
    const shapeTypes: ('square' | 'circle' | 'line')[] = ['square', 'circle', 'line'];

    for (let i = 0; i < 12; i++) {
      generatedShapes.push({
        id: i,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        size: Math.random() * 60 + 20,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
      });
    }

    setShapes(generatedShapes);
  }, []);

  return (
    <div className="floating-shapes">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`shape shape-${shape.type}`}
          style={{
            width: shape.type === 'line' ? `${shape.size * 2}px` : `${shape.size}px`,
            height: shape.type === 'line' ? '2px' : `${shape.size}px`,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            animationDuration: `${shape.duration}s`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;
