import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LEVELS, flatten, sameCell } from "./levels";
import type { Cell, GameStatus } from "./types";

const MAX_LIVES = 3;
const HINTS_PER_LEVEL = 3;

export function useMazeGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [hints, setHints] = useState(HINTS_PER_LEVEL);
  const [hintOn, setHintOn] = useState(false);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [zoom, setZoom] = useState(1);
  const [errorAt, setErrorAt] = useState(0);

  const level = LEVELS[Math.min(levelIndex, LEVELS.length - 1)]!;
  const path = useMemo(() => flatten(level), [level]);
  const [timeLeft, setTimeLeft] = useState(level.time);

  // countdown
  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setStatus("gameover");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const resetLevel = useCallback(
    (index: number) => {
      const lv = LEVELS[Math.min(index, LEVELS.length - 1)]!;
      setLevelIndex(index);
      setProgress(0);
      setHints(HINTS_PER_LEVEL);
      setHintOn(false);
      setTimeLeft(lv.time);
      setStatus("playing");
    },
    [],
  );

  const restart = useCallback(() => {
    setLives(MAX_LIVES);
    resetLevel(0);
  }, [resetLevel]);

  const retryLevel = useCallback(() => {
    setLives(MAX_LIVES);
    resetLevel(levelIndex);
  }, [levelIndex, resetLevel]);

  const nextLevel = useCallback(() => {
    if (levelIndex + 1 < LEVELS.length) resetLevel(levelIndex + 1);
    else restart();
  }, [levelIndex, resetLevel, restart]);

  /** Called with the grid cell currently under the pointer while dragging. */
  const visit = useCallback(
    (cell: Cell) => {
      if (status !== "playing") return;
      const cells = path.cells;
      if (progress >= cells.length - 1) return;

      if (sameCell(cell, cells[progress]!)) return;

      const next = cells[progress + 1]!;
      if (sameCell(cell, next)) {
        const p = progress + 1;
        setProgress(p);
        setHintOn(false);
        if (p >= cells.length - 1) setStatus("complete");
        return;
      }

      if (progress > 0 && sameCell(cell, cells[progress - 1]!)) {
        setProgress(progress - 1);
        return;
      }

      // out of bounds cells are ignored, in-board wrong cells cost a life
      if (cell.x < 0 || cell.y < 0 || cell.x >= level.cols || cell.y >= level.rows) return;
      if (Date.now() - errorAt < 700) return;

      setErrorAt(Date.now());
      setProgress(path.segmentStart[path.segmentOf[progress]!] ?? 0);
      setLives((l) => {
        const left = l - 1;
        if (left <= 0) setStatus("gameover");
        return Math.max(0, left);
      });
    },
    [errorAt, level.cols, level.rows, path, progress, status],
  );

  const useHint = useCallback(() => {
    if (status !== "playing" || hints <= 0 || hintOn) return;
    setHints((h) => h - 1);
    setHintOn(true);
    window.setTimeout(() => setHintOn(false), 2500);
  }, [hintOn, hints, status]);

  return {
    level,
    levelIndex,
    levelCount: LEVELS.length,
    path,
    progress,
    lives,
    maxLives: MAX_LIVES,
    hints,
    hintOn,
    status,
    timeLeft,
    zoom,
    errorAt,
    setZoom,
    visit,
    useHint,
    restart,
    retryLevel,
    nextLevel,
  };
}
