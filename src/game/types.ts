export type Cell = { x: number; y: number };

/** A single-colour stretch of the maze path. Consecutive segments share a cell. */
export type Segment = {
  /** key into the maze palette, e.g. "rose" */
  color: string;
  cells: Cell[];
};

export type Level = {
  id: number;
  name: string;
  cols: number;
  rows: number;
  /** seconds allowed for the level */
  time: number;
  segments: Segment[];
};

export type FlatPath = {
  cells: Cell[];
  /** colour key per cell index (colour of the segment the cell *leaves* on) */
  colors: string[];
  /** segment index per cell index */
  segmentOf: number[];
  /** index in `cells` where each segment starts */
  segmentStart: number[];
};

export type GameStatus = "playing" | "complete" | "gameover";
