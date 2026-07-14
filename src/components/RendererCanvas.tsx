import { useRef } from 'react';
import { useRenderer } from '@/hooks/useRenderer';

export function RendererCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handlers = useRenderer(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
      {...handlers}
    />
  );
}
