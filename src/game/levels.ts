import type { Cell, FlatPath, Level, Segment } from "./types";

/** Straight orthogonal run of cells, inclusive of both ends. */
function run(from: Cell, to: Cell): Cell[] {
  const cells: Cell[] = [];
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  if (dx !== 0 && dy !== 0) throw new Error("runs must be orthogonal");
  let { x, y } = from;
  cells.push({ x, y });
  while (x !== to.x || y !== to.y) {
    x += dx;
    y += dy;
    cells.push({ x, y });
  }
  return cells;
}

/** Build a segment from a list of corner points (elbow path). */
function seg(color: string, ...corners: [number, number][]): Segment {
  const pts = corners.map(([x, y]) => ({ x, y }));
  const cells: Cell[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const part = run(pts[i]!, pts[i + 1]!);
    if (i > 0) part.shift();
    cells.push(...part);
  }
  return { color, cells };
}

const CYCLE = ["rose", "amber", "teal", "indigo", "plum"] as const;

/**
 * Build a whole level from a list of corner waypoints: each leg between two
 * corners becomes its own colour segment, cycling through the palette.
 */
function level(
  id: number,
  name: string,
  cols: number,
  rows: number,
  time: number,
  waypoints: [number, number][],
  colorOffset = 0,
): Level {
  const segments: Segment[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    segments.push(
      seg(CYCLE[(i + colorOffset) % CYCLE.length]!, waypoints[i]!, waypoints[i + 1]!),
    );
  }
  return { id, name, cols, rows, time, segments };
}

export const LEVELS: Level[] = [

  {
    id: 1,
    name: "First Thread",
    cols: 6,
    rows: 9,
    time: 75,
    segments: [
      seg("rose", [1, 8], [1, 5]),
      seg("amber", [1, 5], [4, 5]),
      seg("teal", [4, 5], [4, 2]),
      seg("indigo", [4, 2], [1, 2]),
    ],
  },
  {
    id: 2,
    name: "Switchback",
    cols: 7,
    rows: 10,
    time: 90,
    segments: [
      seg("teal", [0, 9], [0, 7], [3, 7]),
      seg("rose", [3, 7], [3, 4]),
      seg("amber", [3, 4], [6, 4], [6, 1]),
      seg("indigo", [6, 1], [2, 1]),
      seg("plum", [2, 1], [2, 3]),
    ],
  },
  {
    id: 3,
    name: "Spiral Bloom",
    cols: 8,
    rows: 11,
    time: 110,
    segments: [
      seg("amber", [1, 10], [1, 8], [6, 8]),
      seg("plum", [6, 8], [6, 5]),
      seg("teal", [6, 5], [2, 5], [2, 3]),
      seg("rose", [2, 3], [5, 3]),
      seg("indigo", [5, 3], [5, 1], [0, 1]),
    ],
  },
  level(4, "Ladder Light", 7, 10, 100, [
    [0, 9], [5, 9], [5, 7], [1, 7], [1, 5], [6, 5], [6, 3], [2, 3], [2, 1], [0, 1],
  ]),
  level(5, "Undertow", 7, 10, 100, [
    [6, 9], [1, 9], [1, 7], [5, 7], [5, 5], [0, 5], [0, 3], [4, 3], [4, 1], [6, 1],
  ], 2),
  level(6, "Copper Coil", 8, 11, 125, [
    [0, 10], [7, 10], [7, 1], [1, 1], [1, 8], [5, 8], [5, 3], [3, 3], [3, 6],
  ], 1),
  level(7, "Weaver's Knot", 8, 11, 125, [
    [2, 10], [2, 8], [6, 8], [6, 10], [7, 10], [7, 6], [0, 6], [0, 3], [5, 3], [5, 1], [1, 1],
  ], 3),
  level(8, "Paper Lantern", 8, 12, 135, [
    [0, 11], [0, 9], [4, 9], [4, 11], [7, 11], [7, 7], [1, 7], [1, 5], [6, 5], [6, 2], [2, 2],
  ]),
  level(9, "Riverbed", 8, 12, 140, [
    [7, 11], [3, 11], [3, 9], [7, 9], [7, 7], [1, 7], [1, 10], [0, 10], [0, 4], [5, 4], [5, 6], [2, 6],
  ], 4),
  level(10, "Hourglass", 9, 12, 150, [
    [8, 11], [4, 11], [4, 9], [8, 9], [8, 6], [2, 6], [2, 10], [0, 10], [0, 3], [6, 3], [6, 1], [1, 1],
  ], 2),
  level(11, "Meander", 9, 13, 155, [
    [1, 12], [1, 10], [7, 10], [7, 12], [8, 12], [8, 8], [0, 8], [0, 6], [8, 6], [8, 4], [0, 4], [0, 2], [6, 2],
  ], 1),
  level(12, "Kite String", 9, 13, 155, [
    [0, 12], [6, 12], [6, 10], [2, 10], [2, 8], [8, 8], [8, 5], [1, 5], [1, 3], [7, 3], [7, 1], [3, 1],
  ], 3),
  level(13, "Trellis", 9, 13, 160, [
    [4, 12], [4, 10], [0, 10], [0, 7], [6, 7], [6, 9], [8, 9], [8, 3], [2, 3], [2, 5], [5, 5],
  ]),
  level(14, "Cascade", 9, 14, 175, [
    [8, 13], [2, 13], [2, 11], [7, 11], [7, 9], [1, 9], [1, 7], [8, 7], [8, 5], [0, 5], [0, 2], [5, 2], [5, 4],
  ], 4),
  level(15, "Bramble", 9, 14, 180, [
    [0, 13], [0, 11], [5, 11], [5, 13], [8, 13], [8, 9], [2, 9], [2, 7], [8, 7], [8, 4], [1, 4], [1, 2], [6, 2],
  ], 2),
  level(16, "Nocturne", 10, 14, 195, [
    [0, 13], [9, 13], [9, 1], [1, 1], [1, 11], [7, 11], [7, 3], [3, 3], [3, 9], [5, 9], [5, 5],
  ], 1),
  level(17, "Filigree", 10, 14, 190, [
    [5, 13], [5, 11], [1, 11], [1, 13], [0, 13], [0, 8], [8, 8], [8, 12], [9, 12], [9, 5], [2, 5], [2, 3], [7, 3], [7, 1],
  ], 3),
  level(18, "Loomwork", 10, 15, 210, [
    [9, 14], [3, 14], [3, 12], [8, 12], [8, 10], [2, 10], [2, 8], [9, 8], [9, 6], [1, 6], [1, 4], [8, 4], [8, 2], [0, 2],
  ]),
  level(19, "Deep Weft", 10, 15, 215, [
    [0, 14], [6, 14], [6, 12], [1, 12], [1, 10], [9, 10], [9, 7], [0, 7], [0, 4], [7, 4], [7, 2], [2, 2], [2, 0],
  ], 4),
  level(20, "Tessellate", 10, 15, 220, [
    [0, 14], [9, 14], [9, 2], [2, 2], [2, 12], [7, 12], [7, 4], [4, 4], [4, 10], [6, 10], [6, 6],
  ], 2),
  level(21, "Palimpsest", 10, 16, 240, [
    [9, 15], [0, 15], [0, 13], [8, 13], [8, 11], [1, 11], [1, 9], [9, 9], [9, 6], [2, 6], [2, 4], [8, 4], [8, 2], [1, 2], [1, 0],
  ], 1),
  level(22, "Long Thread", 10, 16, 255, [
    [9, 15], [1, 15], [1, 13], [8, 13], [8, 11], [0, 11], [0, 9], [9, 9], [9, 7], [1, 7], [1, 5], [8, 5], [8, 3], [0, 3], [0, 1], [6, 1],
  ], 3),
  level(23, "The Long Way Home", 10, 16, 270, [
    [0, 15], [9, 15], [9, 1], [1, 1], [1, 13], [7, 13], [7, 3], [3, 3], [3, 11], [5, 11], [5, 5],
  ]),
];

export function flatten(level: Level): FlatPath {
  const cells: Cell[] = [];
  const colors: string[] = [];
  const segmentOf: number[] = [];
  const segmentStart: number[] = [];

  level.segments.forEach((s, si) => {
    const part = si === 0 ? s.cells : s.cells.slice(1);
    segmentStart.push(cells.length === 0 ? 0 : cells.length - 1);
    part.forEach((c) => {
      cells.push(c);
      colors.push(s.color);
      segmentOf.push(si);
    });
  });

  return { cells, colors, segmentOf, segmentStart };
}

export function sameCell(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}
