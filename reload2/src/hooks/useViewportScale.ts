import { useEffect, useRef, useState } from "react";

// Helper function to get available height accounting for mobile browsers and safe areas
const getAvailHeight = (headerEl: HTMLElement | null) => {
  const vv = (window as any).visualViewport;
  const rawH = vv?.height ?? window.innerHeight;
  const hh = headerEl?.getBoundingClientRect().height ?? 0;
  
  // Subtract safe areas (iOS notch, etc.)
  const cs = getComputedStyle(document.documentElement);
  const safeTop = parseFloat(cs.getPropertyValue("--sat") || "0");
  const safeBot = parseFloat(cs.getPropertyValue("--sab") || "0");
  
  return Math.max(0, rawH - hh - safeTop - safeBot);
};

export function useViewportScale(
  headerRef: React.RefObject<HTMLElement>,
  baseW = 1920, // Changed from 3840 to 1920 for better dashboard scaling
  baseH = 1080, // Changed from 2160 to 1080 for better dashboard scaling  
  min = 0.7,
  max = 1.8 // Reduced max scale for readability
) {
  const [scale, setScale] = useState(1);
  const raf = useRef<number>();

  const apply = () => {
    const vw = window.innerWidth;
    const vhAvail = getAvailHeight(headerRef.current);
    const fitW = vw / baseW;
    const fitH = vhAvail / baseH;
    const s = Math.max(min, Math.min(max, Math.min(fitW, fitH)));
    
    // Set CSS variables for unified scaling
    const root = document.documentElement.style;
    root.setProperty("--scale", String(s));
    root.setProperty("--vhAvailPx", String(Math.floor(vhAvail)));
    root.setProperty("--u", `calc(1rem * ${s})`);
    
    setScale(s);
  };

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(apply);
    });
    
    ro.observe(document.documentElement);
    if (headerRef.current) ro.observe(headerRef.current);
    
    // Handle mobile viewport changes
    const visualViewport = (window as any).visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener("resize", apply);
    }
    
    // Initial application
    apply();
    
    return () => {
      ro.disconnect();
      if (visualViewport) {
        visualViewport.removeEventListener("resize", apply);
      }
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, []);

  return scale;
}