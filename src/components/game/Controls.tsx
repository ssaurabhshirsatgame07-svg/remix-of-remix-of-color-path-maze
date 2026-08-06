import { Lightbulb, Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  zoom: number;
  hints: number;
  progress: number;
  total: number;
  onZoom: (delta: number) => void;
  onHint: () => void;
  onRestart: () => void;
};

export function Controls({ zoom, hints, progress, total, onZoom, onHint, onRestart }: Props) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-card p-1 shadow-soft">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => onZoom(-0.15)}
            disabled={zoom <= 0.7}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-xs font-semibold tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => onZoom(0.15)}
            disabled={zoom >= 1.9}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          className="h-12 w-full rounded-full text-sm font-semibold shadow-soft"
          onClick={onHint}
          disabled={hints <= 0}
        >
          <Lightbulb className="mr-1 h-4 w-4" />
          Hint
          <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs tabular-nums">
            {hints}
          </span>
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full shadow-soft"
          onClick={onRestart}
          aria-label="Restart level"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
