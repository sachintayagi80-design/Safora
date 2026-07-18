import type { ReactNode } from 'react';

interface PortholeProps {
  /** Solid color the arc-window sits inside — this color fills all space OUTSIDE the ellipse cutout. */
  bgClassName: string;
  /** Whether the arc bulges toward the top of the section or the bottom. */
  direction: 'up' | 'down';
  children: ReactNode;
  className?: string;
}

/**
 * Recreates the circular "porthole" effect: a solid-color section with a large
 * elliptical window cut into it, revealing photo/content underneath — like looking
 * through a circular opening rather than just a cropped image. The clip-path is
 * applied to the inner content layer so the surrounding `bgClassName` color stays
 * visible as the "frame" around the window.
 */
export default function Porthole({ bgClassName, direction, children, className = '' }: PortholeProps) {
  const clipPath =
    direction === 'up'
      ? 'ellipse(70% 90% at 50% 100%)' // window bulges toward the bottom edge
      : 'ellipse(70% 90% at 50% 0%)'; // window bulges toward the top edge

  return (
    <section className={`relative ${bgClassName} ${className}`}>
      <div className="mx-auto max-w-[1800px] overflow-hidden">
        <div style={{ clipPath, WebkitClipPath: clipPath }}>{children}</div>
      </div>
    </section>
  );
}
