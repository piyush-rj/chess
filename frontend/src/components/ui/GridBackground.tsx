import { cn } from "@/src/lib/utils";
import React from "react";

export function GridBackgroundDemo() {
    return (
        <div className="relative flex h-full w-full items-center justify-center ">
            <div
                className={cn(
                    "absolute inset-0",
                    "[background-size:70px_70px]",
                    "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                    "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
                )}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)] bg-black"></div>
            
        </div>
    );
}
