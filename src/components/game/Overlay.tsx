import { ArrowRight, RotateCcw, Sparkles, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameStatus } from "@/game/types";

type Props = {
  status: GameStatus;
  levelName: string;
  levelIndex: number;
  levelCount: number;
  timeLeft: number;
  onNext: () => void;
  onRetry: () => void;
};

export function Overlay({
  status,
  levelName,
  levelIndex,
  levelCount,
  timeLeft,
  onNext,
  onRetry,
}: Props) {
  if (status === "playing") return null;
  const won = status === "complete";
  const last = levelIndex + 1 >= levelCount;

  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-background/70 p-6 backdrop-blur-sm">
      <div className="animate-pop-in w-full max-w-xs rounded-3xl bg-card p-6 text-center shadow-lift">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent">
          {won ? (
            <Sparkles className="h-6 w-6 text-primary" />
          ) : (
            <Skull className="h-6 w-6 text-destructive" />
          )}
        </div>

        <h2 className="mt-4 text-display text-2xl font-semibold">
          {won ? "Thread complete" : "Out of thread"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {won
            ? `${levelName} solved with ${timeLeft}s to spare.`
            : "You ran out of lives or time. Give it another pass."}
        </p>

        <div className="mt-6 space-y-2">
          {won ? (
            <Button className="h-12 w-full rounded-full font-semibold" onClick={onNext}>
              {last ? "Play again" : "Next level"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="h-12 w-full rounded-full font-semibold" onClick={onRetry}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Try again
            </Button>
          )}
          {won && (
            <Button
              variant="ghost"
              className="h-11 w-full rounded-full text-muted-foreground"
              onClick={onRetry}
            >
              Replay level
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
