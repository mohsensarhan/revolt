import * as React from "react";
import { cn } from "@/lib/utils";

type PageGridProps = React.PropsWithChildren<{
  /** default column count (CSS var --cols). Can be overridden with utility like lg:[--cols:4] */
  cols?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements; // e.g., 'section' | 'div' | 'main'
}>;

/**
 * Structural grid that consumes the global tokens:
 *  --rowHpx  -> grid-auto-rows
 *  --gappx   -> gap
 *  --cols    -> grid-template-columns (fallbacks to `cols` prop then 12)
 *
 * RESPONSIVE BEHAVIOR:
 *  - On mobile (< 640px): 4-col and 3-col grids automatically become 2-col
 *  - On tablet (< 1024px): 4-col and 3-col grids automatically become 2-col
 *  - On desktop (>= 1024px): Uses the specified `cols` value
 *
 * This ensures charts and data visualizations remain readable on all screen sizes.
 */
export function PageGrid({ cols = 12, className, as = "div", children }: PageGridProps) {
  const Comp = as as React.ElementType;
  return (
    <Comp
      className={cn("page-grid", className)}
      style={{ ["--cols" as any]: String(cols) }}
    >
      {children}
    </Comp>
  );
}
