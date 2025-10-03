import { useEffect } from "react";

export function useAutoGrid(
  rowsMap: [number, number][] = [
    [2560, 6], // 4K displays: 6 rows
    [1920, 5], // Full HD: 5 rows  
    [1440, 4], // Laptop: 4 rows
    [1024, 3], // Tablet: 3 rows
    [768, 2],  // Mobile landscape: 2 rows
  ],
  gapMin = 8,
  gapMax = 24
) {
  const apply = () => {
    const w = window.innerWidth;
    const vh = Number(
      getComputedStyle(document.documentElement).getPropertyValue("--vhAvailPx")
    ) || window.innerHeight;
    
    // Determine optimal rows based on screen width
    const rows = (rowsMap.find(([minW]) => w >= minW)?.[1]) ?? 2;

    // Calculate optimal row height and gap
    // Start with minimum gap, calculate row height, then optimize gap
    let gap = gapMin;
    let rowH = Math.floor((vh - (rows - 1) * gap) / rows);
    
    // Recalculate gap based on remaining space
    gap = (vh - rows * rowH) / Math.max(1, rows - 1);
    gap = Math.max(gapMin, Math.min(gapMax, gap));
    
    // Final row height calculation
    rowH = Math.floor((vh - (rows - 1) * gap) / rows);

    // Set CSS variables
    const root = document.documentElement.style;
    root.setProperty("--rows", String(rows));
    root.setProperty("--rowHpx", `${rowH}px`);
    root.setProperty("--gappx", `${Math.floor(gap)}px`);
  };

  useEffect(() => {
    const ro = new ResizeObserver(() => requestAnimationFrame(apply));
    ro.observe(document.documentElement);
    
    window.addEventListener("resize", apply, { passive: true });
    apply();
    
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);
}