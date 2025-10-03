import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center group [&_*]:[-webkit-appearance:none] [&_*]:[-moz-appearance:textfield] [&_*::-webkit-outer-spin-button]:hidden [&_*::-webkit-inner-spin-button]:hidden", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-muted border border-border [&::after]:hidden [&::before]:hidden [&_*::-webkit-outer-spin-button]:hidden [&_*::-webkit-inner-spin-button]:hidden [&_*]:[-webkit-appearance:none]">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary to-primary-glow rounded-full [&_*::-webkit-outer-spin-button]:hidden [&_*::-webkit-inner-spin-button]:hidden" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-3 border-background bg-gradient-to-br from-primary to-primary-glow shadow-lg ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:shadow-xl hover:shadow-primary/30 active:scale-105 cursor-grab active:cursor-grabbing [&::after]:hidden [&::before]:hidden [&_*::-webkit-outer-spin-button]:hidden [&_*::-webkit-inner-spin-button]:hidden [&_*]:[-webkit-appearance:none]" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
