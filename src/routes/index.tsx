import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Controls } from "@/components/game/Controls";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Hud } from "@/components/game/Hud";
import { Overlay } from "@/components/game/Overlay";
import { useMazeGame } from "@/game/useMazeGame";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chroma Thread — Colour Path Maze Puzzle" },
      {
        name: "description",
        content:
          "Trace colourful maze threads with a swipe, follow the arrows, and beat the clock in this handcrafted mobile puzzle game.",
      },
      { property: "og:title", content: "Chroma Thread — Colour Path Maze Puzzle" },
      {
        property: "og:description",
        content:
          "A calm, tactile maze puzzle: swipe along colour threads, follow the arrows, and finish before the timer runs out.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

function Game() {
  const g = useMazeGame();
  const [shake, setShake] = useState(false);
  const lastError = useRef(0);

  useEffect(() => {
    if (!g.errorAt || g.errorAt === lastError.current) return;
    lastError.current = g.errorAt;
    setShake(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(35);
    const id = window.setTimeout(() => setShake(false), 430);
    return () => window.clearTimeout(id);
  }, [g.errorAt]);

  return (
    <main className="paper flex min-h-[100dvh] justify-center bg-background">
      <div className="flex w-full max-w-md flex-col gap-4 px-4 pb-5 pt-5">
        <Hud
          lives={g.lives}
          maxLives={g.maxLives}
          timeLeft={g.timeLeft}
          levelIndex={g.levelIndex}
          levelCount={g.levelCount}
          levelName={g.level.name}
        />

        <section className={cn("relative min-h-0 flex-1", shake && "animate-shake")}>
          <GameCanvas
            level={g.level}
            path={g.path}
            progress={g.progress}
            zoom={g.zoom}
            hint={g.hintOn}
            errorAt={g.errorAt}
            frozen={g.status !== "playing"}
            onVisit={g.visit}
          />
          <Overlay
            status={g.status}
            levelName={g.level.name}
            levelIndex={g.levelIndex}
            levelCount={g.levelCount}
            timeLeft={g.timeLeft}
            onNext={g.nextLevel}
            onRetry={g.retryLevel}
          />
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Swipe from the dot and follow the arrows to the diamond.
        </p>

        <Controls
          zoom={g.zoom}
          hints={g.hints}
          progress={g.progress}
          total={g.path.cells.length - 1}
          onZoom={(d) => g.setZoom((z) => Math.min(1.9, Math.max(0.7, +(z + d).toFixed(2))))}
          onHint={g.useHint}
          onRestart={g.retryLevel}
        />
      </div>
    </main>
  );
}
