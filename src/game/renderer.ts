import type { Cell, FlatPath, Level } from "./types";

export type Layout = { cell: number; ox: number; oy: number };
export type Palette = Record<string, string> & {
  bg: string;
  grid: string;
  track: string;
  ink: string;
};

export const PALETTE_KEYS = ["rose", "amber", "teal", "indigo", "plum"] as const;

export function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  const p: Record<string, string> = {
    bg: v("--board"),
    grid: v("--board-grid"),
    track: v("--board-track"),
    ink: v("--foreground"),
  };
  for (const k of PALETTE_KEYS) p[k] = v(`--maze-${k}`);
  return p as Palette;
}

export function computeLayout(
  width: number,
  height: number,
  level: Level,
  zoom: number,
): Layout {
  const pad = 18;
  const base = Math.min(
    (width - pad * 2) / level.cols,
    (height - pad * 2) / level.rows,
  );
  const cell = base * zoom;
  return {
    cell,
    ox: width / 2 - (level.cols * cell) / 2,
    oy: height / 2 - (level.rows * cell) / 2,
  };
}

export function cellCenter(c: Cell, l: Layout) {
  return { x: l.ox + (c.x + 0.5) * l.cell, y: l.oy + (c.y + 0.5) * l.cell };
}

export function pointToCell(px: number, py: number, l: Layout): Cell {
  return {
    x: Math.floor((px - l.ox) / l.cell),
    y: Math.floor((py - l.oy) / l.cell),
  };
}

function polyline(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
}

function chevron(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number },
  dir: { x: number; y: number },
  size: number,
  color: string,
  alpha: number,
) {
  const a = Math.atan2(dir.y, dir.x);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(a);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.6, size * 0.22);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -size * 0.42);
  ctx.lineTo(size * 0.3, 0);
  ctx.lineTo(-size * 0.35, size * 0.42);
  ctx.stroke();
  ctx.restore();
}

export type Scene = {
  level: Level;
  path: FlatPath;
  progress: number;
  layout: Layout;
  palette: Palette;
  width: number;
  height: number;
  time: number;
  hint: boolean;
  errorFlash: number; // 0..1
};

export function draw(ctx: CanvasRenderingContext2D, s: Scene) {
  const { layout: l, palette: p, path, level } = s;
  const w = l.cell * 0.6;

  ctx.clearRect(0, 0, s.width, s.height);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, s.width, s.height);

  // grid dots
  ctx.fillStyle = p.grid;
  for (let y = 0; y <= level.rows; y++) {
    for (let x = 0; x <= level.cols; x++) {
      ctx.beginPath();
      ctx.arc(l.ox + x * l.cell, l.oy + y * l.cell, Math.max(0.8, l.cell * 0.028), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const pts = path.cells.map((c) => cellCenter(c, l));

  // track (unsolved path)
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = p.track;
  ctx.lineWidth = w + Math.max(3, l.cell * 0.1);
  polyline(ctx, pts);
  ctx.stroke();

  ctx.strokeStyle = p.bg;
  ctx.lineWidth = w;
  polyline(ctx, pts);
  ctx.stroke();

  // colour hints of each segment (faint)
  level.segments.forEach((seg, si) => {
    const idx = pts.map((_, i) => i).filter((i) => path.segmentOf[i] === si);
    if (idx.length < 1) return;
    const start = Math.max(0, idx[0]! - 1);
    const sub = pts.slice(start, idx[idx.length - 1]! + 1);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = p[seg.color] ?? p.ink;
    ctx.lineWidth = w;
    polyline(ctx, sub);
    ctx.stroke();
    ctx.restore();
  });

  // solved trail
  if (s.progress > 0) {
    for (let i = 0; i < s.progress; i++) {
      const key = path.colors[i + 1] ?? path.colors[i]!;
      ctx.strokeStyle = p[key] ?? p.ink;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(pts[i]!.x, pts[i]!.y);
      ctx.lineTo(pts[i + 1]!.x, pts[i + 1]!.y);
      ctx.stroke();
    }
  }

  // direction chevrons
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const done = i < s.progress;
    const key = path.colors[i + 1] ?? path.colors[i]!;
    chevron(
      ctx,
      { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      { x: b.x - a.x, y: b.y - a.y },
      l.cell * 0.3,
      done ? p.bg : p[key] ?? p.ink,
      done ? 0.85 : 0.45,
    );
  }

  // start marker
  const start = pts[0]!;
  ctx.fillStyle = p[path.colors[0]!] ?? p.ink;
  ctx.beginPath();
  ctx.arc(start.x, start.y, w * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // goal marker
  const end = pts[pts.length - 1]!;
  const goalDone = s.progress >= pts.length - 1;
  ctx.save();
  ctx.translate(end.x, end.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = goalDone ? p[path.colors[pts.length - 1]!] ?? p.ink : p.track;
  const r = w * 0.34;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();

  // head puck
  const head = pts[Math.min(s.progress, pts.length - 1)]!;
  const pulse = 1 + Math.sin(s.time / 260) * 0.06;
  const headColor = p[path.colors[Math.min(s.progress, pts.length - 1)]!] ?? p.ink;
  ctx.save();
  ctx.shadowColor = headColor;
  ctx.shadowBlur = l.cell * 0.35;
  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(head.x, head.y, w * 0.36 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = p.bg;
  ctx.beginPath();
  ctx.arc(head.x, head.y, w * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // hint ring on next cell
  if (s.hint && s.progress < pts.length - 1) {
    const next = pts[s.progress + 1]!;
    const t = (s.time / 700) % 1;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(next.x, next.y, l.cell * (0.25 + t * 0.4), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // error flash on head
  if (s.errorFlash > 0) {
    ctx.save();
    ctx.globalAlpha = s.errorFlash;
    ctx.strokeStyle = p['rose'] ?? p.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(head.x, head.y, l.cell * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
