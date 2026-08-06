import { useCallback, useEffect, useRef } from "react";
import { computeLayout, draw, pointToCell, readPalette, type Palette } from "@/game/renderer";
import type { Cell, FlatPath, Level } from "@/game/types";

type Props = {
  level: Level;
  path: FlatPath;
  progress: number;
  zoom: number;
  hint: boolean;
  errorAt: number;
  frozen: boolean;
  onVisit: (cell: Cell) => void;
};

export function GameCanvas({
  level,
  path,
  progress,
  zoom,
  hint,
  errorAt,
  frozen,
  onVisit,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette | null>(null);
  const dragging = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0 });

  const state = useRef({ level, path, progress, zoom, hint, errorAt, frozen });
  state.current = { level, path, progress, zoom, hint, errorAt, frozen };

  const visitRef = useRef(onVisit);
  visitRef.current = onVisit;

  // render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    paletteRef.current = readPalette(document.documentElement);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    const loop = (t: number) => {
      const s = state.current;
      const { w, h } = sizeRef.current;
      const palette = paletteRef.current;
      if (palette && w > 0 && h > 0) {
        const elapsed = Date.now() - s.errorAt;
        draw(ctx, {
          level: s.level,
          path: s.path,
          progress: s.progress,
          layout: computeLayout(w, h, s.level, s.zoom),
          palette,
          width: w,
          height: h,
          time: t,
          hint: s.hint,
          errorFlash: elapsed < 500 ? 1 - elapsed / 500 : 0,
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const cellAt = useCallback((clientX: number, clientY: number): Cell | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { w, h } = sizeRef.current;
    const layout = computeLayout(w, h, state.current.level, state.current.zoom);
    return pointToCell(clientX - rect.left, clientY - rect.top, layout);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (state.current.frozen) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    const c = cellAt(e.clientX, e.clientY);
    if (c) visitRef.current(c);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || state.current.frozen) return;
    const c = cellAt(e.clientX, e.clientY);
    if (c) visitRef.current(c);
  };

  const endDrag = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full touch-none overflow-hidden rounded-3xl bg-card shadow-lift"
    >
      <canvas
        ref={canvasRef}
        role="application"
        aria-label={`Maze board for level ${level.id}, ${progress} of ${path.cells.length - 1} steps traced`}
        className="block h-full w-full"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      />
    </div>
  );
}
