import { useMemo } from "react";
import { cn } from "../../utils/cn";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export default function Meteors({ number = 20, className }: MeteorsProps) {
  const meteorStyles = useMemo<Array<React.CSSProperties>>(
    () =>
      Array.from({ length: number }, (_, idx) => ({
        top: -10,
        left: `${((idx * 173 + 47) % 800) - 100}px`,
        animationDelay: `${(((idx * 37) % 10) * 0.1 + 0.2).toFixed(2)}s`,
        animationDuration: `${((idx * 29) % 8) + 3}s`,
      })),
    [number]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteorStyles.map((style, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-amber-400 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-amber-400 before:to-transparent",
            className
          )}
          style={style}
        />
      ))}
    </div>
  );
}
