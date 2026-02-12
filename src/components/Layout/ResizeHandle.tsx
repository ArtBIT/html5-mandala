import { useEffect, useRef, useState } from 'react';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({ direction, onResize, className = '' }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef<number>(0);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = direction === 'horizontal'
        ? e.clientX - startPosRef.current
        : e.clientY - startPosRef.current;

      onResize(delta);
      startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        ${direction === 'horizontal'
          ? 'w-1 cursor-ew-resize hover:bg-primary/50'
          : 'h-1 cursor-ns-resize hover:bg-primary/50'
        }
        ${isDragging ? 'bg-primary' : 'bg-transparent'}
        transition-colors
        ${className}
      `}
    />
  );
}
