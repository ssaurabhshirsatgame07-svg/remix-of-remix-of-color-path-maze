import { Heart, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  lives: number;
  maxLives: number;
  timeLeft: number;
  levelIndex: number;
  levelCount: number;
  levelName: string;
};

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Hud({ lives, maxLives, timeLeft, levelIndex, levelCount, levelName }: Props) {
  const low = timeLeft <= 15;

  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-1">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card text-display text-lg font-semibold shadow-soft">
          {levelIndex + 1}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Level {levelIndex + 1} / {levelCount}
          </p>
          <h1 className="truncate text-display text-xl font-semibold">{levelName}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-sm font-semibold tabular-nums shadow-soft",
            low && "text-destructive",
          )}
        >
          <Timer className="h-4 w-4" aria-hidden />
          <span aria-label="time remaining">{fmt(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-card px-3 py-2 shadow-soft">
          {Array.from({ length: maxLives }).map((_, i) => {
            const alive = i < lives;
            return (
              <Heart
                key={i}
                aria-hidden
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  alive
                    ? "fill-maze-rose text-maze-rose"
                    : "scale-90 text-muted-foreground/50",
                )}
              />
            );
          })}
          <span className="sr-only">{lives} lives remaining</span>
        </div>
      </div>
    </header>
  );
}
